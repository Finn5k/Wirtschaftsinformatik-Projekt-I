import type {
  CheckInResult,
  CreateSessionResult,
  Failed,
  JoinSessionResult,
  Ok,
} from "../types/result";
import type { Participant, SportKey, SportSession } from "../types/session";
import {
  SESSION_VIEW_COLUMNS,
  type SessionViewRow,
  toSession,
} from "./sessionQueries";
import { supabase } from "./supabaseClient";

// Fachlicher Zugriff auf Sessions über NB-03 (S1.4).
//
// Lesend über die View `v_session` — nicht über die Tabelle `session`: Deren
// SELECT-GRANT schließt die Spalte `pin` aus (N2.2), ein `select('*')` würde
// mit "permission denied" scheitern. Die View liefert zudem `status` und
// `confirmed_count` bereits berechnet (D1.6).
//
// Schreibend ausschließlich über die drei atomaren RPCs (ADR-001). Ihre
// fachlichen Ergebniscodes werden unverändert weitergereicht, statt sie zu
// verwerfen (A08 8.5.4); technische Fehler bleiben davon getrennt (N2.3).

export type SessionListResult = Ok<SportSession[]> | Failed;
export type SessionResult = Ok<SportSession | null> | Failed;

export interface CreateSessionInput {
  sportKey: SportKey;
  title: string;
  description: string;
  startAt: string;
  durationMin: number;
  maxParticipants: number;
  /** Bestehender Court; alternativ `newCourt` für eine Neuerfassung (UC-10). */
  courtId?: string;
  newCourt?: {
    name: string;
    city: string;
    address?: string;
    latitude: number;
    longitude: number;
  };
}

interface ParticipantRow {
  user_id: string;
  status: string;
  profile: { display_name: string; avatar_url: string | null } | null;
}

/**
 * Übersetzt einen RPC-Fehler in einen fachlichen Ergebniscode. PostgREST
 * transportiert den in F3 definierten Code als `message`, den HTTP-Status über
 * das SQLSTATE `PTxyz`. Alles, was nicht in der erwarteten Liste steht, bleibt
 * ein technischer Fehler und wird nicht umgedeutet (A08 8.5.4).
 */
function rejectionCode<TCode extends string>(
  error: { message?: string } | null,
  codes: readonly TCode[],
): TCode | null {
  const message = error?.message as TCode | undefined;
  return message && codes.includes(message) ? message : null;
}

/** Teilnahmen einer Session, soweit die RLS sie freigibt (N2.2, UC-07). */
async function loadParticipants(sessionId: string): Promise<Participant[]> {
  // N2.2 gibt participant nur Angemeldeten frei, und dort nur die eigene Zeile
  // bzw. dem Organisator die vollständige Liste. Unangemeldet würde die Anfrage
  // mit 401 abgewiesen; sie zu stellen erzeugte nur Fehlerrauschen.
  const { data: authState } = await supabase.auth.getSession();

  if (!authState.session) {
    return [];
  }

  const { data, error } = await supabase
    .from("participant")
    .select("user_id, status, profile(display_name, avatar_url)")
    .eq("session_id", sessionId)
    .order("joined_at");

  if (error || !data) {
    // Kein Zugriff bedeutet hier nicht "keine Teilnehmer", sondern "nicht
    // sichtbar" - die Belegungszahl kommt unabhängig davon aus der View.
    return [];
  }

  return (data as unknown as ParticipantRow[]).map((row) => ({
    id: row.user_id,
    name: row.profile?.display_name ?? "Teilnehmer:in",
    status: row.status === "checked_in" ? "checked_in" : "confirmed",
    avatarUrl: row.profile?.avatar_url ?? undefined,
  }));
}

