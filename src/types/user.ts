import type { SportType } from "./session";

// MVP-Profil gemäß Spezifikation D1 (profile) und B1 DLG-08:
// Anzeigename, optionales Profilbild, bevorzugte Sportarten.
// E-Mail stammt aus dem Auth-Dienst (read-only, kein D1-Attribut).
// `city` ist eine Prototyp-Ergänzung ohne Entsprechung in D1/DLG-08 und
// als Abweichung in B1.6 ausgewiesen.
export interface UserProfile {
  id: string;
  name: string;
  city: string;
  email: string;
  preferredSports: SportType[];
  avatarUrl?: string;
}
