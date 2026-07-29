# Frontend-Prototyp

## Überblick

Der Frontend-Prototyp bildet die acht in
[B1 — Dialogspezifikation](spec/B1-dialogspezifikation.md) beschriebenen
MVP-Dialoge als mobile-first React-Anwendung ab. Die Oberflächen sind klickbar
und zentrale Dialogzustände können simuliert werden. Dabei werden ausschließlich
Mockdaten und lokaler React-Zustand verwendet.

Alle nachfolgend als realisiert bezeichneten Funktionen sind daher
**im UI-Prototyp realisiert, aber noch ohne Backend beziehungsweise
Persistenz**. Der Prototyp belegt die Benutzerführung und Darstellung, nicht
die vollständige fachliche und technische Umsetzung der beschriebenen
Anwendungsfälle.

## Verwendete Technologien

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Leaflet / react-leaflet mit OpenStreetMap
- lucide-react für Icons

## Starten des Frontends

Abhängigkeiten installieren:

```bash
npm install
```

Lokalen Entwicklungsserver starten:

```bash
npm run dev
```

Build prüfen:

```bash
npm run build
```

Standardmäßig läuft die App lokal unter:

```txt
http://localhost:5173
```

## Screens und aktueller Realisierungsstand

| B1-Dialog | Route | Im UI-Prototyp realisiert |
|---|---|---|
| DLG-01 Anmelden / Registrieren | `/login` | Umschaltung zwischen Anmeldung und Registrierung, E-Mail-/Passwortfelder, Anzeigename bei Registrierung und clientseitige Validierung |
| DLG-02 Session entdecken | `/discover` | Textsuche, Sportartenfilter, hervorgehobene nächste Session, weitere Session-Karten und Leerzustand |
| DLG-03 Session-Karte | `/map` | echte Leaflet-/OpenStreetMap-Karte, Sportartenfilter, Session-Marker, Popup, Auswahlkarte und Navigation zum Detail |
| DLG-04 Session-Detail | `/sessions/:sessionId` | Kerndaten, Status, Belegung, Teilnehmerliste, Organisatoransicht mit QR-/PIN-Platzhalter, Beitrittszustand, Check-in-Aktion und Read-only-Zustand |
| DLG-05 Session erstellen | `/sessions/new` | Sportart, Titel, Beschreibung, Datum, Uhrzeit, Dauer, Court-Auswahl oder lokale Neuerfassung, Teilnehmerlimit, Validierung und Erfolgsvorschau mit lokal erzeugter PIN |
| DLG-06 Check-in | `/check-in?session=<id>&pin=<pin>` | Statusprüfung, Deep-Link-Einstieg mit vorbelegter PIN, QR-Platzhalter, manuelle PIN-Eingabe, PIN-Validierung sowie Erfolgs- und Sperrzustände |
| DLG-07 Meine Sessions | `/my-sessions` | Tabs für bevorstehende und vergangene Sessions, Rollenkennzeichnung, Check-in-Information und Leerzustände |
| DLG-08 Profil | `/profile` | Profilansicht, lokaler Bearbeitungszustand für Anzeigename, Ort und Sportpräferenzen sowie Abmelden-Navigation |

### Gemeinsame UI-Funktionen

- durchgängige Hauptnavigation mit Entdecken, Karte, Erstellen, Sessions und Profil
- mobile-first Layout mit begrenzter Desktop-Darstellung
- Statusdarstellung für `scheduled`, `active` und `completed`
- harte Kapazitätsanzeige ohne Warteliste
- Unterscheidung zwischen Organisator- und Teilnehmeransicht anhand der Mockdaten
- erklärende Leer- und Nicht-gefunden-Zustände

## Komponentenstruktur

Wichtige Komponenten:

```txt
src/components/layout/
  AppLayout.tsx
  BottomNavigation.tsx
  TopBar.tsx

src/components/sessions/
  CreateSessionForm.tsx
  SessionCard.tsx
  StatusBadge.tsx
```

Die Dialogseiten liegen unter:

```txt
src/pages/
  LoginPage.tsx
  DiscoverPage.tsx
  MapPage.tsx
  SessionDetailPage.tsx
  CreateSessionPage.tsx
  CheckInPage.tsx
  MySessionsPage.tsx
  ProfilePage.tsx
```

## Mockdaten und Service-Schicht

Der Prototyp verwendet:

```txt
src/data/mockSessions.ts
src/data/mockCourts.ts
src/data/mockUser.ts
```

Der lesende Zugriff ist teilweise über folgende Services gekapselt:

```txt
src/services/sessionService.ts
src/services/userService.ts
```

Die Services liefern synchron Mockdaten. Schreibende Aktionen wie Beitritt,
Session-Erstellung, Check-in und Profiländerung verändern nur lokalen
Komponenten-Zustand oder zeigen eine Vorschau. Sie werden weder dauerhaft
gespeichert noch zwischen Seiten geteilt.

## Demonstrierbare Abläufe

```txt
Anmelden / Registrieren → Entdecken
```

```txt
Entdecken oder Karte → Session-Detail → Beitreten → Check-in → Erfolg
```

```txt
Session erstellen → Formularvalidierung → Erfolgsvorschau mit PIN
```

```txt
Meine Sessions → Bevorstehend / Vergangen → Session-Detail
```

```txt
Profil → Bearbeiten → lokale Ansicht aktualisieren
```

## Tatsächlich noch bestehende Abweichungen

