import type { Sport, SportKey } from "../types/session";

// Spiegelt den Referenzkatalog `sport` aus D1.4 — dieselben sieben Einträge wie
// die Seed-Migration (supabase/migrations/…_seed_sport.sql).
//
// Der Katalog bleibt im Frontend ein statisches Modul und wird nicht geladen:
// Sportarten werden im MVP nicht durch Endnutzer angelegt (D1.4), damit ändert
// er sich zur Laufzeit nicht (A08 8.1.2).
export const sports: readonly Sport[] = [
  { key: "running", displayName: "Laufen" },
  { key: "cycling", displayName: "Radfahren" },
  { key: "football", displayName: "Fußball" },
  { key: "basketball", displayName: "Basketball" },
  { key: "badminton", displayName: "Badminton" },
  { key: "swimming", displayName: "Schwimmen" },
  { key: "other", displayName: "Sonstiges" },
];

export const sportKeys: readonly SportKey[] = sports.map((sport) => sport.key);

/** Anzeigebezeichnung zu einem Schlüssel (D1.4 `display_name`). */
export function sportDisplayName(key: SportKey): string {
  return sports.find((sport) => sport.key === key)?.displayName ?? key;
}

export function isSportKey(value: unknown): value is SportKey {
  return (
    typeof value === "string" && sportKeys.includes(value as SportKey)
  );
}