/** Anzeigenamen mehrerer Profile in einem Aufruf (D1.4 Basisfelder). */
async function loadDisplayNames(
  userIds: readonly string[],
): Promise<Map<string, string>> {
  const eindeutige = [...new Set(userIds)];

  if (eindeutige.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("profile")
    .select("user_id, display_name")
    .in("user_id", eindeutige);

  if (error || !data) {
    // Der Anzeigename ist ein Basisfeld und auch unangemeldet lesbar (N2.2,
    // D1.4). Scheitert die Abfrage dennoch, bleibt der Name leer - die Session
    // selbst ist davon unabhängig sichtbar (UC-02).
    return new Map();
  }

  return new Map(
    (data as { user_id: string; display_name: string }[]).map((row) => [
      row.user_id,
      row.display_name,
    ]),
  );
}

async function toSessions(rows: SessionViewRow[]): Promise<SportSession[]> {
  const names = await loadDisplayNames(rows.map((row) => row.organizer_user_id));

  return rows.map((row) =>
    toSession(row, names.get(row.organizer_user_id) ?? "", []),
  );
}

/**
 * Entdecken und Karte zeigen nur zukünftige oder laufende Sessions
 * (B1 DLG-02/DLG-03); abgeschlossene erscheinen ausschließlich in DLG-07.
 *
 * Sortierung nach B1 DLG-02: laufende vor bevorstehenden, je Gruppe `start_at`
 * aufsteigend, bei Gleichstand Titel aufsteigend. Die Ergebnismenge wird
 * vollständig geladen; eine Seitengröße ist im MVP nicht vorgesehen (A08 8.4).
 */
export async function getDiscoverableSessions(
  sportKey: SportKey | "Alle" = "Alle",
): Promise<SessionListResult> {
  let query = supabase
    .from("v_session")
    .select(SESSION_VIEW_COLUMNS)
    .neq("status", "completed")
    .order("start_at", { ascending: true })
    .order("title", { ascending: true });

  if (sportKey !== "Alle") {
    query = query.eq("sport_key", sportKey);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { kind: "failed", cause: error };
  }

  const sessions = await toSessions(data as unknown as SessionViewRow[]);

  // Laufende vor bevorstehenden; innerhalb der Gruppe bleibt die
  // Datenbanksortierung erhalten (B1 DLG-02).
  return {
    kind: "ok",
    code: "OK",
    data: [
      ...sessions.filter((session) => session.status === "active"),
      ...sessions.filter((session) => session.status !== "active"),
    ],
  };
}

/** Session-Detail inklusive Teilnahmen, soweit sichtbar (UC-03, UC-07). */
export async function getSessionById(
  sessionId: string | undefined,
): Promise<SessionResult> {
  if (!sessionId) {
    return { kind: "ok", code: "OK", data: null };
  }

  const { data, error } = await supabase
    .from("v_session")
    .select(SESSION_VIEW_COLUMNS)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    return { kind: "failed", cause: error };
  }

  if (!data) {
    // Kein technischer Fehler: Die Anfrage wurde beantwortet, es gibt die
    // Session nur nicht (B1.5.6 "nicht gefunden").
    return { kind: "ok", code: "OK", data: null };
  }

  const row = data as unknown as SessionViewRow;
  const [participants, names] = await Promise.all([
    loadParticipants(row.session_id),
    loadDisplayNames([row.organizer_user_id]),
  ]);

  return {
    kind: "ok",
    code: "OK",
    data: toSession(row, names.get(row.organizer_user_id) ?? "", participants),
  };
}

/**
 * PIN einer Session. Gibt `null` zurück, wenn der Aufrufer sie laut N2.2 nicht
 * sehen darf — das ist eine Sichtbarkeitsregel, kein Ergebniscode.
 */
export async function getSessionPin(sessionId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("session_pin", {
    p_session_id: sessionId,
  });

  return error ? null : ((data as string | null) ?? null);
}

/** Eigene Sessions (UC-05, UC-11): organisiert oder mit eigener Teilnahme. */
async function getMySessions(): Promise<SessionListResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  if (!userId) {
    return { kind: "ok", code: "OK", data: [] };
  }

  // Beide Beziehungen liefern Session-Kennungen; die RLS gibt jeweils nur
  // eigene Zeilen frei (N2.2).
  const [organized, joined] = await Promise.all([
    supabase.from("organizer").select("session_id").eq("user_id", userId),
    supabase.from("participant").select("session_id").eq("user_id", userId),
  ]);

  if (organized.error || joined.error) {
    return { kind: "failed", cause: organized.error ?? joined.error };
  }

  const ids = [
    ...new Set([
      ...(organized.data ?? []).map((row) => row.session_id as string),
      ...(joined.data ?? []).map((row) => row.session_id as string),
    ]),
  ];

  if (ids.length === 0) {
    return { kind: "ok", code: "OK", data: [] };
  }

  const { data, error } = await supabase
    .from("v_session")
    .select(SESSION_VIEW_COLUMNS)
    .in("session_id", ids);

  if (error || !data) {
    return { kind: "failed", cause: error };
  }

  return {
    kind: "ok",
    code: "OK",
    data: await toSessions(data as unknown as SessionViewRow[]),
  };
}

export async function getMyUpcomingSessions(): Promise<SessionListResult> {
  const result = await getMySessions();

  if (result.kind !== "ok") {
    return result;
  }

  return {
    ...result,
    data: result.data
      .filter((session) => session.status !== "completed")
      .sort(
        (left, right) =>
          Date.parse(left.startAt) - Date.parse(right.startAt) ||
          left.title.localeCompare(right.title, "de"),
      ),
  };
}

