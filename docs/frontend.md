# Frontend-Prototyp

## Überblick

Der Frontend-Prototyp bildet die acht in
[B1 — Dialogspezifikation](spec/B1-dialogspezifikation.md) beschriebenen
MVP-Dialoge als mobile-first React-Anwendung ab. Die Oberflächen sind klickbar
und zentrale Dialogzustände können simuliert werden. Dabei werden Mockdaten,
lokaler React-Zustand und `localStorage` für ausgewählte simulierte Zustände
verwendet.

Alle nachfolgend als realisiert bezeichneten Funktionen sind daher
**im UI-Prototyp realisiert, teilweise mit lokaler Mock-Persistenz, aber noch
ohne Backend beziehungsweise serverseitige Persistenz**. Der Prototyp belegt
die Benutzerführung und Darstellung, nicht die vollständige fachliche und
technische Umsetzung der beschriebenen Anwendungsfälle.

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

| B1-Dialog | Route | Im UI-Prototyp realisiert |
|---|---|---|
| DLG-01 Anmelden / Registrieren | `/login` | Umschaltung zwischen Anmeldung und Registrierung, E-Mail-/Passwortfelder, Anzeigename bei Registrierung, clientseitige Validierung und simulierte lokale Anmeldesitzung |
| DLG-02 Session entdecken | `/discover` | Textsuche, Sportartenfilter, hervorgehobene nächste Session, weitere Session-Karten und Leerzustand |
| DLG-03 Session-Karte | `/map` | echte Leaflet-/OpenStreetMap-Karte, Sportartenfilter, Session-Marker, Popup, Auswahlkarte, Navigation zum Detail sowie Fehlerzustand mit Wiederholungsmöglichkeit und Wechsel zur Listenansicht |
| DLG-04 Session-Detail | `/sessions/:sessionId` | Kerndaten, abgeleiteter Status, Belegung, Teilnehmerliste, Organisatoransicht mit echtem QR-Code und PIN, Beitrittszustand, Check-in-Aktion und Read-only-Zustand |
| DLG-05 Session erstellen | `/sessions/new` | Sportart, Titel, Beschreibung, Datum, Uhrzeit, Dauer, Court-Auswahl oder lokale Neuerfassung, Teilnehmerlimit, Validierung, lokal gespeicherte Session samt Organisator-Teilnahme und Navigation zur neuen Detailansicht |
| DLG-06 Check-in | `/check-in?session=<id>&pin=<pin>` | Statusprüfung, Deep-Link-Einstieg mit vorbelegter PIN, Hinweis auf Scan per Kamera-App, manuelle PIN-Eingabe, PIN-Validierung sowie Erfolgs- und Sperrzustände |
| DLG-07 Meine Sessions | `/my-sessions` | Tabs für bevorstehende und vergangene Sessions, Rollenkennzeichnung, Check-in-Information und Leerzustände |
| DLG-08 Profil | `/profile` | Profilansicht, Bearbeitung und lokale Speicherung von Anzeigename, Ort und Sportpräferenzen, konsistente Verwendung in weiteren Dialogen sowie Abmelden-Navigation |

### Gemeinsame UI-Funktionen

- durchgängige Hauptnavigation mit Entdecken, Karte, Erstellen, Sessions und Profil
- mobile-first Layout mit begrenzter Desktop-Darstellung
- Statusdarstellung für `scheduled`, `active` und `completed`
- harte Kapazitätsanzeige ohne Warteliste
- Unterscheidung zwischen Organisator- und Teilnehmeransicht anhand der Mockdaten
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

src/utils/
  checkInUrl.ts
  sessionTime.ts
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
src/services/courtService.ts
src/services/geocodingService.ts
```

Die Services liefern synchron Mockdaten und teilen Sessionänderungen zwischen
den Seiten. Neu erstellte Sessions sowie nachfolgende Beitritts- und
Check-in-Änderungen an diesen Sessions werden zu Demonstrationszwecken in
`localStorage` gespeichert. Änderungen an den fest eingebauten Sessions und am
Profil bleiben flüchtig. Eine Backend- oder serverseitige Persistenz besteht
nicht.

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
Profil → Bearbeiten → lokale Ansicht aktualisieren
```

