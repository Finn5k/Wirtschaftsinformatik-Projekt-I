import { createClient } from "@supabase/supabase-js";

// Zugang zu NB-02 (Supabase Auth) und NB-03 (Supabase PostgREST), S1.3/S1.4.
//
// ADR-002 macht die Service-Schicht zum einzigen fachlichen Zugriffspfad auf
// diese Nachbarsysteme; dieses Modul hält dafür die eine Client-Instanz, die
// die übrigen Servicemodule verwenden. Dialogseiten importieren es nicht.
//
// Verwendet wird ausschließlich der öffentliche Projektschlüssel. Er ist laut
// S1.1 kein Geheimnis und liegt bewusst im Browser-Bundle; der geheime
// Service-Role-Key wird vom Frontend nie verwendet und gehört nicht ins
// Repository. Die Autorisierung leistet Row-Level-Security auf Datenbankebene
// (N2.2), nicht der Schlüssel.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Früh und deutlich scheitern: Ohne NB-03 ist LocalCourt fachlich nicht
  // nutzbar (S1.4, Abgrenzung) - ein stiller Fallback würde das verschleiern.
  throw new Error(
    "VITE_SUPABASE_URL und VITE_SUPABASE_PUBLISHABLE_KEY fehlen. " +
      "Lege eine .env.local nach dem Muster von .env.example an.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
