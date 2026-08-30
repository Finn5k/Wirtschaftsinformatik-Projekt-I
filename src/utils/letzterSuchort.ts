// Vorbelegung der Ortssuche in DLG-02 (B1.4.2): `profile.city`, sonst der
// letzte Suchort, sonst leer.
//
// Der letzte Suchort ist kein fachliches D1-Datum, sondern eine Bedienhilfe
// dieses Geräts — er gehört deshalb nicht in die Service-Schicht und nicht in
// die Datenbank (A08 8.1.3). `localStorage` ist in Privatfenstern und bei
// gesperrten Website-Daten nicht verfügbar und wirft dann; ohne den Wert
// bleibt das Feld einfach leer.

const SCHLUESSEL = "localcourt.letzterSuchort";

export function leseLetztenSuchort(): string {
  try {
    return window.localStorage.getItem(SCHLUESSEL) ?? "";
  } catch {
    return "";
  }
}

export function merkeLetztenSuchort(suchort: string): void {
  try {
    const wert = suchort.trim();

    if (wert) {
      window.localStorage.setItem(SCHLUESSEL, wert);
    } else {
      window.localStorage.removeItem(SCHLUESSEL);
    }
  } catch {
    // Ohne Speicher bleibt es bei der Vorbelegung aus dem Profil.
  }
}
