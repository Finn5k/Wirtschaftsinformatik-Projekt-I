# 8 Querschnittskonzepte

Die querschnittlichen Strategien dieses Kapitels sind, soweit spezifikationsseitig festgelegt, implementierungsfrei in [N2 — Querschnittskonzepte](../spec/N2-querschnittskonzepte.md) beschrieben; jeder Abschnitt hält fest, wie das jeweilige Konzept im aktuellen Repository realisiert ist — konkrete Dateien, Funktionen und Typen — und benennt Abweichungen vom Zielbild aus [A04](A04-solution-strategy.md)–[A07](A07-deployment-view.md). Abschnitt 8.1 hat kein unmittelbares N2-Gegenstück; er ordnet das D1-Datenmodell der tatsächlichen Code-Realisierung zu. Der aktuelle Code ist ein UI-Prototyp ohne Backend-Anbindung ([B1.6](../spec/B1-dialogspezifikation.md#b16-abweichungen-des-prototyps)); es existieren weder eine Supabase-Client-Datei noch eine `@supabase/*`-Abhängigkeit noch SQL-/Migrationsdateien im Repository — RPC-, RLS- und Datenbankaussagen aus N2/S1 sind daher ausschließlich Zielbild und werden als solche gekennzeichnet.

| § | Konzept | Spezifikationsgrundlage |
|---|---|---|
| [8.1](#81-datenmodell-und-persistenz) | Datenmodell und Persistenz | [D1](../spec/D1-datenmodell.md), [D2](../spec/D2-datentypen.md) |
| [8.2](#82-validierung) | Validierung | [F2](../spec/F2-anwendungsfaelle.md), [D2](../spec/D2-datentypen.md), [B1.5.3](../spec/B1-dialogspezifikation.md#b153-formular-validierung), [B1.5.4](../spec/B1-dialogspezifikation.md#b154-fehler--und-ladezustände) |
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

### 8.2.1 Grundprinzip

Eine Eingabeprüfung wird auf der Ebene vorgenommen, auf der sich die jeweilige Regel vollständig und zuverlässig ausdrücken lässt. Drei Ebenen werden unterschieden: **deklarative Eingabevalidierung im View** (HTML-/Formularattribute am Eingabeelement), **zusätzliche clientseitige fachliche Validierung** (TypeScript-Code im Validierungs-/Submit-Ablauf) und **autoritativ serverseitige Validierung** (Zielbild: RPC bzw. Datenbank-Constraint, siehe [8.4](#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht)).

Im aktuellen Prototyp werden keine expliziten deklarativen Constraints wie `required`, `min`/`max`, `minLength`/`maxLength` oder `pattern` verwendet (Prüfung per Volltextsuche über `src/components/` und `src/pages/`; kein Formular trägt eines dieser Attribute, keines setzt `noValidate`). Die vorhandenen Input-Typen `type="email"` (`LoginPage.tsx:144`) sowie `type="password"`/`type="date"`/`type="time"` (`LoginPage.tsx:158`, `CreateSessionForm.tsx:354,363`) liefern browserseitige Eingabe- und teilweise Validierungssemantik — `type="email"` etwa lässt den Browser bei einem nicht-leeren, formal ungültigen Wert eine native Constraint-Verletzung melden, auch ohne `required`. Weil kein Formular `noValidate` setzt, bleibt diese native Prüfung wirksam. Die projektspezifischen Prüfregeln (Pflichtfeld, Format, Wertevergleich) werden aktuell jedoch zusätzlich bzw. überwiegend eigenständig in TypeScript umgesetzt: Erst wenn die native Prüfung nicht blockiert (bzw. mangels `required`/`pattern` gar nicht erst greift), löst der Browser das `submit`-Ereignis aus; jedes Formular ruft darin `event.preventDefault()` auf und prüft anschließend vollständig in TypeScript (`validateForm()` in `CreateSessionForm.tsx:152`, `handleSubmit()` in `LoginPage.tsx:36`, `submitPin()` in `CheckInPage.tsx:71`). Die dritte Ebene existiert im Code nicht, da kein Backend angebunden ist ([B1.6](../spec/B1-dialogspezifikation.md#b16-abweichungen-des-prototyps)); sie ist ausschließlich Zielbild.

Die Abschnitte [8.2.2](#822-deklarative-view-validierung)–[8.2.5](#825-clientseitige-prüfung-und-serverseitige-autorität) formulieren die **Architekturregel für neue bzw. überarbeitete Eingaben** — unabhängig davon, ob das jeweilige Muster im aktuellen Prototyp schon durchgängig angewendet wird. [8.2.7](#827-beispiele-aus-dem-aktuellen-code) ordnet die bisher dokumentierten Fälle dieser Regel zu.

### 8.2.2 Deklarative View-Validierung

Lässt sich eine Regel vollständig am Eingabeelement ausdrücken, soll dafür das passende HTML-/React-Attribut verwendet werden, statt sie eigens in TypeScript nachzubilden:

- **Pflichtfeld:** `required`.
- **Einfaches Format:** ein passender `type` (`email`, `number`, …) bzw. `pattern`, wenn das Format eine feste Zeichenklasse ist (z. B. eine numerische Zeichenfolge fester Länge).
- **Statischer Wertebereich:** `min`/`max` bei `type="number"` bzw. `minLength`/`maxLength` bei Text, sofern die Grenze fest ist und nicht von anderen Feldern oder Laufzeitdaten abhängt. Rein zur Erläuterung, ohne dass LocalCourt aktuell ein solches Feld besitzt: Ein Bewertungsfeld mit `min="0" max="20"` wäre auf diese Weise umzusetzen.

Voraussetzung ist, dass die Regel **ohne weiteren Kontext** — kein Vergleich mit einem anderen Feld, keine Serverzeit, kein Ergebnis eines externen Aufrufs — vollständig geprüft werden kann. Ist das nicht der Fall, gehört die Prüfung nach [8.2.3](#823-zusätzliche-clientseitige-validierung).

### 8.2.3 Zusätzliche clientseitige Validierung

Zusätzlicher TypeScript-Code ist erforderlich, sobald eine Regel nicht als einfacher Input-Constraint formulierbar ist, insbesondere bei:

- Vergleich mehrerer Felder,
- zeitlichen Bedingungen,
- Abhängigkeit vom Ergebnis eines externen Aufrufs,
- fachlich abhängigen Prüfungen.

Ein bestehendes Beispiel für eine zeitliche Bedingung ist `isStartInPast()` (`CreateSessionForm.tsx:58`): Datum und Uhrzeit sind für sich genommen nur Pflichtfelder, aber ob der daraus gebildete Zeitpunkt in der Zukunft liegt, lässt sich nicht als Attribut am `date`-/`time`-Feld ausdrücken. Solche Regeln werden im Code an **einer** Stelle geprüft — einer zentralen `validate…`-Funktion (`validateForm()`, `CreateSessionForm.tsx:152`) oder, bei kleineren Formularen, direkt im Submit-Ablauf (`handleSubmit()` in `LoginPage.tsx:36`, `submitPin()` in `CheckInPage.tsx:71`) — statt dieselbe Regel an mehreren UI-Stellen zu wiederholen. Das Ergebnis wird als Fehlerobjekt pro Feld gehalten (`FormErrors`, `CreateSessionForm.tsx:52`; gleichnamiger Typ in `LoginPage.tsx:12`) und beim Ändern des betroffenen Felds zurückgesetzt (`updateForm()`, `CreateSessionForm.tsx:92`).

### 8.2.4 Fehlerbehandlung

Bei ungültiger Eingabe gilt projektweit dasselbe Muster ([B1.5.3](../spec/B1-dialogspezifikation.md#b153-formular-validierung)):

1. Die Aktion wird **nicht ausgeführt** — `validateForm()`/`submitPin()` geben bei einem Fehler zurück, bevor der eigentliche Aufruf (`createSession()`, `checkIn()`) ausgelöst wird (`CreateSessionForm.tsx:193`, `CheckInPage.tsx:71-81`).
2. Der Fehler erscheint **feldbezogen** mit verständlichem Text direkt am betroffenen Feld, mit `role="alert"` sowie `aria-invalid`/`aria-describedby` (`FormInput`, `CreateSessionForm.tsx:551-559`; `pinError`, `CheckInPage.tsx:165-174`).
3. Eine ungültige Eingabe wird nicht stillschweigend verworfen oder durch einen anderen Wert ersetzt. Eine bewusste Ausnahme ist die **Eingabeformatierung während der Eingabe** — die PIN-Eingabe filtert Nicht-Ziffern und begrenzt auf vier Zeichen, während getippt wird (`pinInput.replace(/\D/g, "").slice(0, 4)`, `CheckInPage.tsx:156`); das ist Bedienhilfe, keine Korrektur eines bereits abgeschickten, ungültigen Werts.
4. Nach Korrektur kann der Nutzer die Aktion erneut auslösen: Der Fehler wird beim nächsten Ändern des Felds zurückgesetzt (`CreateSessionForm.tsx:98`; `setPinError(null)`, `CheckInPage.tsx:157`), ein erneutes Absenden ist ohne Seitenwechsel möglich.
5. Angezeigt wird ausschließlich ein verständlicher, fachlicher Text — keine technischen Details. Auch der Geocoding-Fehlertext folgt diesem Muster (`"Der Ort konnte nicht ermittelt werden…"`, `CreateSessionForm.tsx:147`) statt einer rohen Nominatim-/Netzwerkmeldung.

### 8.2.5 Clientseitige Prüfung und serverseitige Autorität

Jede der hier beschriebenen Client-Prüfungen ist zunächst eine **Bedienhilfe**: Sie gibt dem Nutzer schnelles Feedback, verhindert aber nicht, dass ein manipulierter oder umgangener Client eine ungültige Anfrage absetzt. Ob eine Regel damit clientseitig ausreicht oder zusätzlich serverseitig autoritativ geprüft werden muss, hängt davon ab, was ihre Umgehung bewirken würde:

- **Clientseitig ausreichend:** Regeln, deren Umgehung höchstens zu einer unnötigen, für sich genommen harmlosen Anfrage führt oder ausschließlich Darstellung/Bedienkomfort betrifft.
- **Zusätzlich serverseitig erforderlich:** Regeln, deren Umgehung einen fachlich ungültigen Zustand erzeugen oder eine sicherheits-/integritätsrelevante Entscheidung verändern könnte — insbesondere jede Regel, die vor einem Schreibzugriff auf fachliche Daten steht.

Im Zielbild von LocalCourt betrifft das die drei atomaren Fachoperationen aus [8.4](#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht) — `create_session`, `join_session`, `check_in` — sowie geprüfte Schreibzugriffe wie `courtAnlegen` ([S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest)): Die autoritative Prüfung erfolgt dort als RPC-Logik bzw. Datenbank-Constraint, ergänzt um Row-Level-Security für den Zugriffsteil der Regel ([N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls)). Der aktuelle Prototyp hat **keine** dieser zweiten Ebenen: Ohne Backend-Anbindung ist die jeweilige Client-Funktion die einzige Instanz, die die Eingabe prüft ([B1.6](../spec/B1-dialogspezifikation.md#b16-abweichungen-des-prototyps)); das ist eine Abweichung vom Zielbild, keine Zielarchitektur.

### 8.2.6 Validierungsmatrix

| Art der Regel | Bevorzugte Umsetzung | Zusätzliche Codeprüfung | Serverseitige Prüfung (Zielbild) |
|---|---|---|---|
| Pflichtfeld | `required` am Eingabeelement | nur bei zusätzlicher Abhängigkeit (z. B. nur im Registrierungs-Modus, vgl. `displayName` in `LoginPage.tsx:49`) | falls fachlich integritätsrelevant |
| Einfaches Format | passender `type` bzw. `pattern` | wenn deklarativ nicht vollständig ausdrückbar (z. B. Wertevergleich gegen einen anderen Wert wie bei der PIN) | falls fachlich integritätsrelevant |
| Statischer Wertebereich | `min`/`max`, `minLength`/`maxLength` | bei dynamischen bzw. fachlich abgeleiteten Grenzen | bei integritätsrelevanten Daten |
| Feldübergreifende Regel | — | TypeScript-Validierung in einer benannten Funktion | wenn fachlich autoritativ erforderlich |
| Zeit-/Statusregel | — | TypeScript für frühes Nutzerfeedback (z. B. `isStartInPast()`) | serverseitig, wenn die Geschäftsregel geschützt werden muss (z. B. Zeitfenster bei AF-02) |
| Abhängig vom Ergebnis eines externen Aufrufs | — | TypeScript wartet auf das Ergebnis und blockiert bei Fehlschlag | falls das Ergebnis in fachliche Daten übernommen wird |

Diese Tabelle ist eine Zielrichtung; im Einzelfall entscheidet [8.2.2](#822-deklarative-view-validierung)/[8.2.3](#823-zusätzliche-clientseitige-validierung), ob eine konkrete Regel vollständig deklarativ ausdrückbar ist.

### 8.2.7 Beispiele aus dem aktuellen Code

Die folgenden drei Fälle wenden die vorstehende Regel konkret an; sie sind Beispiele, nicht der Kern des Konzepts.

**Session-Erstellung (UC-06).** `validateForm()` (`CreateSessionForm.tsx:152`) prüft mehrere Regeln unterschiedlicher Art in derselben Funktion: Die Pflichtfelder (Titel, Datum, Uhrzeit, Court) entsprächen nach [8.2.2](#822-deklarative-view-validierung) grundsätzlich `required`, sind im Code aber — wie in [8.2.1](#821-grundprinzip) festgehalten — noch nicht deklarativ ausgezeichnet, sondern ebenfalls in `validateForm()` geprüft; der zeitliche Vergleich `isStartInPast()` sowie die Abhängigkeit vom Geocoding-Ergebnis (`geocodingStatus !== "success"`) sind dagegen echte Fälle für [8.2.3](#823-zusätzliche-clientseitige-validierung), da sie nicht als reiner Input-Constraint ausdrückbar sind. Serverseitig ist im Zielbild `create_session` vorgesehen ([8.4](#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht)); im Code prüft `createSession()` selbst nichts (`sessionService.ts:119`).

**Check-in-PIN (UC-09).** `submitPin()` (`CheckInPage.tsx:71`) zeigt den Unterschied zwischen schnellem Client-Feedback und fachlicher Autorität besonders deutlich: Die Formatprüfung (`/^\d{4}$/`) wäre nach [8.2.2](#822-deklarative-view-validierung) grundsätzlich als `pattern` ausdrückbar; der anschließende Wertevergleich gegen `session.pin` ist dagegen fachlich abhängig und gehört nach [8.2.3](#823-zusätzliche-clientseitige-validierung). Beide Prüfungen sind im aktuellen Code ausschließlich clientseitig und damit reine Bedienhilfe — sie verhindern nicht, dass ein umgangener Client einen `checkIn()`-Aufruf mit falscher PIN absetzt, da `checkIn()` (`sessionService.ts:284`) die PIN nicht mitprüft (siehe [8.4](#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht)). Im Zielbild übernimmt die RPC `check_in` exakt diese Merkmalsprüfung autoritativ, als Teil von [F3 AF-02](../spec/F3-anwendungsfunktionen.md#af-02--check-in-validierung).

**Court-Standort (UC-10).** `lookupCourtLocation()`/`geocodingStatus` (`CreateSessionForm.tsx:112`) ist ein Fall von [8.2.3](#823-zusätzliche-clientseitige-validierung) — abhängig vom Ergebnis eines externen Aufrufs: Ein Court wird nur mit erfolgreich aufgelöstem Ort übernommen. Die Geocoding-Prüfung selbst bleibt bewusst clientseitig, da NB-05 (Nominatim) kein LocalCourt-eigenes Nachbarsystem mit Court-Autorität, sondern ein externer Auskunftsdienst ist ([S1.6](../spec/S1-nachbarsysteme.md#s16-nb-05--nominatim-reverse-geocoding)) — diese bestehende Architekturentscheidung ändert die Überarbeitung nicht. Die Wertebereichsprüfung des resultierenden Koordinatenpaars ([D2.7](../spec/D2-datentypen.md#d27-geocoordinate)) ist im Code nicht gesondert sichtbar; im Zielbild ist `courtAnlegen` ein geprüfter Schreibzugriff ([S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest)), über den eine solche Prüfung serverseitig erfolgen würde.

### 8.2.8 Zusammenfassung als Implementierungsregel

Für eine neue oder überarbeitete Eingabe gilt: Zuerst wird geprüft, ob die Regel deklarativ am Eingabeelement ausdrückbar ist ([8.2.2](#822-deklarative-view-validierung)). Andernfalls wird sie zentral im clientseitigen Validierungs- bzw. Submit-Ablauf der betroffenen Dialogseite oder Komponente geprüft, ohne dieselbe Prüfung an mehreren Stellen zu duplizieren ([8.2.3](#823-zusätzliche-clientseitige-validierung)). Bei einem Fehler wird die Aktion abgebrochen und eine feldbezogene, verständliche Meldung angezeigt ([8.2.4](#824-fehlerbehandlung)). Regeln, deren Umgehung einen fachlich ungültigen Zustand erzeugen könnte, werden zusätzlich an der autoritativen serverseitigen Grenze geprüft — im Zielbild als RPC-Logik, Datenbank-Constraint oder RLS-Policy ([8.2.5](#825-clientseitige-prüfung-und-serverseitige-autorität)); im aktuellen Prototyp existiert diese zweite Ebene mangels Backend-Anbindung noch nicht.

**Betroffene Bausteine ([A05](A05-building-block-view.md)):** Dialogseiten, UI-Komponenten.

## 8.3 Authentifizierung und Zugriffsschutz

**Realisierung.** `AuthProvider` (`src/auth/AuthProvider.tsx`) hält ein einzelnes Boolean-Flag `isAuthenticated`, gespiegelt im `localStorage`-Schlüssel `localcourt.mock-authenticated`; `login()`/`logout()` setzen beziehungsweise löschen ausschließlich dieses Flag. `ProtectedRoute` (`src/auth/ProtectedRoute.tsx`) liest den Wert über den Context `useAuth()` (`src/auth/authContext.ts`) und leitet bei `false` mit `Navigate` samt `?redirect=`-Parameter zu `/login` um; nach erfolgreichem `login()` kehrt die App-Shell zum ursprünglichen Ziel zurück ([B1.5.2](../spec/B1-dialogspezifikation.md#b152-weiterleitung-nicht-angemeldeter-nutzer)).

Es findet an keiner Stelle ein Aufruf gegen Supabase Auth statt, es wird kein JWT erzeugt oder mitgeführt, und `package.json` enthält keine `@supabase/*`-Abhängigkeit. Die in [N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls) beschriebenen RLS-Policies — einschließlich der Datenminimierung, dass von fremden Profilen nur `display_name`/`avatar_url` sichtbar sind und die PIN nur für Organisator und bestätigte Teilnehmer — sind ausschließlich spezifikationsseitig festgelegt; im Code spiegelt sich die Minimierung nur indirekt darin, dass der Typ `Participant` (`src/types/session.ts:17`) von vornherein keine Felder außer `id`, `name`, `status`, `avatarUrl` führt, also z. B. keine E-Mail oder Stadt einer anderen Person transportieren kann.

**Abweichung.** Der Zugriffsschutz ist eine reine Client-Simulation ohne Bezug zu einer echten Sitzung. Er verhindert clientseitig den Seitenaufruf, schützt aber keinen Datenzugriff: Jede Funktion in `src/services/` liest und schreibt direkt auf einen gemeinsam genutzten Modul-Zustand, unabhängig vom Wert von `isAuthenticated` und ohne jede Autorisierungsprüfung.

**Betroffene Bausteine ([A05](A05-building-block-view.md)):** App-Shell & Navigation. **Betroffene Use Cases:** UC-01 unmittelbar; mittelbar jede geschützte Aktion.

## 8.4 Atomare Fachoperationen und Datenzugriff über die Service-Schicht

Fachliche Datenzugriffe und Fachoperationen laufen über die Service-Schicht, nie direkt aus der UI-Schicht auf Persistenz oder ein fachliches Nachbarsystem ([A05](A05-building-block-view.md#51-whitebox-localcourt--ebene-1)). Rein darstellungsbezogene externe Zugriffe ohne fachliche Daten sind davon ausgenommen: Die Kartenkacheln von NB-04 OpenStreetMap werden über Leaflet/react-leaflet direkt aus der UI-Komponentenschicht bezogen (`CourtLocationPicker.tsx:75-79`, `MapPage.tsx:127-130`), nicht aus `src/services/` — NB-04 gehört deshalb nicht zur Service-Schicht ([A05 5.2](A05-building-block-view.md#52-bausteindiagramm)). Für die drei spezifizierten atomaren Fachoperationen — Session-Erstellung, Beitritt und Check-in — ist im Zielbild je eine atomare RPC vorgesehen ([S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest)); im aktuellen Code entspricht dem je eine synchrone Funktion in `src/services/sessionService.ts`:

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
