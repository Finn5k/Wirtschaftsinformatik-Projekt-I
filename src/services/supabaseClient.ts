import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./supabaseConfig";

// Zugang zu NB-02 (Supabase Auth) und NB-03 (Supabase PostgREST), S1.3/S1.4.
//
// ADR-002 macht die Service-Schicht zum einzigen fachlichen Zugriffspfad auf
// diese Nachbarsysteme; dieses Modul hält dafür die eine Client-Instanz, die
// die übrigen Servicemodule verwenden. Dialogseiten importieren es nicht.
//
// Ausgenommen ist die Anmeldesitzung: ADR-002 ordnet sie ausdrücklich dem
// Baustein App-Shell & Navigation zu, weshalb `src/auth/AuthProvider.tsx`
// diesen Client ebenfalls verwendet.
//
// Verwendet wird ausschließlich der öffentliche Projektschlüssel. Er ist laut
// S1.1 kein Geheimnis und liegt bewusst im Browser-Bundle; der geheime
// Service-Role-Key wird vom Frontend nie verwendet und gehört nicht ins
// Repository. Die Autorisierung leistet Row-Level-Security auf Datenbankebene
// (N2.2), nicht der Schlüssel.
//
// Ob die Konfiguration überhaupt vollständig ist, prüft `supabaseConfig.ts`;
// dieses Modul wirft dafür bewusst nicht beim Import (siehe dort).

export const supabase = createClient(supabaseUrl, supabaseKey);
