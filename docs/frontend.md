# Frontend

## Überblick

Das Frontend bildet die acht in
[B1 — Dialogspezifikation](spec/B1-dialogspezifikation.md) beschriebenen
MVP-Dialoge als mobile-first React-Anwendung ab. Es arbeitet gegen die realen
Nachbarsysteme: Anmeldung und Sitzung über NB-02 Supabase Auth, fachliche Daten
und die drei atomaren Fachoperationen über NB-03 Supabase PostgREST, Karte und
Reverse-Geocoding über NB-04/NB-05. Mockdaten gibt es nicht mehr.

Diese Datei hält den Umsetzungsstand je Dialog fest. Normativ ist B1; die
verbleibenden Abweichungen stehen in
[B1.6](spec/B1-dialogspezifikation.md#b16-abweichungen-der-umsetzung), die
technische Einordnung je Querschnittskonzept in
[A08](arch/A08-crosscutting-concepts.md).

## Verwendete Technologien

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Leaflet / react-leaflet mit OpenStreetMap
- qrcode.react für die clientseitige QR-Code-Erzeugung
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

| B1-Dialog | Route | Umgesetzt |
|---|---|---|
| DLG-01 Anmelden / Registrieren | `/login` | Umschaltung zwischen Anmeldung und Registrierung, E-Mail-/Passwortfelder, Anzeigename bei Registrierung, clientseitige Validierung; Anmeldung, Registrierung und Abmeldung über NB-02, Sitzung übersteht einen Reload |
| DLG-02 Session entdecken | `/discover` | Ortssuche mit Vorbelegung aus dem Profil, sonst dem zuletzt gesuchten Ort, Sportartenfilter über die Datenbank, hervorgehobene nächste Session, weitere Session-Karten, Lade-, Fehler- und Leerzustand |
| DLG-03 Session-Karte | `/map` | Leaflet-/OpenStreetMap-Karte, Sportartenfilter, Session-Marker, Popup, Auswahlkarte, Navigation zum Detail, aus den Treffern abgeleiteter Kartenausschnitt sowie Fehlerzustand mit Wiederholung und Wechsel zur Listenansicht |
| DLG-04 Session-Detail | `/sessions/:sessionId` | Kerndaten, Status aus `v_session`, Belegung, Teilnehmerliste im Umfang der RLS, Organisatoransicht mit QR-Code und PIN, Beitritt über `join_session` mit den Ergebnistexten aus B1.4.4, Check-in-Einstieg und Read-only-Zustand |
| DLG-05 Session erstellen | `/sessions/new` | Sportart, Titel, Beschreibung, Datum, Uhrzeit, Dauer, Court-Auswahl oder Neuerfassung per Kartenpin, Teilnehmerlimit, Validierung; Anlage über `create_session` samt Court und Organisator-Teilnahme, danach Wechsel zur Detailansicht |
| DLG-06 Check-in | `/check-in?session=<id>&pin=<pin>` | Deep-Link-Einstieg mit vorbelegter PIN, Hinweis auf Scan per Kamera-App, manuelle PIN-Eingabe, Prüfung durch `check_in` mit den Ergebnistexten aus B1.4.6, Erfolgs- und Sperrzustände |
| DLG-07 Meine Sessions | `/my-sessions` | Tabs für bevorstehende und vergangene Sessions, Rollenkennzeichnung, Check-in-Information, Lade-, Fehler- und Leerzustände |
| DLG-08 Profil | `/profile` | Profilansicht, Bearbeitung von Anzeigename, Ort und Sportpräferenzen gegen `profile`/`sport_preference`, Verwendung in weiteren Dialogen sowie Abmelden |

### Gemeinsame UI-Funktionen

- durchgängige Hauptnavigation mit Entdecken, Karte, Erstellen, Sessions und Profil
- mobile-first Layout mit begrenzter Desktop-Darstellung
- Statusdarstellung für `scheduled`, `active` und `completed`, berechnet von der Datenbank
- harte Kapazitätsanzeige ohne Warteliste
- Unterscheidung zwischen Organisator- und Teilnehmeransicht anhand der geladenen Rolle
- Lade- und Fehlerzustände nach B1.5.4 über den gemeinsamen Hook `useLoadedData`
- erklärende Leer- und Nicht-gefunden-Zustände
- sichtbare Tastaturfokusse, zugängliche Namen für Icon-Aktionen sowie
  semantische Auswahl-, Tab-, Formular- und Fehlerzustände

## Komponentenstruktur

Wichtige Komponenten:

```txt
src/components/layout/
  AppLayout.tsx
  BottomNavigation.tsx
  TopBar.tsx

src/components/sessions/
  CheckInQrCode.tsx
  CourtLocationPicker.tsx
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

src/auth/
  AuthProvider.tsx
  ProtectedRoute.tsx
  authContext.ts

src/hooks/
  useLoadedData.ts

src/utils/
  checkInUrl.ts
  letzterSuchort.ts
  sessionTime.ts
```

## Service-Schicht

Jeder fachliche Datenzugriff läuft über diese vier Module; keine Seite und keine
Komponente spricht Supabase selbst an
([ADR-002](arch/A09-architecture-decisions.md#92-adr-002--service-schicht-als-integrationsgrenze-für-fachlichen-datenzugriff-und-geocoding)):

```txt
src/services/sessionService.ts   Sessions lesen; create_session, join_session, check_in
src/services/courtService.ts     vorhandene Courts zur Auswahl lesen
src/services/userService.ts      Profil und Sportpräferenzen (UC-12)
src/services/geocodingService.ts Reverse-Geocoding eines Kartenpins (NB-05)
```

Dazu kommen drei technische Hilfsmodule ohne fachliche Verantwortung:
`supabaseConfig.ts` prüft die Umgebungsvariablen, `supabaseClient.ts` stellt den
Client bereit, `sessionQueries.ts` bildet die Zeilen von `v_session` auf die
fachlichen Typen ab.

Die Umgebungsvariablen `VITE_SUPABASE_URL` und `VITE_SUPABASE_PUBLISHABLE_KEY`
stehen in `.env.local` (Vorlage: `.env.example`); fehlen sie, zeigt die
Anwendung statt eines leeren Bildschirms einen Hinweis.

## Demonstrierbare Abläufe

```txt
Anmelden / Registrieren → Entdecken
```

```txt
Entdecken oder Karte → Session-Detail → Beitreten → Check-in → Erfolg
```

```txt
Session erstellen → Formularvalidierung → neue Detailansicht mit QR-Code und PIN
```

```txt
Meine Sessions → Bevorstehend / Vergangen → Session-Detail
```

```txt
Profil → Bearbeiten → Speichern in profile / sport_preference
```

## Noch bestehende Abweichungen

| Bereich | Stand | Offener Bedarf |
|---|---|---|
| Profilbild | vorhandene Bild-URL wird angezeigt; fehlt sie oder kann das Bild nicht geladen werden, zeigt eine gemeinsame Avatar-Komponente bis zu zwei Initialen | Upload und Bearbeitung sind bewusst kein MVP |
| Court-Dublettenprüfung | findet nicht statt | bewusste MVP-Entscheidung (UC-10) |
| Karte | OSM-Karte eingebunden; Ladefehler zeigen einen Hinweis mit Wiederholung und Verweis auf die Listenansicht | Kartendaten und Verfügbarkeit beruhen auf dem externen OpenStreetMap-Dienst |
| Tests | kein Testskript und keine automatisierten Tests | keine Abweichung, sondern die in [N1.3](spec/N1-nichtfunktionale-anforderungen.md#n13-bewusst-nicht-verfolgte-qualitätsziele) getroffene Festlegung: geprüft wird manuell anhand der Akzeptanzkriterien aus F2 und der Algorithmen aus F3 |

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
