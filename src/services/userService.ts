import { isSportKey } from "../data/sports";
import type { Failed, Ok } from "../types/result";
import type { SportKey } from "../types/session";
import type { UserProfile } from "../types/user";
import { supabase } from "./supabaseClient";

// Profilzugriff über NB-03 (S1.4 `profilAktualisieren`,
// `sportpraeferenzSetzen`/`-Entfernen`) und die Nutzerkennung aus NB-02 —
// der NB-02-Ausschnitt, den ADR-002 ausdrücklich der Service-Schicht zuordnet.
//
// Das eigene Profil kommt über die RPC `my_profile()`: N2.2 gibt von fremden
// Profilen nur `display_name` und `avatar_url` frei, `city` bleibt der eigenen
// Ortsvorbelegung vorbehalten. Ein Spalten-GRANT kann „eigene Zeile ganz,
// fremde Zeile teilweise" nicht ausdrücken, deshalb die gekapselte Funktion
// (siehe supabase/migrations/…_hardening.sql).

export interface UpdateProfileInput {
  name: string;
  city: string;
  preferredSports: SportKey[];
}

export type LoadProfileResult = Ok<UserProfile> | Failed;
export type UpdateProfileResult = Ok<UserProfile> | Failed;

interface MyProfileRow {
  user_id: string;
  display_name: string;
  city: string | null;
  avatar_url: string | null;
}

// Übergangslösung: `sessionService` arbeitet noch synchron auf Mockdaten und
// braucht die aktuelle Nutzerkennung. Bis es auf die RPCs umgestellt ist, hält
// dieses Modul das zuletzt geladene Profil. Entfällt mit dieser Umstellung.
let cachedProfile: UserProfile | null = null;

/** Zuletzt geladenes Profil, oder `null`, wenn niemand angemeldet ist. */
export function getCurrentUser(): UserProfile | null {
  return cachedProfile
    ? { ...cachedProfile, preferredSports: [...cachedProfile.preferredSports] }
    : null;
}

/**
 * Lädt Profil und Sportpräferenzen des angemeldeten Nutzers (UC-12).
 * Die E-Mail stammt aus der Auth-Sitzung; sie ist kein D1-Attribut (D1.4).
 */
export async function loadCurrentProfile(
  email: string,
): Promise<LoadProfileResult> {
  const [profileResponse, preferenceResponse] = await Promise.all([
    supabase.rpc("my_profile"),
    supabase.from("sport_preference").select("sport_id, sport(key)"),
  ]);

  if (profileResponse.error || preferenceResponse.error) {
    return {
      kind: "failed",
      cause: profileResponse.error ?? preferenceResponse.error,
    };
  }

  const row = (profileResponse.data as MyProfileRow[] | null)?.[0];

  if (!row) {
    // Ohne Anmeldung liefert my_profile() keine Zeile - kein technischer
    // Fehler, sondern schlicht kein Profil.
    return { kind: "failed", cause: "Kein Profil für die aktuelle Sitzung" };
  }

  // PostgREST liefert eingebettete Beziehungen je nach Kardinalität als
  // Objekt oder als einelementiges Array; beide Formen werden akzeptiert.
  type PreferenceRow = { sport: { key: string } | { key: string }[] | null };
  const preferredSports = (
    (preferenceResponse.data as unknown as PreferenceRow[] | null) ?? []
  )
    .map((entry) =>
      Array.isArray(entry.sport) ? entry.sport[0]?.key : entry.sport?.key,
    )
    .filter(isSportKey);

  const profile: UserProfile = {
    id: row.user_id,
    name: row.display_name,
    city: row.city ?? "",
    email,
    preferredSports,
    avatarUrl: row.avatar_url ?? undefined,
  };

  cachedProfile = profile;
  return { kind: "ok", code: "OK", data: profile };
}

/** Verwirft das zwischengespeicherte Profil (Abmeldung). */
export function clearCurrentProfile(): void {
  cachedProfile = null;
}

/**
 * Schreibt Anzeigename, Ort und Sportpräferenzen (UC-12, B1 DLG-08).
 *
 * `avatar_url` bleibt im MVP unverändert und ist deshalb weder im
 * UPDATE-GRANT noch hier enthalten (N2.2).
 */
export async function updateCurrentUser(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const current = cachedProfile;

  if (!current) {
    return { kind: "failed", cause: "Kein angemeldetes Profil" };
  }

  const name = input.name.trim();
  const city = input.city.trim();
  const preferredSports = [...new Set(input.preferredSports)];

  const profileUpdate = await supabase
    .from("profile")
    .update({ display_name: name, city: city || null })
    .eq("user_id", current.id);

  if (profileUpdate.error) {
    return { kind: "failed", cause: profileUpdate.error };
  }

  // Präferenzen als Menge führen: erst die abgewählten entfernen, dann die
  // neuen ergänzen. sport_preference hat (user_id, sport_id) als Schlüssel,
  // ein doppelter Eintrag ist damit ausgeschlossen (D1.4).
  const sportRows = await supabase
    .from("sport")
    .select("sport_id, key")
    .in("key", preferredSports.length > 0 ? preferredSports : [""]);

  if (sportRows.error) {
    return { kind: "failed", cause: sportRows.error };
  }

  const sportIds = (sportRows.data ?? []).map((row) => row.sport_id);

  const removal = await supabase
    .from("sport_preference")
    .delete()
    .eq("user_id", current.id);

  if (removal.error) {
    return { kind: "failed", cause: removal.error };
  }

  if (sportIds.length > 0) {
    const insertion = await supabase.from("sport_preference").insert(
      sportIds.map((sportId) => ({ user_id: current.id, sport_id: sportId })),
    );

    if (insertion.error) {
      return { kind: "failed", cause: insertion.error };
    }
  }

  const profile: UserProfile = {
    ...current,
    name,
    city,
    preferredSports,
  };

  cachedProfile = profile;
  return { kind: "ok", code: "OK", data: profile };
}
