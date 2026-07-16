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
| DLG-06 Check-in | `/check-in/:sessionId` | Statusprüfung, QR-Platzhalter, manuelle PIN-Eingabe, PIN-Validierung sowie Erfolgs- und Sperrzustände |
| DLG-07 Meine Sessions | `/my-sessions` | Tabs für bevorstehende und vergangene Sessions, Rollenkennzeichnung, Check-in-Information und Leerzustände |
| DLG-08 Profil | `/profile` | Profilansicht, lokaler Bearbeitungszustand für Anzeigename, Ort und Sportpräferenzen sowie Abmelden-Navigation |

### Gemeinsame UI-Funktionen

- durchgängige Hauptnavigation mit Entdecken, Karte, Erstellen, Sessions und Profil
- mobile-first Layout mit begrenzter Desktop-Darstellung
- Statusdarstellung für `scheduled`, `active`, `completed` und `cancelled`
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
| Session-Beitritt | lokaler Zustand in der Detailseite | persistenter, atomarer Beitritt nach AF-01; Teilnehmerzahl und „Meine Sessions“ müssen gemeinsam aktualisiert werden |
| Session-Erstellung | Erfolgsvorschau ohne neuen Datensatz | persistente Session samt Court, Organisator-Teilnahme und anschließender Navigation zur neuen Detailansicht |
| Court-Neuerfassung | nur Bestandteil des Formularzustands | persistente Erfassung; Dubletten- und Geocoding-Verhalten sind offene Entscheidungen |
| QR-Code | Symbol beziehungsweise Platzhalter | echte QR-Erzeugung und festzulegendes Deep-Link-Format |
| QR-Check-in | Schaltfläche bestätigt ohne Scan oder Merkmalsprüfung | tatsächlicher QR-Einstieg und dieselbe fachliche Prüfung wie beim PIN-Weg |
| PIN-Check-in | prüft lokal gegen die PIN der Mock-Session | Prüfung von Anmeldung, bestehender Teilnahme, Zeitfenster, Idempotenz und Persistenz nach AF-02 |
| Session-Lifecycle | Status ist fest in den Mockdaten hinterlegt | automatische oder abgeleitete Statusführung gemäß AF-03; technische Entscheidung bleibt offen |
| Profil | Änderungen gelten nur bis zum Verlassen der Seite | persistente Profil- und Präferenzänderung; Umfang der Profilbildbearbeitung bleibt offen |
| Karte | OSM-Karte ist real eingebunden | spezifizierte Graceful Degradation bei nicht erreichbarem Kartendienst fehlt |
| Lade-/Netzwerkfehler | keine asynchronen Anfragen vorhanden | Ladeanzeigen, während laufender Anfragen deaktivierte Aktionen, verständliche Fehlermeldungen und Wiederholungsmöglichkeiten gemäß B1.5.4 |
| Validierung | zentrale Formulare validieren ausgewählte Pflichtangaben | endgültige Feldlängen, Obergrenzen und Fehlertexte bleiben offene Spezifikationsentscheidungen |
| Tests | kein Testskript und keine automatisierten UI-Tests | Umfang und Werkzeugwahl sind noch nicht festgelegt |

## Offene fachliche und technische Entscheidungen

Diese Dokumentation trifft keine neuen Entscheidungen. Aus der bestehenden
Spezifikation bleiben insbesondere offen:

- sichtbare Profildaten in Teilnehmerlisten
- Profilbild-Umfang im MVP
- Sortierung und Gruppierung der Session-Listen
- endgültige Fehlertexte
- Court-Dubletten und Geocoding
- Feldlängen und fachliche Obergrenzen
- technische Umsetzung von Authentifizierung, Atomarität, Statusführung,
  QR-Kodierung und Persistenz

## Referenzen

- [B1 — Dialogspezifikation](spec/B1-dialogspezifikation.md)
- [F2 — Anwendungsfälle](spec/F2-anwendungsfaelle.md)
- [F3 — Anwendungsfunktionen](spec/F3-anwendungsfunktionen.md)
- [D1 — Datenmodell](spec/D1-datenmodell.md)
- [D2 — Datentypen](spec/D2-datentypen.md)
- [N1 — Nichtfunktionale Anforderungen](spec/N1-nichtfunktionale-anforderungen.md)

## Versionshistorie

| Datum | Autor | Änderung |
|---|---|---|
| 2026-07-16 | ChatGPT / Codex | Dokumentation an den aktuellen UI-Prototyp angeglichen; realisierte Dialoge, Mock-/Persistenzgrenze und verbleibende Abweichungen dokumentiert |

## Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | ChatGPT / Codex |
| Verwendung | Abgleich der Frontend-Dokumentation mit den vorhandenen Routen, Seiten, Komponenten, Mockdaten und Services; Formulierung des aktuellen Realisierungsstands und der verbleibenden Abweichungen. |
| Prüfung | Angaben wurden gegen `src/App.tsx`, `src/pages/`, `src/components/`, `src/data/`, `src/services/` und die bestehenden Bausteine B1, F2, F3, D1, D2 und N1 geprüft. Es wurden keine fachlichen oder technischen Entscheidungen ergänzt. |
