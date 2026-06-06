# Frontend-Prototyp

## Überblick

Der Frontend-Prototyp bildet die wichtigsten Nutzeroberflächen der Anwendung ab. Die Web-App ist mobile-first gestaltet und nutzt Mockdaten, damit zentrale Abläufe bereits ohne Backend klickbar und demonstrierbar sind.

Ziel des Prototyps ist es, die geplanten User Flows früh sichtbar zu machen und eine Grundlage für Spezifikation, Architektur, Reviews und spätere Backend-Anbindung zu schaffen.

## Verwendete Technologien

- React
- TypeScript
- Vite
- TailwindCSS
- React Router
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

## Screens

### Discover Page

Route: `/discover`

Die Discover Page ist der Einstiegspunkt der App. Nutzer sehen ihren XP-Fortschritt, können Sessions nach Sportart filtern und passende Sessions öffnen.

Enthält:

- Begrüßung
- XP-/Level-Hero
- Suchleiste
- Sportartenfilter
- Featured Session
- weitere Session Cards
- Empty State, falls keine Session zum Filter passt

### Map Page

Route: `/map`

Die Map Page zeigt Sessions räumlich als Pins auf einer Kartenansicht. Nutzer können eine Session auswählen und über ein Bottom Sheet zur Detailseite wechseln.

Enthält:

- Kartenhintergrund als Mock
- Session Pins
- auswählbare Session
- schließbares Bottom Sheet
- Link zur Session Detail Page

### Session Detail Page

Route: `/sessions/:sessionId`

Die Session Detail Page zeigt alle relevanten Informationen zu einer Session und bietet Aktionen wie Beitreten und Check-in.

Enthält:

- Hero-Bild
- Sportart und Status
- Titel und Organisator
- Beschreibung
- Datum, Uhrzeit, Treffpunkt, XP
- Teilnehmerliste
- Check-in-Box
- Location Preview
- Sticky Action Buttons

### Create Session Page

Route: `/sessions/new`

Die Create Session Page ermöglicht das Erstellen einer neuen Sport-Session im UI-Prototyp.

Enthält:

- Sportart
- Titel
- Beschreibung
- Datum
- Uhrzeit
- Ort/Treffpunkt
- Teilnehmerlimit
- empfohlener Rang
- Sichtbarkeit
- Formularvalidierung
- Success Preview nach erfolgreicher Eingabe

Hinweis: Die Session wird im aktuellen Prototyp nicht dauerhaft gespeichert. Im finalen System erfolgt die Speicherung über die Backend-API.

### Check-in Page

Route: `/check-in/:sessionId`

Die Check-in Page simuliert den QR-Code-Check-in vor Ort.

Enthält:

- QR-Code-Mock
- Button zur Teilnahmebestätigung
- Success State
- XP-Anzeige nach Check-in
- Links zurück zur Session oder zum Profil

### Profile Page

Route: `/profile`

Die Profile Page zeigt Gamification-Elemente und Nutzerfortschritt.

Enthält:

- Profilkopf
- Level
- Rang
- XP-Fortschrittsbalken
- Streak
- bevorzugte Sportarten
- Avatar-Items als MVP-Placeholder
- letzte Aktivitäten

### Events & Challenges Page

Route: `/events`

Die Events & Challenges Page zeigt offizielle Events und Challenges, durch die Nutzer zusätzliche XP sammeln können.

Enthält:

- Featured Event
- aktive Challenges
- Challenge-Fortschritt
- XP-Belohnung
- kommende Events

## Komponentenstruktur

Wichtige Komponenten:

```txt
src/components/layout/
  AppLayout.tsx
  BottomNavigation.tsx
  TopBar.tsx

src/components/sessions/
  SessionCard.tsx
  StatusBadge.tsx
  CreateSessionForm.tsx

src/components/events/
  ChallengeCard.tsx
```

## Mockdaten

Die App verwendet aktuell Mockdaten aus:

```txt
src/data/mockSessions.ts
src/data/mockUser.ts
src/data/mockActivities.ts
src/data/mockChallenges.ts
```

Diese Daten dienen nur zur Darstellung und zum Testen der User Flows.

## Service-Schicht

Damit die spätere Backend-Anbindung einfacher wird, greifen Pages nicht direkt auf Mockdaten zu, sondern über Services:

```txt
src/services/sessionService.ts
src/services/userService.ts
src/services/activityService.ts
src/services/challengeService.ts
```

Aktuell liefern diese Services Mockdaten zurück. Später können dort API-Aufrufe ergänzt werden, ohne dass die UI-Komponenten stark angepasst werden müssen.

Beispiel aktueller Zustand:

```ts
export function getSessions() {
  return mockSessions;
}
```

Späterer Zielzustand:

```ts
export async function getSessions() {
  const response = await fetch("/api/sessions");
  return response.json();
}
```

## Aktueller Status

Der Frontend-Prototyp ist klickbar und deckt die wichtigsten Kernflows ab:

```txt
Discover → Session Detail → Check-in → Success → Profile
```

und:

```txt
Create Session → Formular ausfüllen → Success Preview
```

## Noch offene Punkte

- Backend-API anbinden
- echte Authentifizierung oder Demo-Login definieren
- echte Kartendarstellung prüfen
- QR-Code-Generierung und Scan technisch umsetzen
- Loading States ergänzen
- Fehlerzustände bei API-Fehlern ergänzen
- Tests für zentrale UI-Logik ergänzen