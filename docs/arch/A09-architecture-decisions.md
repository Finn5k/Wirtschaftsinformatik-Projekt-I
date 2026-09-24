# 9 Architekturentscheidungen

Dieses Kapitel dokumentiert die Entscheidungen, bei denen für LocalCourt zwischen mehreren realistischen Lösungsalternativen gewählt wurde: Kontext, Optionen, Entscheidung, Begründung und Konsequenzen. Randbedingungen aus [P1](../spec/P1-ziele-rahmenbedingungen.md)/[A02](A02-architecture-constraints.md) — PostgreSQL über Supabase (TECH-01), Hosting im Free-/Student-Tier auf Vercel/Supabase ohne eigenen Node-Backend-Server (TECH-02/TECH-03), OpenStreetMap/Nominatim als Nachbarsysteme (TECH-07) — sind bereits verbindlich festgelegt und werden hier nicht als eigene Entscheidung wiederholt, ebenso wenig die Lösungsstrategie aus [A04](A04-solution-strategy.md) oder die Bausteinstruktur aus [A05](A05-building-block-view.md). Die folgenden vier Entscheidungen betreffen, wie innerhalb dieser Randbedingungen konkrete architektonische Probleme gelöst werden.

## 9.1 ADR-001 — Atomare Fachoperationen über PostgreSQL-Funktionen (RPC) statt clientseitiger Prüfung

**Status:** Angenommen

