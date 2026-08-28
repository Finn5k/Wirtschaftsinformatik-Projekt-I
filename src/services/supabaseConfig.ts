// Zugangsdaten für NB-02/NB-03 aus den Deployment-Umgebungsvariablen (A07).
//
// Die Prüfung liegt bewusst hier und nicht im Client-Modul: Vite ersetzt
// `import.meta.env` beim Bauen, fehlende Variablen werden also zu `undefined`
// und fallen erst zur Laufzeit auf. Würde das Client-Modul beim Import werfen,
// bräche der Fehler die gesamte Anwendung, bevor React mountet — sichtbar nur
// als weiße Seite mit einer Meldung in der Entwicklerkonsole.
//
// Stattdessen wird der Mangel hier festgestellt und in `main.tsx` als lesbare
// Seite angezeigt.

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Namen der fehlenden Variablen; leer, wenn die Konfiguration vollständig ist. */
export const missingConfiguration: readonly string[] = [
  ...(url ? [] : ["VITE_SUPABASE_URL"]),
  ...(key ? [] : ["VITE_SUPABASE_PUBLISHABLE_KEY"]),
];

// Platzhalter, damit `createClient` auch bei unvollständiger Konfiguration
// nicht schon beim Import scheitert. Aufrufe gegen diese Adresse schlagen dann
// als technischer Fehler fehl — die Klasse, die A08 8.5.2 dafür vorsieht.
export const supabaseUrl = url || "https://nicht-konfiguriert.invalid";
export const supabaseKey = key || "nicht-konfiguriert";
