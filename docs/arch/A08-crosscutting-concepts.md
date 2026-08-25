# 8 Querschnittskonzepte

Die querschnittlichen Strategien dieses Kapitels sind, soweit spezifikationsseitig festgelegt, implementierungsfrei in [N2 — Querschnittskonzepte](../spec/N2-querschnittskonzepte.md) beschrieben; jeder Abschnitt hält fest, wie das jeweilige Konzept im aktuellen Repository realisiert ist — konkrete Dateien, Funktionen und Typen — und benennt Abweichungen vom Zielbild aus [A04](A04-solution-strategy.md)–[A07](A07-deployment-view.md). Abschnitt 8.1 hat kein unmittelbares N2-Gegenstück; er ordnet das D1-Datenmodell der tatsächlichen Code-Realisierung zu. Der aktuelle Code ist ein UI-Prototyp ohne Backend-Anbindung ([B1.6](../spec/B1-dialogspezifikation.md#b16-abweichungen-des-prototyps)); es existieren weder eine Supabase-Client-Datei noch eine `@supabase/*`-Abhängigkeit noch SQL-/Migrationsdateien im Repository — RPC-, RLS- und Datenbankaussagen aus N2/S1 sind daher ausschließlich Zielbild und werden als solche gekennzeichnet.

| § | Konzept | Spezifikationsgrundlage |
|---|---|---|
| [8.1](#81-datenmodell-und-persistenz) | Datenmodell und Persistenz | [D1](../spec/D1-datenmodell.md), [D2](../spec/D2-datentypen.md) |
| [8.2](#82-validierung) | Validierung | [F2](../spec/F2-anwendungsfaelle.md), [D2](../spec/D2-datentypen.md), [B1.5.4](../spec/B1-dialogspezifikation.md#b154-fehler--und-ladezustände) |
| [8.3](#83-authentifizierung-und-zugriffsschutz) | Authentifizierung und Zugriffsschutz | [N1-QA-03](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-03--zugriffsschutz-und-datensparsamkeit), [N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls), [S1.3](../spec/S1-nachbarsysteme.md#s13-nb-02--supabase-auth) |
| [8.4](#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht) | Atomare Fachoperationen und Datenzugriff über die Service-Schicht | [F3](../spec/F3-anwendungsfunktionen.md) AF-01/AF-02, [S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest), [N1-QA-01](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-01--konsistenz-von-beitritt-und-check-in) |
| [8.5](#85-fehlerbehandlung-und-ergebnisweitergabe) | Fehlerbehandlung und Ergebnisweitergabe | [N2.3](../spec/N2-querschnittskonzepte.md#n23-fehler-mapping-ergebniscodes--http), [S1.1](../spec/S1-nachbarsysteme.md#s11-konventionen) |
| [8.6](#86-zeit--und-statuskonzept) | Zeit- und Statuskonzept | [F3 AF-03](../spec/F3-anwendungsfunktionen.md#af-03--status-einer-sport-session), [D2.3](../spec/D2-datentypen.md#d23-sessionstatus) |

## 8.1 Datenmodell und Persistenz

**Realisierung.** Die D1-Entitäten sind als TypeScript-Interfaces in `src/types/session.ts` und `src/types/user.ts` abgebildet; die D2-Aufzählungen `SessionStatus` und `ParticipantStatus` sind wortgleiche String-Union-Typen (`src/types/session.ts:12,15`). Im Prototyp werden die Daten ausschließlich clientseitig gehalten; soweit sie über Seiten-Neuladen hinweg erhalten bleiben, erfolgt dies über `localStorage`, je Service-Modul in einem eigenen Schlüssel:

| D1-Entität | Code-Typ | Persistenzort (Prototyp) | Zielrealisierung |
|---|---|---|---|
| `session` | `SportSession` (`src/types/session.ts`) | In-Memory-Array `sessions` + `localStorage`-Schlüssel `localcourt.mock-created-sessions` (nur selbst erstellte Sessions; vorgegebene `mockSessions` nicht reloadfest) — `src/services/sessionService.ts` | PostgreSQL-Tabelle `session` mit View für `status`/`confirmed_count` |
| `participant` | eingebettetes `Participant[]` auf `SportSession`, kein eigener Entitätstyp | Teil der Session-Persistenz | eigene Tabelle `participant`, RLS-beschränkt ([N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls)) |
| `organizer` | kein eigener Typ — Felder `organizerId`/`organizerName` direkt auf `SportSession` | Teil der Session-Persistenz | eigene Tabelle `organizer` (1:1 zu `session`, [D1](../spec/D1-datenmodell.md#rollenmodellierung-organisator-und-teilnehmer)) |
| `profile` | `UserProfile` (`src/types/user.ts`) | `localStorage`-Schlüssel `localcourt.mock-profile` — `src/services/userService.ts` | Supabase-Auth-gebundene Tabelle `profile` |
| `court` | `Court` (`src/types/session.ts`) | `mockCourts` + `localStorage`-Schlüssel `localcourt.mock-created-courts` — `src/services/courtService.ts` | Tabelle `court` |
| `sport` | `SportType`-Union + Katalog `src/data/sports.ts` | statisches Modul | Referenztabelle `sport` |

**Abweichungen vom Datenmodell.** `status` ist korrekt als abgeleiteter Wert realisiert — `getSessionStatus()` (§ [8.6](#86-zeit--und-statuskonzept)) berechnet ihn bei jedem Zugriff und speichert ihn nicht ([D1.6](../spec/D1-datenmodell.md#d16-abgeleitete-merkmale)). `confirmed_count` dagegen weicht ab: Im Code ist er als eigenständiges, redundant gepflegtes Feld `participantsCount` auf `SportSession` realisiert (`src/data/mockSessions.ts`, z. B. Zeile 42; fortgeschrieben in `createSession`/`joinSession`, `src/services/sessionService.ts:131,264`), statt bei jedem Zugriff aus `participants` gezählt zu werden — D1.6 verlangt ausdrücklich keine eigenständige Pflege. Die `organizer`-Entität aus D1 existiert im Code nicht als eigener Typ, sondern nur als zwei Felder auf `SportSession`; die 1:1-Beziehung zu `session` (D1 B8) hat noch keine strukturelle Entsprechung.

**Betroffene Bausteine ([A05](A05-building-block-view.md)):** Fachliche Typen & Regeln, Service-Schicht.

## 8.2 Validierung

Jede Eingabeprüfung im aktuellen Code ist eine Bedienhilfe im Browser; eine zweite, autoritative Prüfebene existiert nicht, weil keine RPC-/Datenbankebene angebunden ist.

| Grenze | Realisierung im Code | Zielbild |
|---|---|---|
| Session-Erstellung (UC-06) | `validateForm()` in `src/components/sessions/CreateSessionForm.tsx:152` — Pflichtfelder (Titel, Datum, Uhrzeit, Court), Startzeitpunkt muss in der Zukunft liegen (`isStartInPast`), bei Court-Neuerfassung Name und erfolgreich abgeschlossene Geokodierung erforderlich | RPC `create_session` / DB-Constraints ([N2](../spec/N2-querschnittskonzepte.md), [D2](../spec/D2-datentypen.md)) |
| Check-in-Merkmal (UC-09) | `submitPin()` in `src/pages/CheckInPage.tsx:71` — Formatprüfung (genau 4 Ziffern) und Wertevergleich gegen `session.pin` | RPC `check_in` prüft das Merkmal serverseitig als Teil von [F3 AF-02](../spec/F3-anwendungsfunktionen.md#af-02--check-in-validierung) |
| Court-Standort (UC-10) | `lookupCourtLocation()`/`geocodingStatus` in `CreateSessionForm.tsx:112` — ein Court wird nur mit erfolgreich aufgelöstem Ort übernommen | bleibt clientseitig, da NB-05 kein LocalCourt-eigenes Nachbarsystem mit Court-Autorität ist ([S1.6](../spec/S1-nachbarsysteme.md#s16-nb-05--nominatim-reverse-geocoding)) |

**Abweichung.** Für Session-Erstellung und Check-in sieht das Zielbild ([N2](../spec/N2-querschnittskonzepte.md), [S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest)) eine serverseitig autoritative Prüfung derselben Regeln vor. Diese existiert im Code nicht: Die oben genannten Funktionen sind die einzige Instanz, die die Eingabe prüft — es gibt keine Instanz, die eine manipulierte oder umgangene Client-Prüfung auffangen würde (vgl. [8.4](#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht)).

**Betroffene Bausteine ([A05](A05-building-block-view.md)):** Dialogseiten, UI-Komponenten (`CourtLocationPicker`).

## 8.3 Authentifizierung und Zugriffsschutz

**Realisierung.** `AuthProvider` (`src/auth/AuthProvider.tsx`) hält ein einzelnes Boolean-Flag `isAuthenticated`, gespiegelt im `localStorage`-Schlüssel `localcourt.mock-authenticated`; `login()`/`logout()` setzen beziehungsweise löschen ausschließlich dieses Flag. `ProtectedRoute` (`src/auth/ProtectedRoute.tsx`) liest den Wert über den Context `useAuth()` (`src/auth/authContext.ts`) und leitet bei `false` mit `Navigate` samt `?redirect=`-Parameter zu `/login` um; nach erfolgreichem `login()` kehrt die App-Shell zum ursprünglichen Ziel zurück ([B1.5.2](../spec/B1-dialogspezifikation.md#b152-weiterleitung-nicht-angemeldeter-nutzer)).

Es findet an keiner Stelle ein Aufruf gegen Supabase Auth statt, es wird kein JWT erzeugt oder mitgeführt, und `package.json` enthält keine `@supabase/*`-Abhängigkeit. Die in [N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls) beschriebenen RLS-Policies — einschließlich der Datenminimierung, dass von fremden Profilen nur `display_name`/`avatar_url` sichtbar sind und die PIN nur für Organisator und bestätigte Teilnehmer — sind ausschließlich spezifikationsseitig festgelegt; im Code spiegelt sich die Minimierung nur indirekt darin, dass der Typ `Participant` (`src/types/session.ts:17`) von vornherein keine Felder außer `id`, `name`, `status`, `avatarUrl` führt, also z. B. keine E-Mail oder Stadt einer anderen Person transportieren kann.

**Abweichung.** Der Zugriffsschutz ist eine reine Client-Simulation ohne Bezug zu einer echten Sitzung. Er verhindert clientseitig den Seitenaufruf, schützt aber keinen Datenzugriff: Jede Funktion in `src/services/` liest und schreibt direkt auf einen gemeinsam genutzten Modul-Zustand, unabhängig vom Wert von `isAuthenticated` und ohne jede Autorisierungsprüfung.

**Betroffene Bausteine ([A05](A05-building-block-view.md)):** App-Shell & Navigation. **Betroffene Use Cases:** UC-01 unmittelbar; mittelbar jede geschützte Aktion.

## 8.4 Atomare Fachoperationen und Datenzugriff über die Service-Schicht

Die UI-Schicht greift auf fachliche Daten und Aktionen über die Service-Schicht zu, nie direkt auf Persistenz oder Nachbarsysteme ([A05](A05-building-block-view.md#51-whitebox-localcourt--ebene-1)). Für die drei spezifizierten atomaren Fachoperationen — Session-Erstellung, Beitritt und Check-in — ist im Zielbild je eine atomare RPC vorgesehen ([S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest)); im aktuellen Code entspricht dem je eine synchrone Funktion in `src/services/sessionService.ts`:

| RPC (Zielbild) | Funktion (Code) | Prüfreihenfolge im Code |
|---|---|---|
| `create_session` | `createSession()` (`sessionService.ts:119`) | keine Prüfung — Session, PIN (`generatePin()`) und Organisator-Teilnahme werden bedingungslos angelegt |
| `join_session` | `joinSession()` (`sessionService.ts:249`) | `completed`-Status → Doppelbeitritt → Kapazität — entspricht der Reihenfolge aus [F3 AF-01](../spec/F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel), ohne deren vorgelagerten `NOT_AUTHENTICATED`-Fall, der stattdessen von `ProtectedRoute` behandelt wird ([8.3](#83-authentifizierung-und-zugriffsschutz)) |
| `check_in` | `checkIn()` (`sessionService.ts:284`) | prüft nur `active`-Status und vorhandene Teilnahme; die Merkmalsprüfung (PIN) liegt separat in `CheckInPage.tsx` ([8.2](#82-validierung)), nicht in `checkIn()` selbst |

```ts
// sessionService.ts:253 — join_session-Äquivalent
if (
  !session ||
  getSessionStatus(session) === "completed" ||
  session.participants.some((participant) => participant.id === currentUser.id) ||
  session.participantsCount >= session.maxParticipants
) {
  return session;                 // Ablehnung: unveränderte Session, kein Ergebniscode
}
```

**Abweichung.** Keine der drei Funktionen ist eine unteilbare Datenbankoperation: Alle laufen synchron im Browser auf einem einzigen, modulweiten Array. Die in [F3 AF-01](../spec/F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel)/[AF-02](../spec/F3-anwendungsfunktionen.md#af-02--check-in-validierung) geforderte Atomarität bei gleichzeitigem Zugriff mehrerer Nutzer ([N1-QA-01](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-01--konsistenz-von-beitritt-und-check-in)) ist im aktuellen, je Browser-Instanz isolierten Prototyp nicht wirksam prüfbar; sie bleibt eine Anforderung des Zielbilds und wird erst mit der RPC-/PostgreSQL-Anbindung technisch durchgesetzt. Zusätzlich prüft `checkIn()` das Merkmal nicht mit; anders als in [F3 AF-02](../spec/F3-anwendungsfunktionen.md#af-02--check-in-validierung) beschrieben, ist die Merkmalsprüfung im Code von der Zeitfenster-/Teilnahmeprüfung getrennt statt Teil derselben Operation.

**Betroffene Bausteine ([A05](A05-building-block-view.md)):** Dialogseiten, Service-Schicht (`sessionService`). **Betroffene Laufzeitszenarien ([A06](A06-runtime-view.md)):** 6.1–6.3.

## 8.5 Fehlerbehandlung und Ergebnisweitergabe

[N2.3](../spec/N2-querschnittskonzepte.md#n23-fehler-mapping-ergebniscodes--http) legt das Mapping der F3-Ergebniscodes auf HTTP-Status fest; dieses Mapping hat im Code keine Entsprechung, da kein Netzwerkaufruf stattfindet. `joinSession()` und `checkIn()` (§ [8.4](#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht)) geben bei Ablehnung die unveränderte Session zurück, ohne zwischen den in F3 definierten Ergebniscodes zu unterscheiden — der Aufrufer kann `OK` nicht von einer bestimmten Ablehnung unterscheiden.

Die Dialogseiten kompensieren das, indem sie die Zulässigkeit vor dem Aufruf selbst neu berechnen, statt sie aus einem Rückgabewert zu lesen: `SessionDetailPage` leitet `canJoin`/`canCheckIn` aus Status, Teilnahme und Kapazität ab (`src/pages/SessionDetailPage.tsx:69`) und zeigt je nach Ergebnis „Beitreten“, „Du bist dabei“ oder „Session ist voll“ — unabhängig vom Rückgabewert von `joinSession()`. Der einzige Ort, an dem eine Ablehnung tatsächlich als Inline-Meldung im Sinne von [B1.5.4](../spec/B1-dialogspezifikation.md#b154-fehler--und-ladezustände) erscheint, ist der lokale PIN-Fehlertext `pinError` in `CheckInPage.tsx:31,73,79` (z. B. „Ungültiger Code für diese Session.“, mit `role="alert"`).

**Abweichung.** Das systematische Ergebniscode→HTTP→UI-Mapping aus N2.3 existiert im Code nicht; die Rückmeldung an den Nutzer entsteht stattdessen aus einer zweiten, unabhängigen Neuberechnung der Fachregel in der jeweiligen Dialogseite. Eine Unterscheidung zwischen fachlicher Ablehnung und Erreichbarkeitsfehler eines Nachbarsystems ([S1.1](../spec/S1-nachbarsysteme.md#s11-konventionen)) ist im Prototyp nicht abbildbar, da keine Nachbarsystem-Aufrufe (außer NB-05, § [8.2](#82-validierung)) stattfinden.

**Betroffene Bausteine ([A05](A05-building-block-view.md)):** Service-Schicht, Dialogseiten. **Betroffene Laufzeitszenarien ([A06](A06-runtime-view.md)):** 6.1, 6.2.

## 8.6 Zeit- und Statuskonzept

`getSessionStatus()` (`src/utils/sessionTime.ts:24`) leitet `SessionStatus` bei jedem Aufruf aus `startAt`, `durationMin` und einem Zeitpunkt ab, exakt nach der Regel aus [F3 AF-03](../spec/F3-anwendungsfunktionen.md#af-03--status-einer-sport-session); der Wert wird nirgends gespeichert:

```ts
export function getSessionStatus(
  session: SessionTiming,
  now = new Date(),          // Default: Client-Uhr des Browsers
): SessionStatus { /* … */ }
```

Die Funktionssignatur nimmt den Referenzzeitpunkt als optionalen Parameter entgegen und ist insofern nicht an die Browser-Uhr gebunden; im aktuellen Code wird sie jedoch ausnahmslos mit dem Default `new Date()` aufgerufen — von `sessionService.ts` (Discovery-Filterung, „Meine Sessions“), `SessionDetailPage.tsx` und `CheckInPage.tsx` gleichermaßen, sodass innerhalb eines Browser-Tabs dieselbe Uhr für alle Ableitungen gilt. Eine Anbindung an eine Serverzeit existiert nicht, da keine RPC-Ebene vorhanden ist. Für die serverseitige Check-in-Prüfung sieht das Zielbild dagegen die maßgebliche Serverzeit vor, wie in der Check-in-Regel aus [F3 AF-02](../spec/F3-anwendungsfunktionen.md#af-02--check-in-validierung) und [A06 6.2](A06-runtime-view.md#62-check-in-per-qr-code-oder-pin) festgelegt. Ein zusätzliches Toleranzfenster am Rand von `active` ist nicht implementiert, konsistent mit der dort festgehaltenen Zusicherung „Kein Toleranzfenster" ([F3 AF-02](../spec/F3-anwendungsfunktionen.md#af-02--check-in-validierung); siehe auch [N1.3](../spec/N1-nichtfunktionale-anforderungen.md#n13-bewusst-nicht-verfolgte-qualitätsziele)).

**Betroffene Bausteine ([A05](A05-building-block-view.md)):** Fachliche Typen & Regeln, Service-Schicht, Dialogseiten. **Betroffene Use Cases:** UC-02, UC-03, UC-04, UC-05, UC-08, UC-09, UC-11.