**Kontext:** Kapazitätsgrenze ([F3 AF-01](../spec/F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel)) und einmaliger Check-in ([AF-02](../spec/F3-anwendungsfunktionen.md#af-02--check-in-validierung)) müssen auch bei gleichzeitigen Zugriffen halten ([N1-QA-01](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-01--konsistenz-von-beitritt-und-check-in)); bei der Erstellung müssen Session, Organisator-Eintrag und Organisator-Teilnahme gemeinsam entstehen ([D1.5](../spec/D1-datenmodell.md#d15-beziehungen)). Ohne eigenen Backend-Server (TECH-03) ist offen, wo diese mehrschrittigen Prüf- und Schreibvorgänge unteilbar laufen.

**Optionen:**

| Option | Vorteile | Nachteile |
|---|---|---|
| **A — Einzelschritte im Client** | Keine Datenbankfunktionen; Logik bleibt in TypeScript | Zeitfenster zwischen Prüfen und Schreiben (TOCTOU); unvollständige Datensätze bei Abbruch; umgangene Client-Prüfung wird nicht aufgefangen |
| **B — Unique-Constraint mit Retry** | Kein PL/pgSQL für den Doppelbeitritt | Kapazitätsprüfung bleibt im Client anfällig; Retry-Logik im Client; löst die Erstellung nicht |
| **C — Atomare PostgreSQL-Funktionen (RPC)** `create_session`, `join_session`, `check_in` | Invarianten datenbankseitig garantiert, unabhängig vom Client; Ergebniscodes aus F3 gehen unverändert an den Aufrufer | Fachlogik teils in PL/pgSQL; eigene Tests und Wartung |

**Entscheidung:** Option C — die drei RPCs sind der alleinige Schreibpfad für Erstellung, Beitritt und Check-in. F3 AF-01 verlangt „Atomarität statt Reihenfolgegarantie", und ohne Backend-Schicht ist die Datenbank der einzige Ort, an dem das unteilbar geht. `create_session` legt Session, Organisator-Eintrag, Organisator-Teilnahme und einen neu erfassten Court in einer Transaktion an, damit kein fehlschlagender Zwischenschritt die Invariante „Organisator zählt als Teilnehmer" verletzt oder einen verwaisten Court hinterlässt; ein eigenes Ergebniscode-Set ist für sie nicht spezifiziert.

**Begründung:** Kapazitätsgrenze und einmaliger Check-in müssen auch bei gleichzeitigen Zugriffen halten (N1-QA-01). Ohne Backend-Schicht (TECH-03) ist die Datenbank der einzige Ort, an dem Prüfen und Schreiben unteilbar laufen. Option A lässt ein Zeitfenster zwischen Prüfen und Schreiben und fängt eine umgangene Client-Prüfung nicht auf; Option B sichert weder die Kapazitätsprüfung noch die Erstellung ab. Das Sperren der Session-Zeile vor dem Zählen in `join_session` verhindert, dass parallele Beitritte die Kapazität überschreiten.

**Konsequenzen:**

- Die Invarianten gelten datenbankseitig, unabhängig vom Client; die Ergebniscodes aus F3 erreichen den Aufrufer unverändert.
- Bei der Erstellung entstehen Session, Organisator-Eintrag, Organisator-Teilnahme und ein neu erfasster Court gemeinsam oder gar nicht.
- Ein Teil der Fachlogik liegt in PL/pgSQL und muss bei Änderungen anhand der definierten Akzeptanzkriterien und fachlichen Invarianten gezielt geprüft und gewartet werden.
- Änderungen an dieser Logik erfolgen als Migrationen in `supabase/migrations/`; Aufrufe laufen ausschließlich über `sessionService`.

**Umsetzung:** [`supabase/migrations/`](../../supabase/migrations); `join_session` sperrt die Session-Zeile (`for update`) vor dem Zählen; Ergebniscodes als SQLSTATE `PTxyz` ([`supabase/README.md`](../../supabase/README.md)); Aufruf nur über `sessionService` ([A08 §8.4](A08-crosscutting-concepts.md#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht)).

---

## 9.2 ADR-002 — Service-Schicht als Integrationsgrenze für fachlichen Datenzugriff und Geocoding

**Status:** Angenommen

**Kontext:** Dialogseiten brauchen fachlichen Datenzugriff über PostgREST (NB-03) und Reverse-Geocoding über Nominatim (NB-05). Ohne serverseitige Zwischenschicht ([A04 §4.2](A04-solution-strategy.md#42-top-level-zerlegung)) liegen Tabellennamen, RPC-Signaturen und Ergebniscodes zwangsläufig im Client; offen ist, ob gebündelt oder über die Dialogseiten verteilt.

**Optionen:**

| Option | Vorteile | Nachteile |
|---|---|---|
| **A — Direkter Zugriff je Dialogseite** | Weniger Indirektion | Backend-Details über alle Seiten verteilt; Umstellung Mock → Supabase an jeder Seite einzeln |
| **B — Service-Schicht** `src/services/` als einziger Zugriffspfad | Anbindung an einer Stelle austauschbar; Fehlerbehandlung und Ergebniscode-Übersetzung zentral | Zusätzliche Abstraktionsebene; Signaturen müssen allen Aufrufern passen |

**Entscheidung:** Option B — `sessionService`, `courtService`, `userService` (NB-03) und `geocodingService` (NB-05) sind der einzige fachliche Zugriffspfad der UI. Das hat sich bewährt: Die Umstellung von Mockdaten auf Supabase änderte nur `src/services/`, die Dialogseiten erhielten lediglich Lade- und Fehlerzustände ([A08 §8.5.7](A08-crosscutting-concepts.md#857-stand-der-umsetzung)). Die Auth-Sitzung (NB-02) liegt außerhalb dieser Grenze beim Baustein App-Shell & Navigation (`src/auth/`): Die RPCs bestimmen die Nutzerkennung serverseitig über `auth.uid()`, und wo ein Lesezugriff sie braucht, übergibt die Dialogseite sie aus dem `AuthProvider` — kein Servicemodul liest die Sitzung selbst.

**Begründung:** Ohne serverseitige Zwischenschicht liegen Tabellennamen, RPC-Signaturen und Ergebniscodes zwangsläufig im Client. Die Service-Schicht bündelt diese Details an einer Stelle, statt sie über alle Dialogseiten zu verteilen. Bewährt hat sich das bei der Umstellung von Mockdaten auf Supabase, die nur `src/services/` betraf.

**Konsequenzen:**

- Die Backend-Anbindung ist an einer Stelle austauschbar; Fehlerbehandlung und Übersetzung der Ergebniscodes sind zentral.
- Die Dialogseiten bleiben frei von Backend-Details und müssen bei einem Wechsel der Anbindung nur Lade- und Fehlerzustände berücksichtigen.
- Es entsteht eine zusätzliche Abstraktionsebene, und die Signaturen der Services müssen allen Aufrufern passen.
- Die Auth-Sitzung liegt außerhalb der Grenze: Dialogseiten übergeben die Nutzerkennung aus dem `AuthProvider`, wo ein Lesezugriff sie braucht.

**Umsetzung:** `src/services/` mit gemeinsamem Client `supabaseClient.ts`; Zuordnung der Module zu den Nachbarsystemen in [A05 §5.4](A05-building-block-view.md#54-whitebox-service-schicht--ebene-2).

---

## 9.3 ADR-003 — Session-Status in einer Datenbankfunktion ableiten statt im Client

**Status:** Angenommen

**Kontext:** Nach [F3 AF-03](../spec/F3-anwendungsfunktionen.md#af-03--status-einer-sport-session) wird der Status bei jeder Abfrage abgeleitet, nicht gespeichert — ein Scheduler scheidet aus. *Wo* abgeleitet wird, lässt [D1.6](../spec/D1-datenmodell.md#d16-abgeleitete-merkmale) offen. Gebraucht wird der Status in der Anzeige und in den RPCs (`check_in` nur bei `active`, `join_session` nicht bei `completed`), die nach ADR-001 in der Datenbank prüfen.

**Optionen:**

| Option | Vorteile | Nachteile |
|---|---|---|
| **A — Im Client** (TypeScript, Gerätezeit) | Keine Datenbankfunktion für die Anzeige | Regel doppelt, gegen zwei Uhren: Anzeige kann einen Check-in anbieten, den `check_in` mit `OUTSIDE_WINDOW` ablehnt |
| **B — Eine Datenbankfunktion** `session_status()` für `v_session` und RPCs | Eine Definition, eine Uhr; Status in Abfragen filterbar | Regel in SQL; Anzeige erst nach Neuladen aktuell |

**Entscheidung:** Option B — `session_status()` ist die einzige Definition von AF-03. Option A war bis Ende August umgesetzt (`getSessionStatus`, entfernt in `a9a568a`) und hat genau den Widerspruch zwischen Anzeige und RPC erzeugt. Die verzögerte Aktualität der Anzeige wird hingenommen, weil die RPC jeden Check-in außerhalb des Zeitfensters ablehnt.

**Begründung:** Der Status wird in der Anzeige und in den RPCs gebraucht, die nach ADR-001 in der Datenbank prüfen. Eine einzige Definition mit einer einzigen Uhr vermeidet, dass dieselbe Regel doppelt und gegen zwei Uhren (Gerätezeit und Datenbank) gepflegt wird. Option A hat genau diesen Widerspruch erzeugt: Die Anzeige konnte einen Check-in anbieten, den `check_in` mit `OUTSIDE_WINDOW` ablehnte.

**Konsequenzen:**

- Anzeige und RPCs beruhen auf derselben Definition von AF-03; der Status ist in Abfragen filterbar.
- Da der Status bei jeder Abfrage abgeleitet wird, ist weder gespeicherter Status noch ein Scheduler nötig.
- Die Regel liegt in SQL statt in TypeScript.
- Die Anzeige ist erst nach einem Neuladen aktuell; ein zu früh oder zu spät angebotener Check-in wird von der RPC abgelehnt.

**Umsetzung:** [`supabase/migrations/20260826171838_views.sql`](../../supabase/migrations/20260826171838_views.sql); Regel in [A08 §8.1.4](A08-crosscutting-concepts.md#814-abgeleitete-und-redundante-daten).

---

## 9.4 ADR-004 — Sportarten-Katalog als statisches Frontend-Modul statt Laden zur Laufzeit

**Status:** Angenommen

**Kontext:** [D1.4](../spec/D1-datenmodell.md#sport--sportart-katalog) führt `sport` als Referenzkatalog, den keine Endnutzer pflegen; in der Datenbank per Seed-Migration befüllt. Das Frontend braucht Schlüssel und Anzeigenamen in Filtern, Formularen, Profil und auf jeder Session.

**Optionen:**

| Option | Vorteile | Nachteile |
|---|---|---|
| **A — Laden zur Laufzeit** aus `sport` | Eine Quelle; neue Sportart ohne Frontend-Änderung | Lade- und Fehlerzustand vor jedem Filter und Formular; `SportKey` kein Union-Typ |
| **B — Statisches Modul** `src/data/sports.ts` | Kein Ladezustand; Compiler prüft jeden Schlüssel | Zwei Quellen von Hand synchron halten; nur in der DB ergänzte Sportart erscheint als „Sonstiges" |

**Entscheidung:** Option B — das Frontend führt den Katalog als statisches Modul. Eine neue Sportart ist eine Migration durch das Team selbst ([A02](A02-architecture-constraints.md#22-organisatorische-randbedingungen) ORG-02), das Modul wird in derselben Änderung mitgezogen. Verbindung zur Datenbank ist der stabile Schlüssel aus D1.4, nicht die ID; nur `createSession()` löst ihn einmalig in die `sport_id` auf.

**Begründung:** Der Katalog wird von keinem Endnutzer gepflegt; neue Sportarten sind eine Migration durch das Team selbst (ORG-02). Schlüssel und Anzeigenamen werden in Filtern, Formularen, Profil und auf jeder Session gebraucht. Ein statisches Modul erspart dort Lade- und Fehlerzustände und lässt den Compiler jeden Schlüssel prüfen (`SportKey` als Union-Typ).

**Konsequenzen:**

- Filter und Formulare brauchen keinen Ladezustand für den Katalog, und ungültige Sportarten-Schlüssel fallen beim Kompilieren auf.
- Datenbank und Frontend führen den Katalog in zwei Quellen, die von Hand synchron zu halten sind: Eine neue Sportart erfordert Migration und Anpassung von `src/data/sports.ts` in derselben Änderung.
- Eine nur in der Datenbank ergänzte Sportart erscheint im Frontend als „Sonstiges".
- Die Verbindung zur Datenbank bleibt der stabile Schlüssel, nicht die ID.

**Umsetzung:** [`src/data/sports.ts`](../../src/data/sports.ts) spiegelt [`20260826171822_seed_sport.sql`](../../supabase/migrations/20260826171822_seed_sport.sql); Typabbildung in [A08 §8.1.2](A08-crosscutting-concepts.md#812-abbildung-fachlicher-daten-auf-typescript).