## Tatsächlich noch bestehende Abweichungen

| Bereich | Aktueller Prototypstand | Soll-/Klärungsbedarf |
|---|---|---|
| Backend und Persistenz | Mockdaten, gemeinsamer Laufzeitzustand und lokale Mock-Persistenz für erstellte Sessions, Courts und das Profil | Anbindung an die in P2/S1 vorgesehene Backend- und Auth-Infrastruktur sowie serverseitige Persistenz |
| Authentifizierung | simulierte lokale Anmeldesitzung mit Anmeldung, Abmeldung und Erhalt über Seiten-Reloads | echte Anmeldung/Registrierung und Behandlung von Auth-Fehlern über NB-02 |
| Zugriffsschutz | geschützte Routen leiten zu DLG-01 und nach der simulierten Anmeldung zum ursprünglichen Ziel zurück | Schutz anhand einer echten Anmeldesitzung und Nutzeridentität gemäß B1.5.2 |
| Session-Beitritt | gemeinsamer lokaler Mockzustand aktualisiert Teilnehmerliste, Teilnehmerzahl und „Meine Sessions“ konsistent; bei vorgegebenen Mock-Sessions nicht reloadfest | serverseitig persistenter, atomarer Beitritt nach AF-01 |
| Session-Erstellung | neuer Datensatz mit Organisator-Teilnahme, lokal erzeugter PIN, `localStorage`-Speicherung und Navigation zur Detailansicht | serverseitige Session- und Court-Persistenz samt atomarer Organisator-Teilnahme |
| Court-Neuerfassung | verpflichtender Kartenpin, Reverse-Geocoding für Ort und optionale Adresse, Wiederholungsmöglichkeit bei Fehlern und lokale Wiederverwendung über `localStorage` | serverseitige Court-Persistenz fehlt; automatische Dublettenprüfung ist bewusst kein MVP |
| QR-/PIN-Check-in | QR-Deep-Link und manuelle PIN-Eingabe führen in dieselbe lokale Prüfung; der QR-Code wird clientseitig erzeugt und per Kamera-App des Geräts geöffnet | serverseitige Prüfung, Idempotenz und Persistenz nach AF-02 |
| Status einer Sport-Session | Status wird aus Startzeit und Dauer abgeleitet | künftig serverseitig maßgebliche Berechnung gemäß [AF-03](spec/F3-anwendungsfunktionen.md#af-03--status-einer-sport-session) |
| Profil | Anzeigename, Ort und Präferenzen werden lokal gespeichert und in Begrüßung, Suche, Session-Erstellung sowie eigenen Teilnehmer-/Organisatoranzeigen verwendet; Profilbild ist read-only | serverseitige Profilpersistenz fehlt; Profilbild-Upload und -Bearbeitung sind bewusst kein MVP |
| Karte | OSM-Karte ist real eingebunden; Ladefehler zeigen einen verständlichen Hinweis mit Wiederholungsmöglichkeit und Verweis auf die Listenansicht | Kartendaten und Verfügbarkeit beruhen weiterhin auf dem externen OpenStreetMap-Dienst |
| Lade-/Netzwerkfehler | Court-Geocoding zeigt Lade-, Fehler- und Wiederholungszustand; übrige Datenzugriffe sind synchron | Muster aus B1.5.4 bei der späteren Backend-Anbindung auf alle asynchronen Aktionen übertragen |
| Validierung | zentrale Formulare validieren ausgewählte Pflichtangaben | vollständige Umsetzung der Regeln aus D2/N1 und der verbindlichen Fehlertexte aus B1 |
| Tests | kein Testskript und keine automatisierten UI-Tests | manuelle Prüfung anhand der Akzeptanzkriterien aus F2/F3; automatisierte Tests bleiben optional, da für das MVP weder Testframework noch Test-CI vorgegeben sind (P1 SC-07, N1.3) |

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
