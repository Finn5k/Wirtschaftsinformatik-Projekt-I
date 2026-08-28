import type { Failed, Ok } from "../types/result";
import type { Court } from "../types/session";
import { supabase } from "./supabaseClient";

// Sportorte über NB-03 (S1.4). Lesbar auch ohne Anmeldung, weil die Auswahl
// zur Suche gehört (N2.2, UC-02).
//
// Ein eigenes Anlegen gibt es hier nicht mehr: Ein neuer Court entsteht
// gemeinsam mit der Session in der RPC `create_session`, damit kein
// verwaister Court zurückbleibt, wenn ein Zwischenschritt fehlschlägt
// (ADR-001, A06 6.3).

export type CourtListResult = Ok<Court[]> | Failed;

interface CourtRow {
  court_id: string;
  name: string;
  city: string;
  address: string | null;
  latitude: number | string;
  longitude: number | string;
}

export async function getCourts(): Promise<CourtListResult> {
  const { data, error } = await supabase
    .from("court")
    .select("court_id, name, city, address, latitude, longitude")
    .order("name", { ascending: true });

  if (error || !data) {
    return { kind: "failed", cause: error };
  }

  return {
    kind: "ok",
    code: "OK",
    data: (data as unknown as CourtRow[]).map((row) => ({
      id: row.court_id,
      name: row.name,
      city: row.city,
      address: row.address ?? undefined,
      // PostgREST liefert `numeric` als Zeichenkette (D2.7).
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    })),
  };
}
