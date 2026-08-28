import type { Court, Participant, SessionStatus, SportSession } from "../types/session";
import { isSportKey } from "../data/sports";

// Abbildung der View `v_session` auf den Frontend-Typ.
//
// Die View liefert `status` und `confirmed_count` bereits berechnet (D1.6,
// F3 AF-03). Diese Werte sind maßgeblich, nicht eine erneute Ableitung im
// Client: `check_in` prüft das Zeitfenster mit derselben Datenbankfunktion,
// eine abweichende Client-Rechnung könnte also anzeigen, was die RPC ablehnt.

/** Spalten, die `v_session` liefert (siehe supabase/migrations/…_views.sql). */
export const SESSION_VIEW_COLUMNS =
  "session_id, sport_id, court_id, title, description, start_at, duration_min, " +
  "max_participants, created_at, status, confirmed_count, organizer_user_id, " +
  "sport_key, sport_display_name, court_name, court_city, court_address, " +
  "court_latitude, court_longitude";

export interface SessionViewRow {
  session_id: string;
  court_id: string;
  title: string;
  description: string | null;
  start_at: string;
  duration_min: number;
  max_participants: number;
  status: string;
  confirmed_count: number;
  organizer_user_id: string;
  sport_key: string;
  court_name: string;
  court_city: string;
  court_address: string | null;
  court_latitude: number | string;
  court_longitude: number | string;
}

function toSessionStatus(value: string): SessionStatus {
  return value === "active" || value === "completed" ? value : "scheduled";
}

export function toCourt(row: SessionViewRow): Court {
  return {
    id: row.court_id,
    name: row.court_name,
    city: row.court_city,
    address: row.court_address ?? undefined,
    // PostgREST liefert `numeric` als Zeichenkette, damit keine Stellen
    // verloren gehen; Leaflet erwartet Zahlen (D2.7).
    latitude: Number(row.court_latitude),
    longitude: Number(row.court_longitude),
  };
}

export function toSession(
  row: SessionViewRow,
  organizerName: string,
  participants: Participant[],
): SportSession {
  return {
    id: row.session_id,
    title: row.title,
    // Unbekannte Schlüssel fallen auf "other" zurück, statt den Typ zu
    // unterlaufen; der Katalog ist Referenzdatum (D1.4).
    sportKey: isSportKey(row.sport_key) ? row.sport_key : "other",
    court: toCourt(row),
    startAt: row.start_at,
    description: row.description ?? "",
    durationMin: row.duration_min,
    status: toSessionStatus(row.status),
    participantsCount: row.confirmed_count,
    maxParticipants: row.max_participants,
    organizerId: row.organizer_user_id,
    organizerName,
    participants,
  };
}