| Bereich | Aktueller Prototypstand | Soll-/Klärungsbedarf |
|---|---|---|
| Backend und Persistenz | ausschließlich Mockdaten und lokaler Zustand | Anbindung an die in P2/S1 vorgesehene Backend- und Auth-Infrastruktur |
| Authentifizierung | Formularvalidierung und direkte Navigation nach `/discover` | echte Anmeldung/Registrierung, Sitzung, Abmeldung und Behandlung von Auth-Fehlern |
| Zugriffsschutz | geschützte Routen sind direkt aufrufbar | Weiterleitung nicht angemeldeter Nutzer und Rückkehr zur ursprünglich gewünschten Funktion gemäß B1.5.2 |
| Session-Beitritt | gemeinsamer lokaler Mockzustand aktualisiert Teilnehmerliste, Teilnehmerzahl und „Meine Sessions“ konsistent | persistenter, atomarer Beitritt nach AF-01 über das Backend |
| Session-Erstellung | Erfolgsvorschau ohne neuen Datensatz | persistente Session samt Court, Organisator-Teilnahme und anschließender Navigation zur neuen Detailansicht |
| Court-Neuerfassung | nur Bestandteil des Formularzustands, ohne Kartenpin | persistente Erfassung mit verpflichtendem Kartenpin und Reverse-Geocoding für Ort/Adresse (S1.5/S1.6); automatische Dublettenprüfung ist kein MVP |
| QR-Code | Symbol beziehungsweise Platzhalter | echte QR-Erzeugung im festgelegten Deep-Link-Format (AF-04, N2.8) |
| QR-Check-in | Schaltfläche bestätigt ohne Scan oder Merkmalsprüfung | tatsächlicher QR-Einstieg und dieselbe fachliche Prüfung wie beim PIN-Weg |
| PIN-Check-in | prüft lokal Teilnahme, Zeitfenster und PIN und aktualisiert den Check-in-Status im gemeinsamen Mockzustand | serverseitige Prüfung und Persistenz nach AF-02 |
| Session-Lifecycle | Status ist fest in den Mockdaten hinterlegt | abgeleitete Statusführung gemäß AF-03, bei jeder Abfrage berechnet (N2.6) |
| Profil | Änderungen gelten nur bis zum Verlassen der Seite; Profilbild ist read-only | persistente Änderung von Anzeigename, Ort und Präferenzen; Profilbild-Upload und -Bearbeitung sind kein MVP |
| Karte | OSM-Karte ist real eingebunden | spezifizierte Graceful Degradation bei nicht erreichbarem Kartendienst fehlt |
| Lade-/Netzwerkfehler | keine asynchronen Anfragen vorhanden | Ladeanzeigen, während laufender Anfragen deaktivierte Aktionen, verständliche Fehlermeldungen und Wiederholungsmöglichkeiten gemäß B1.5.4 |
| Validierung | zentrale Formulare validieren ausgewählte Pflichtangaben | vollständige Umsetzung der Regeln aus D2/N1 und der verbindlichen Fehlertexte aus B1 |
| Tests | kein Testskript und keine automatisierten UI-Tests | manuelle Prüfung anhand der Akzeptanzkriterien aus F2/F3; automatisierte Tests bleiben optional, da für das MVP weder Testframework noch Test-CI vorgegeben sind (N1-QA-08, P1 SC-07) |

## Offene fachliche und technische Entscheidungen

Diese Dokumentation trifft keine neuen Entscheidungen und führt auch keine
eigene Liste offener oder bereits entschiedener Punkte. Maßgeblich ist
[B1.8](spec/B1-dialogspezifikation.md#b18-entscheidungsstand); technische
Festlegungen stehen in den dort verlinkten Spezifikationsbausteinen.

## Referenzen

- [B1 — Dialogspezifikation](spec/B1-dialogspezifikation.md)
- [F2 — Anwendungsfälle](spec/F2-anwendungsfaelle.md)
- [F3 — Anwendungsfunktionen](spec/F3-anwendungsfunktionen.md)
- [D1 — Datenmodell](spec/D1-datenmodell.md)
- [D2 — Datentypen](spec/D2-datentypen.md)
- [N1 — Nichtfunktionale Anforderungen](spec/N1-nichtfunktionale-anforderungen.md)

## Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | ChatGPT / Codex |
| Verwendung | Abgleich der Frontend-Dokumentation mit den vorhandenen Routen, Seiten, Komponenten, Mockdaten und Services; Codex aktualisierte am 2026-07-29 Statusumfang, Profilbildabgrenzung, Court-Reverse-Geocoding, Check-in-Deep-Link sowie die bestätigten Festlegungen zu Court-Dubletten und Fehlertexten. |
| Prüfung | Angaben wurden gegen `src/App.tsx`, `src/pages/`, `src/components/`, `src/data/`, `src/services/` und die bestehenden Bausteine B1, F2, F3, D1, D2 und N1 geprüft. Es wurden keine fachlichen oder technischen Entscheidungen ergänzt. Nachtrag (2026-07-26, Claude Sonnet 5): zwei Abweichungszeilen korrigiert, die QR-Format und Statusführung noch als offen führten, obwohl sie in AF-04/N2.8 bzw. N2.6 entschieden sind. Aktualisierung (2026-07-28, Codex): Validierungsbedarf an die bewussten Festlegungen und Nicht-Festlegungen aus D2/N1 angeglichen. Redundanzkorrektur (2026-07-28, Codex): Wiederholung offener und bereits entschiedener Spezifikationspunkte durch einen Verweis auf B1.8 ersetzt. Finaler Hygienecheck (2026-07-29, Codex): Testabweichung an die bestehende manuelle MVP-Prüfung aus N1 und P1 angeglichen und B1-Verweis aktualisiert. Aktualisierung (2026-07-29, Codex): Sortierung sowie konsistente lokale Beitritts-, Teilnehmer- und Check-in-Zustände gegen B1/F3 geprüft und den aktuellen Prototyp-Abgleich nachgezogen. |