/** Historie (UC-11): abgeschlossene Sessions, jüngste zuerst. */
export async function getMyPastSessions(): Promise<SessionListResult> {
  const result = await getMySessions();

  if (result.kind !== "ok") {
    return result;
  }

  return {
    ...result,
    data: result.data
      .filter((session) => session.status === "completed")
      .sort((left, right) => {
        const leftEnd = Date.parse(left.startAt) + left.durationMin * 60_000;
        const rightEnd = Date.parse(right.startAt) + right.durationMin * 60_000;

        return rightEnd - leftEnd || left.title.localeCompare(right.title, "de");
      }),
  };
}

/**
 * UC-06/UC-10 über die RPC `create_session`: Court (optional), Session,
 * organizer-Eintrag und Organisator-Teilnahme entstehen in einer Transaktion
 * (ADR-001). Die PIN erzeugt dabei die Datenbank (AF-04).
 */
export async function createSession(
  input: CreateSessionInput,
): Promise<CreateSessionResult> {
  // Die RPC erwartet die Sportart als Kennung; das Frontend führt den
  // stabilen Schlüssel aus D1.4.
  const sport = await supabase
    .from("sport")
    .select("sport_id")
    .eq("key", input.sportKey)
    .maybeSingle();

  if (sport.error || !sport.data) {
    return { kind: "failed", cause: sport.error };
  }

  const { data, error } = await supabase.rpc("create_session", {
    p_title: input.title.trim(),
    p_sport_id: (sport.data as { sport_id: string }).sport_id,
    p_start_at: input.startAt,
    p_duration_min: input.durationMin,
    p_max_participants: input.maxParticipants,
    p_description: input.description.trim() || null,
    p_court_id: input.courtId ?? null,
    p_court_name: input.newCourt?.name ?? null,
    p_court_city: input.newCourt?.city ?? null,
    p_court_address: input.newCourt?.address ?? null,
    p_court_latitude: input.newCourt?.latitude ?? null,
    p_court_longitude: input.newCourt?.longitude ?? null,
  });

  if (error) {
    if (rejectionCode(error, ["NOT_AUTHENTICATED"] as const)) {
      return { kind: "rejected", code: "NOT_AUTHENTICATED" };
    }

    const invalid = rejectionCode(error, [
      "START_IN_PAST",
      "COURT_INCOMPLETE",
    ] as const);

    return invalid
      ? { kind: "invalid", code: invalid }
      : { kind: "failed", cause: error };
  }

  const payload = data as { session_id: string; pin: string };
  return {
    kind: "ok",
    code: "OK",
    data: { sessionId: payload.session_id, pin: payload.pin },
  };
}

/** F3 AF-01 über die RPC `join_session`. */
export async function joinSession(
  sessionId: string,
): Promise<JoinSessionResult> {
  const { data, error } = await supabase.rpc("join_session", {
    p_session_id: sessionId,
  });

  if (error) {
    const code = rejectionCode(error, [
      "NOT_AUTHENTICATED",
      "SESSION_NOT_JOINABLE",
      "ALREADY_JOINED",
      "SESSION_FULL",
      "SESSION_NOT_FOUND",
    ] as const);

    return code
      ? { kind: "rejected", code }
      : { kind: "failed", cause: error };
  }

  const payload = data as {
    participant_id: string;
    status: "confirmed";
    joined_at: string;
  };

  return {
    kind: "ok",
    code: "OK",
    data: {
      participantId: payload.participant_id,
      status: payload.status,
      joinedAt: payload.joined_at,
    },
  };
}

/**
 * F3 AF-02 über die RPC `check_in`. QR-Weg und manuelle Eingabe führen in
 * denselben Aufruf, weil der QR-Inhalt dieselbe PIN trägt (AF-04, D2.8).
 *
 * `ALREADY_CHECKED_IN` ist dabei Erfolg, keine Ablehnung — F3 AF-02 bildet es
 * ausdrücklich auf 200 ab.
 */
export async function checkIn(
  sessionId: string,
  pin: string,
): Promise<CheckInResult> {
  const { data, error } = await supabase.rpc("check_in", {
    p_session_id: sessionId,
    p_pin: pin,
  });

  if (error) {
    const code = rejectionCode(error, [
      "NOT_JOINED",
      "INVALID_CREDENTIAL",
      "OUTSIDE_WINDOW",
      "SESSION_NOT_FOUND",
    ] as const);

    return code
      ? { kind: "rejected", code }
      : { kind: "failed", cause: error };
  }

  const payload = data as {
    code: "OK" | "ALREADY_CHECKED_IN";
    checked_in_at: string;
  };

  return {
    kind: "ok",
    code: payload.code,
    data: { checkedInAt: payload.checked_in_at },
  };
}
