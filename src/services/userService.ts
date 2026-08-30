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

// Das zuletzt geladene Profil, damit `updateCurrentUser()` die Nutzerkennung
// und die bisherigen Präferenzen kennt, ohne sie erneut zu laden. Nach außen
// gereicht wird es nicht: Die Dialogseiten beziehen den angemeldeten Nutzer
// aus dem `AuthProvider` (A08 8.3), nicht aus diesem Modul.
let cachedProfile: UserProfile | null = null;

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

  // Präferenzen als Mengendifferenz führen: nur die abgewählten entfernen und
  // nur die neu gewählten ergänzen. Ein vorheriges Löschen aller Einträge wäre
  // kürzer, würde aber bei einem Fehlschlag des folgenden INSERT alle
  // Präferenzen verlieren — für UC-12 ist das kein hinnehmbarer Zwischenstand.
  // Ein RPC-Schreibpfad wie bei den drei Fachoperationen ist dafür nicht
  // vorgesehen: ADR-001 beschränkt ihn auf Erstellung, Beitritt und Check-in.
  const entfernt = current.preferredSports.filter(
    (key) => !preferredSports.includes(key),
  );
  const ergaenzt = preferredSports.filter(
    (key) => !current.preferredSports.includes(key),
  );

  if (entfernt.length > 0 || ergaenzt.length > 0) {
    const sportRows = await supabase
      .from("sport")
      .select("sport_id, key")
      .in("key", [...entfernt, ...ergaenzt]);

    if (sportRows.error) {
      return { kind: "failed", cause: sportRows.error };
    }

    const sportIdZuSchluessel = new Map(
      (sportRows.data ?? []).map((row) => [row.key, row.sport_id]),
    );

    const entfernteIds = entfernt
      .map((key) => sportIdZuSchluessel.get(key))
      .filter((id) => id !== undefined);

    if (entfernteIds.length > 0) {
      const removal = await supabase
        .from("sport_preference")
        .delete()
        .eq("user_id", current.id)
        .in("sport_id", entfernteIds);

      if (removal.error) {
        return { kind: "failed", cause: removal.error };
      }
    }

    // sport_preference hat (user_id, sport_id) als Schlüssel; ein doppelter
    // Eintrag ist damit ausgeschlossen (D1.4).
    const ergaenzteIds = ergaenzt
      .map((key) => sportIdZuSchluessel.get(key))
      .filter((id) => id !== undefined);

    if (ergaenzteIds.length > 0) {
      const insertion = await supabase.from("sport_preference").insert(
        ergaenzteIds.map((sportId) => ({
          user_id: current.id,
          sport_id: sportId,
        })),
      );

      if (insertion.error) {
        return { kind: "failed", cause: insertion.error };
      }
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
