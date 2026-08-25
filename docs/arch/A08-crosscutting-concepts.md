# 8 Querschnittskonzepte

Die querschnittlichen Strategien dieses Kapitels sind, soweit spezifikationsseitig festgelegt, implementierungsfrei in [N2 — Querschnittskonzepte](../spec/N2-querschnittskonzepte.md) beschrieben; jeder Abschnitt hält fest, wie das jeweilige Konzept im aktuellen Repository realisiert ist — konkrete Module, Funktionen und Typen — und benennt Abweichungen vom Zielbild aus [A04](A04-solution-strategy.md)–[A07](A07-deployment-view.md). Abschnitt 8.1 hat kein unmittelbares N2-Gegenstück; er leitet aus [D1](../spec/D1-datenmodell.md)/[D2](../spec/D2-datentypen.md) eine allgemeine Regel für die technische Abbildung fachlicher Daten auf TypeScript-Typen und Persistenz ab und ordnet ihr die tatsächliche Code-Realisierung als Beispiel zu. Der aktuelle Code ist ein UI-Prototyp ohne Backend-Anbindung ([B1.6](../spec/B1-dialogspezifikation.md#b16-abweichungen-des-prototyps)); es existieren weder eine Supabase-Client-Datei noch eine `@supabase/*`-Abhängigkeit noch SQL-/Migrationsdateien im Repository — RPC-, RLS- und Datenbankaussagen aus N2/S1 sind daher ausschließlich Zielbild und werden als solche gekennzeichnet.

| § | Konzept | Spezifikationsgrundlage |
|---|---|---|
| [8.1](#81-datenmodell-und-persistenz) | Datenmodell und Persistenz | [D1](../spec/D1-datenmodell.md), [D2](../spec/D2-datentypen.md) |
| [8.2](#82-validierung) | Validierung | [F2](../spec/F2-anwendungsfaelle.md), [D2](../spec/D2-datentypen.md), [B1.5.3](../spec/B1-dialogspezifikation.md#b153-formular-validierung), [B1.5.4](../spec/B1-dialogspezifikation.md#b154-fehler--und-ladezustände) |
| [8.3](#83-authentifizierung-und-zugriffsschutz) | Authentifizierung und Zugriffsschutz | [N1-QA-03](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-03--zugriffsschutz-und-datensparsamkeit), [N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls), [S1.3](../spec/S1-nachbarsysteme.md#s13-nb-02--supabase-auth) |
| [8.4](#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht) | Atomare Fachoperationen und Datenzugriff über die Service-Schicht | [F3](../spec/F3-anwendungsfunktionen.md) AF-01/AF-02, [S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest), [N1-QA-01](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-01--konsistenz-von-beitritt-und-check-in) |
| [8.5](#85-fehlerbehandlung-und-ergebnisweitergabe) | Fehlerbehandlung und Ergebnisweitergabe | [N2.3](../spec/N2-querschnittskonzepte.md#n23-fehler-mapping-ergebniscodes--http), [S1.1](../spec/S1-nachbarsysteme.md#s11-konventionen) |
| [8.6](#86-zeit--und-statuskonzept) | Zeit- und Statuskonzept | [F3 AF-03](../spec/F3-anwendungsfunktionen.md#af-03--status-einer-sport-session), [D2.3](../spec/D2-datentypen.md#d23-sessionstatus) |

## 8.1 Datenmodell und Persistenz

### 8.1.1 Grundprinzip

Dieser Abschnitt beantwortet, wie fachliche Datenmodelle und Datentypen in LocalCourt grundsätzlich technisch umgesetzt und persistiert werden — nicht nur, wie die im aktuellen Prototyp vorhandenen Entitäten konkret implementiert sind. [D1](../spec/D1-datenmodell.md) legt fachliche Entitäten, ihre Beziehungen und Lebenszyklen implementierungsfrei fest; [D2](../spec/D2-datentypen.md) legt fachliche Datentypen, Wertebereiche und zulässige Werte fest. D1/D2 bestimmen damit ausschließlich die **fachliche Bedeutung** eines Konzepts — insbesondere ob es sich um eine eigenständige Entität, einen fachlichen Datentyp/Value Type oder einen Referenzwert/Katalog handelt. Wie diese fachliche Struktur technisch in TypeScript repräsentiert und persistiert wird, ist eine davon abgeleitete, aber eigenständige Implementierungsentscheidung — mehrere unabhängige Fragen:

- Welche **fachliche Bedeutung** ein Konzept hat — eigenständige Entität, fachlicher Datentyp/Value Type oder Referenzwert/Katalog —, legt D1/D2 fest.
- Ob dieses Konzept einen **eigenen benannten TypeScript-Typ** erhält, ist eine erste, davon abgeleitete Frage der Code-Struktur ([8.1.2](#812-abbildung-fachlicher-daten-auf-typescript)).
- Ob dieser Typ **top-level** oder nur **eingebettet** innerhalb eines anderen Typs verwendet wird, ist eine zweite, unabhängige Frage der Code-Struktur — „eingebettet" ist eine technische Repräsentationsentscheidung, keine fachliche D1-Kategorie ([8.1.2](#812-abbildung-fachlicher-daten-auf-typescript)).
- Ob es eine **eigene persistierte Tabelle** braucht und wer den Zugriff darauf verantwortet, ist eine Frage der Persistenzstrategie ([8.1.3](#813-persistenzregel)).

Die folgenden Abschnitte formulieren dafür eine wiederverwendbare Regel; [8.1.6](#816-beispiele-aus-dem-aktuellen-modell) wendet sie auf die sechs im aktuellen Modell vorhandenen D1-Entitäten an, ohne selbst die Regel zu sein.

### 8.1.2 Abbildung fachlicher Daten auf TypeScript

**Eigener TypeScript-Typ.** Ein fachliches Konzept erhält im Code ein eigenes Interface bzw. einen eigenen benannten Typ, wenn seine fachliche Struktur oder Wiederverwendung eine eigenständige Repräsentation rechtfertigt: eine eigenständige fachliche Bedeutung, eine eigene Identität, mehrere zusammengehörige Attribute, Verwendung über Modulgrenzen hinweg oder eigenständige Verarbeitungs-/Ableitungsregeln. Maßgeblich sind damit fachliche Struktur und Wiederverwendung — **nicht** die Persistenzfrage; ob ein Konzept einen eigenen Typ erhält, wird unabhängig davon entschieden, ob es später auch top-level verwendet oder eine eigene Tabelle bekommt (siehe das `participant`-Beispiel unten sowie [8.1.7](#817-zusammenfassung-als-implementierungsregel)). Im aktuellen Code treffen diese Kriterien auf `session` (`SportSession`), `court` (`Court`) und `profile` (`UserProfile`) klar zu (`src/types/`): Alle drei besitzen eine eigenständige fachliche Bedeutung und mehrere zusammengehörige Attribute und werden über mehrere Dialogseiten, Komponenten und Service-Module hinweg referenziert.

**Technisch eingebettete Struktur.** Ob ein Typ **top-level** (eigenständig referenzierbar, unabhängig ladbar) oder nur **eingebettet** innerhalb eines anderen Typs verwendet wird, ist eine von der Typexistenz unabhängige technische Entscheidung — „eingebettet" ist keine fachliche D1-Kategorie, sondern eine Aussage über die Code-Struktur. Vertretbar ist eine eingebettete Verwendung, wenn das Konzept im aktuellen technischen Modell keinen unabhängigen Lebenszyklus besitzt, nicht unabhängig geladen oder gespeichert wird und ausschließlich im Kontext des übergeordneten Objekts benötigt wird. `participant` ist dafür das Beispiel im aktuellen Code — mit vier getrennt zu betrachtenden Ebenen: fachlich ist es in [D1.4](../spec/D1-datenmodell.md#participant--teilnahme) eine **eigenständige Entität** mit eigener Identität und eigenen Invarianten; im Code besitzt es einen **eigenen benannten Typ**, `Participant` (`src/types/session.ts`); dieser Typ wird aber ausschließlich **eingebettet** als `Participant[]` auf `SportSession` verwendet, ohne eigene Ladefunktion und ohne eigenständige top-level Repräsentation; **persistiert** wird er im Prototyp entsprechend nur als Teil der Session, nicht eigenständig. **Wichtig:** Weil D1 `participant` als eigenständige Entität führt, sind die fehlende top-level Verwendung und die fehlende eigenständige Persistenz eine **Abweichung des Prototyps** vom D1-Zielmodell, keine Zielarchitektur — im Zielbild erhält `participant` eine eigene, RLS-beschränkte Tabelle ([N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls)). `organizer` weicht zusätzlich auch bei der Typexistenz ab: D1 modelliert es ebenso als eigene 1:1-Auflösungsentität zu `session` ([D1.5](../spec/D1-datenmodell.md#d15-beziehungen) B8); im Code existieren dafür aber nur die zwei Felder `organizerId`/`organizerName` direkt auf `SportSession`, ohne eigenen Typ und ohne eigenständige top-level Repräsentation; auch `organizer` erhält im Zielbild eine eigene Tabelle.

**Value Type, Union Type oder Katalog.** Keine eigene persistierte Entität ist erforderlich für endliche fachliche Wertebereiche, Enumerationen, Statuswerte und statische Referenzkataloge, wie D2 sie definiert; sie erhalten stattdessen einen Value Type bzw. Union Type, optional ergänzt um ein statisches Datenmodul. Die D2-Aufzählungen `SessionStatus` und `ParticipantStatus` sind dafür wortgleiche String-Union-Typen (`src/types/session.ts`); `SportType` ist ebenfalls ein Union Type, ergänzt um den statischen Katalog `src/data/sports.ts` als Liste der zulässigen Werte — die Entsprechung zum D1-Referenzkatalog `sport` ([D1.4](../spec/D1-datenmodell.md#sport--sportart-katalog)). Diese Typen ersetzen bewusst keine eigene Tabelle: `SessionStatus` wird nirgends gespeichert (siehe [8.1.4](#814-abgeleitete-und-redundante-daten)), und der Sportarten-Katalog ist im Prototyp ein Modul statt einer Tabelle, weil er im MVP nicht durch Endnutzer verändert wird ([D1.4](../spec/D1-datenmodell.md#sport--sportart-katalog)).

**D1/D2 → Code, im Überblick:**

| D1/D2-Konzept (fachlich) | Technische Umsetzung |
|---|---|
| D1-Entität mit eigener Identität, top-level verwendet | Interface bzw. strukturierter fachlicher Typ (`src/types/`) |
| D1-Entität, die im aktuellen technischen Modell nur eingebettet verwendet wird | eingebettetes Feld/Array auf dem übergeordneten Typ, ggf. mit eigenem benannten Typ für die Elemente — als Abweichung kenntlich, falls D1 eine eigenständige Entität vorsieht |
| D2-Aufzählung | String-Union-Typ |
| D2-Wertebereich mit Validierungsregel | TypeScript-Typ plus Prüfung an der Stelle der Erfassung (siehe [8.2](#82-validierung)) |
| D2-statischer Referenzwert | Union Type plus statisches Datenmodul bzw. Referenztabelle (Zielbild) |
| abgeleiteter D1-Wert ([D1.6](../spec/D1-datenmodell.md#d16-abgeleitete-merkmale)) | Berechnungsfunktion statt persistiertes Feld (siehe [8.1.4](#814-abgeleitete-und-redundante-daten)) |

Dass ein Konzept fachlich keine eigene persistierte Entität ist, schließt einen eigenen TypeScript-Typ nicht aus, und umgekehrt macht ein eigener TypeScript-Typ ein Konzept weder zu einer eigenständigen top-level Repräsentation noch automatisch zu einer eigenen Tabelle: `SessionStatus` besitzt einen eigenen Typ ohne eigene Tabelle; `participant` besitzt im Prototyp einen eigenen Typ (`Participant`), aber weder eine eigenständige top-level Repräsentation noch eine eigene Tabelle, obwohl D1 es als eigenständige Entität führt; `organizer` besitzt im Prototyp weder einen eigenen Typ noch eine eigene Tabelle; `session` besitzt sowohl einen eigenen Typ als auch eine eigenständige top-level Repräsentation mit eigener Tabelle im Zielbild. „Eigene fachliche Entität" (D1), „eigener TypeScript-Typ", „eigenständige top-level Repräsentation" und „eigene persistierte Tabelle" sind vier unabhängige Entscheidungen ([8.1.1](#811-grundprinzip)).

### 8.1.3 Persistenzregel

UI-Komponenten und Dialogseiten persistieren fachliche Daten nicht direkt. Fachliche Persistenzzugriffe laufen ausschließlich über die Service-Schicht ([A05 5.1](A05-building-block-view.md#51-whitebox-localcourt--ebene-1)) — dieselbe Regel wie in [8.4](#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht) für Fachoperationen, hier gleichermaßen für lesende und schreibende Datenzugriffe. Im aktuellen Code ist das durchgängig eingehalten: Sämtliche Persistenzzugriffe auf **fachliche D1-Daten** liegen unter `src/services/`, je Modul in einem eigenen `localStorage`-Schlüssel; keine Komponente und keine Dialogseite unter `src/components/`/`src/pages/` greift direkt auf `localStorage` zu. Diese Regel betrifft ausdrücklich fachliche D1-Daten, nicht jeden technischen Client-Zustand: Die Authentifizierungssimulation außerhalb der Service-Schicht (`src/auth/`) verwendet ebenfalls `localStorage`, für den lokalen Anmeldezustand (ein einzelnes Boolean-Flag, [8.3](#83-authentifizierung-und-zugriffsschutz)) — dieser Zustand ist kein fachlicher D1-Persistenzbestand und liegt bewusst außerhalb der Service-Schicht, da er kein Datenzugriff, sondern Zugriffsschutz ist.

**Wo Persistenz architektonisch verantwortet wird.** Im aktuellen Code existiert keine von der Service-Schicht getrennte Persistenz-, Repository- oder Adapter-Abstraktion — die **datenhaltenden Servicemodule** `sessionService`, `courtService` und `userService` lesen und schreiben die technischen Speicherorte fachlicher D1-Daten (In-Memory-Zustand, `localStorage`) unmittelbar selbst. Das vierte Modul der Service-Schicht, `geocodingService`, trägt dagegen keine Persistenzverantwortung: Es hält lediglich einen In-Memory-Cache für innerhalb einer Sitzung wiederholte Koordinatenanfragen und bildet ausschließlich den Zugriff auf den externen Auskunftsdienst NB-05 (Nominatim) ab, ohne fachliche D1-Daten zu halten, zu lesen oder zu schreiben ([S1.6](../spec/S1-nachbarsysteme.md#s16-nb-05--nominatim-reverse-geocoding)) — der Cache dient der Performance des Aufrufs, nicht der Persistenz eines D1-Datensatzes.

Die Persistenzverantwortung der drei datenhaltenden Servicemodule ist bereits in [A05 5.1](A05-building-block-view.md#51-whitebox-localcourt--ebene-1) der Service-Schicht zugeordnet, die dort als „Zentraler Zugriffspunkt auf fachliche Daten und Aktionen" beschrieben ist und im Zielbild „Supabase Auth, PostgREST/RPC und Nominatim" kapselt — Letzteres als externen Dienst, nicht als weiteres datenhaltendes System. Ein zusätzlicher, separater Persistenzbaustein wäre damit keine Ergänzung einer fehlenden Verantwortung, sondern eine Aufspaltung einer bereits bestehenden, in A04/A05 konsistent begründeten Kapselungsgrenze: LocalCourt ist als einschichtiger Browser-Client ohne eigene Backend-Zwischenschicht ausgelegt ([A04 4.2](A04-solution-strategy.md#42-top-level-zerlegung)), und die datenhaltenden Servicemodule sind darin — sowohl im aktuellen Prototyp (Mockdaten/`localStorage`) als auch im Zielbild (Supabase) — bereits der alleinige Zugriffspunkt auf die für Persistenz relevanten Nachbarsysteme, mit klar getrennten Rollen: Für die fachliche Persistenz selbst ist im Zielbild ausschließlich [NB-03 Supabase PostgREST/PostgreSQL](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest) maßgeblich; [NB-02 Supabase Auth](../spec/S1-nachbarsysteme.md#s13-nb-02--supabase-auth) ist kein Speicherort fachlicher D1-Daten, sondern stellt den Authentifizierungs- und Identitätskontext bereit, auf dessen Basis nutzerbezogene Zugriffe gegen NB-03 autorisiert bzw. zugeordnet werden. NB-05 Nominatim bleibt dabei ein externer Auskunftsdienst ohne Persistenzbezug zu LocalCourt und zählt ebenso wenig wie NB-02 zu den datenhaltenden Nachbarsystemen. Ein weiterer Baustein „Persistenz" hätte keine eigenständige Verantwortung, die nicht bereits bei den datenhaltenden Servicemodulen liegt, und wird deshalb **nicht** eingeführt; stattdessen macht dieser Abschnitt sowie die ergänzte Verantwortungsbeschreibung in [A05 5.1](A05-building-block-view.md#51-whitebox-localcourt--ebene-1)/[5.4](A05-building-block-view.md#54-whitebox-service-schicht--ebene-2) diese bestehende Verantwortung expliziter, statt sie neu zu erfinden.

Die konkreten technischen Speichermechanismen — im Prototyp wie im Zielbild — beschreibt [8.1.5](#815-aktueller-prototyp-und-zielbild).

### 8.1.4 Abgeleitete und redundante Daten

Fachlich abgeleitete Werte werden nicht zusätzlich persistiert, wenn sie zuverlässig aus vorhandenen Daten berechnet werden können und D1 keine redundante Speicherung vorsieht ([D1.6](../spec/D1-datenmodell.md#d16-abgeleitete-merkmale)). Weicht der aktuelle Prototyp davon ab, wird das als Abweichung dokumentiert, nicht als Architekturregel behandelt.

`status` erfüllt die Regel: Der abgeleitete Wert wird von `getSessionStatus()` bei jedem Zugriff aus `startAt`/`durationMin` berechnet und nirgends gespeichert ([8.6](#86-zeit--und-statuskonzept)) — konsistent mit [D1.6](../spec/D1-datenmodell.md#d16-abgeleitete-merkmale)/[D2.3](../spec/D2-datentypen.md#d23-sessionstatus). `confirmed_count` weicht dagegen ab: Im Code ist er als eigenständiges, redundant gepflegtes Feld `participantsCount` auf `SportSession` realisiert und bei jeder Kapazitätsänderung fortgeschrieben (`src/services/sessionService.ts`), statt bei jedem Zugriff aus `participants` gezählt zu werden — D1.6 verlangt ausdrücklich keine eigenständige Pflege. Diese Abweichung wird hier benannt, nicht zur Zielarchitektur erklärt.

### 8.1.5 Aktueller Prototyp und Zielbild

**Aktueller Prototyp.** Ohne Backend-Anbindung ([B1.6](../spec/B1-dialogspezifikation.md#b16-abweichungen-des-prototyps)) unterscheidet der Code drei Speicherarten: Daten, die nur für die Dauer der Browser-Sitzung im Modul-Zustand eines Servicemoduls gehalten werden (z. B. die vorgegebenen `mockSessions`); Daten, die zusätzlich reloadfest in `localStorage` gespiegelt werden, sobald sie durch eine Nutzeraktion entstehen oder sich ändern (selbst erstellte Sessions, Courts, das Profil); und rein statische Datenmodule ohne Laufzeitänderung (`src/data/sports.ts`). Welche Kategorie zutrifft, entscheidet nicht die Entität an sich, sondern ob im Prototyp ein Seiten-Reload den Datenverlust rechtfertigt — bei den vorgegebenen Mockdaten unkritisch, bei nutzererzeugten Daten nicht. Die konkreten `localStorage`-Schlüssel je Modul stehen als Beispiel in der Tabelle in [8.1.6](#816-beispiele-aus-dem-aktuellen-modell).

**Zielbild.** Persistenz erfolgt über PostgreSQL, ausschließlich über die PostgREST-Schnittstelle von Supabase ([A04 4.1](A04-solution-strategy.md#41-technologie), [S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest)), abgesichert durch Row-Level-Security ([N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls)). Lesende Zugriffe und einfache geprüfte Schreibzugriffe (`courtAnlegen`, `profilAktualisieren`) laufen direkt über PostgREST; die drei atomaren Fachoperationen `create_session`, `join_session`, `check_in` laufen dagegen über Datenbank-RPCs, die Prüfung und Schreibvorgang unteilbar zusammenfassen ([8.4](#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht)) — sie sind damit fachliche Operationen mit eigener Geschäftsregel, keine reine technische CRUD-Persistenz, und bleiben deshalb in [8.4](#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht) dokumentiert statt hier. Dieses Zielbild ist ausschließlich in A04/S1/N2 begründet und wird hier nicht erweitert.

### 8.1.6 Beispiele aus dem aktuellen Modell

Die folgende Tabelle wendet die Regeln aus [8.1.2](#812-abbildung-fachlicher-daten-auf-typescript)/[8.1.5](#815-aktueller-prototyp-und-zielbild) auf die sechs D1-Entitäten des aktuellen Modells an; sie ist ein Beispiel dieser Regeln, nicht deren Ersatz. Die Abweichungen von `participant`/`organizer` und `confirmed_count` sind bereits in [8.1.2](#812-abbildung-fachlicher-daten-auf-typescript) bzw. [8.1.4](#814-abgeleitete-und-redundante-daten) erläutert und hier nicht wiederholt.

| D1-Entität | Code-Typ | Persistenzort (Prototyp) | Zielrealisierung |
|---|---|---|---|
| `session` | `SportSession` (`src/types/`) | In-Memory-Zustand + `localStorage`-Schlüssel `localcourt.mock-created-sessions` (nur selbst erstellte Sessions; vorgegebene `mockSessions` nicht reloadfest) — `src/services/sessionService.ts` | PostgreSQL-Tabelle `session`, `status`/`confirmed_count` abgeleitet (siehe [8.1.4](#814-abgeleitete-und-redundante-daten)) |
| `participant` | `Participant` (`src/types/`) — eigener Typ, aber eingebettet als `Participant[]` auf `SportSession`, keine eigenständige top-level Repräsentation | Teil der Session-Persistenz | eigene Tabelle `participant`, RLS-beschränkt ([N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls)) |
| `organizer` | kein eigener Typ — Felder `organizerId`/`organizerName` direkt auf `SportSession` | Teil der Session-Persistenz | eigene Tabelle `organizer` (1:1 zu `session`, [D1](../spec/D1-datenmodell.md#organizer--organisation)) |
| `profile` | `UserProfile` (`src/types/`) | `localStorage`-Schlüssel `localcourt.mock-profile` — `src/services/userService.ts` | Supabase-Auth-gebundene Tabelle `profile` |
| `court` | `Court` (`src/types/`) | statische Mockdaten + `localStorage`-Schlüssel `localcourt.mock-created-courts` — `src/services/courtService.ts` | Tabelle `court` |
| `sport` | `SportType`-Union + Katalog `src/data/sports.ts` | statisches Modul | Referenztabelle `sport` |

### 8.1.7 Zusammenfassung als Implementierungsregel

Für ein neues fachliches Datenkonzept wird zunächst anhand von D1/D2 bestimmt, welche fachliche Bedeutung es hat — eigenständige Entität, fachlicher Datentyp/Value Type oder Referenzwert/Katalog ([8.1.2](#812-abbildung-fachlicher-daten-auf-typescript)). Diese fachliche Einordnung und die technische Wiederverwendung (top-level oder eingebettet) bestimmen gemeinsam die TypeScript-Repräsentation; die Persistenzfrage wird davon getrennt entschieden. Persistenz erfolgt nicht aus der UI, sondern ausschließlich über die datenhaltenden Servicemodule der Service-Schicht ([8.1.3](#813-persistenzregel)); ein zusätzlicher Persistenzbaustein ist dafür im aktuellen Modell weder vorhanden noch erforderlich, da diese Module die Kapselung bereits in Ist und Zielbild tragen. Ableitbare Werte werden nicht redundant gespeichert, sofern D1 dies nicht ausdrücklich vorsieht ([8.1.4](#814-abgeleitete-und-redundante-daten)). Weicht der aktuelle Prototyp von D1/D2 ab — etwa durch eine nur eingebettete statt top-level verwendeten Entität oder ein redundant gepflegtes Feld —, wird das explizit als Abweichung dokumentiert und nicht stillschweigend zur Zielarchitektur erklärt.

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
