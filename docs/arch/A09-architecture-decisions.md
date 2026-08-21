# 9 Architekturentscheidungen

Dieses Kapitel dokumentiert die Entscheidungen, bei denen für LocalCourt zwischen mehreren realistischen Lösungsalternativen gewählt wurde: Kontext, Optionen, Entscheidung und Begründung. Randbedingungen aus [P1](../spec/P1-ziele-rahmenbedingungen.md)/[A02](A02-architecture-constraints.md) — PostgreSQL über Supabase (TECH-01), Hosting im Free-/Student-Tier auf Vercel/Supabase ohne eigenen Node-Backend-Server (TECH-02/TECH-03), OpenStreetMap/Nominatim als Nachbarsysteme (TECH-07) — sind bereits verbindlich festgelegt und werden hier nicht als eigene Entscheidung wiederholt, ebenso wenig die Lösungsstrategie aus [A04](A04-solution-strategy.md) oder die Bausteinstruktur aus [A05](A05-building-block-view.md). Die folgenden zwei Entscheidungen betreffen, wie innerhalb dieser Randbedingungen konkrete architektonische Probleme gelöst werden.

## 9.1 ADR-001 — Atomare Fachoperationen über PostgreSQL-Funktionen (RPC) statt clientseitiger Prüfung

**Status:** Angenommen

**Kontext:**

Die Kapazitätsgrenze einer Session ([F3 AF-01](../spec/F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel)) und die Einmaligkeit eines Check-ins ([AF-02](../spec/F3-anwendungsfunktionen.md#af-02--check-in-validierung)) müssen auch bei gleichzeitigen Zugriffen mehrerer Nutzer konsistent bleiben ([N1-QA-01](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-01--konsistenz-von-beitritt-und-check-in)). Zusätzlich müssen bei der Session-Erstellung die zusammengehörigen Datensätze — Session, Organisator-Eintrag und die Teilnahme des Organisators als Teilnehmer ([D1.5](../spec/D1-datenmodell.md#d15-beziehungen) Invariante „Organisator-als-Teilnehmer") — gemeinsam entstehen, ohne dass ein Zwischenschritt fehlschlagen und einen unvollständigen Datensatz hinterlassen kann ([N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls), [A06 §6.3](A06-runtime-view.md#63-session-und-court-erstellen)). Da TECH-03 einen eigenen Node-Backend-Server ausschließt und der Datenzugriff ausschließlich über Supabase PostgREST läuft ([S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest)), stellt sich die Frage, wo und wie diese mehrschrittigen Prüf- und Schreibvorgänge für Session-Erstellung, Beitritt und Check-in ausgeführt werden, ohne die jeweilige Invariante zu verletzen.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A — Clientseitig gesteuerte Einzelschritte** | Frontend prüft Bedingungen (z. B. Kapazität, Doppelbeitritt) bzw. legt zusammengehörige Datensätze (Session, Organisator-Eintrag, Organisator-Teilnahme) in mehreren aufeinanderfolgenden Aufrufen an. | Keine Datenbank-Funktionen nötig, Fachlogik bleibt in TypeScript. | Zeitfenster zwischen Prüfung und Schreiben (TOCTOU) bei gleichzeitigen Zugriffen; Risiko unvollständiger Datensätze bei Abbruch zwischen den Einzelschritten (z. B. Session ohne Organisator-Eintrag); eine umgangene Client-Prüfung wird nicht aufgefangen. |
| **B — Unique-Constraint mit Retry** | Ein Datenbank-Constraint verhindert Doppelbeitritt; Kapazitätsprüfung bleibt clientseitig, bei Konflikt wird erneut versucht; mehrzeilige Erstellung bleibt mehrere Einzelaufrufe. | Kein PL/pgSQL-Code für die Kapazitätsprüfung. | Kapazitätsprüfung selbst bleibt clientseitig anfällig; zusätzliche Retry-Logik und uneinheitliche Fehlerbehandlung im Client; löst das Problem zusammengehöriger Datensätze bei der Erstellung nicht. |
| **C — Atomare PostgreSQL-Funktion (RPC)** | Prüfung (Anmeldung, Sessionstatus, Doppelbeitritt, Kapazität bzw. Merkmal/Zeitfenster) bzw. die zusammengehörige Erzeugung mehrerer Datensätze laufen serverseitig als eine unteilbare Transaktion, aufgerufen über PostgREST-RPC (`create_session`, `join_session`, `check_in`). | Kapazitäts- und Check-in-Invariante sowie die Vollständigkeit der bei `create_session` erzeugten Datensätze sind datenbankseitig garantiert, unabhängig vom Client-Verhalten; für `join_session` und `check_in` können die in [F3](../spec/F3-anwendungsfunktionen.md)/[N2.3](../spec/N2-querschnittskonzepte.md#n23-fehler-mapping-ergebniscodes--http) spezifizierten fachlichen Ergebniscodes unverändert an den Aufrufer zurückgegeben werden. | Fachlogik liegt teilweise in PL/pgSQL statt TypeScript; RPC-Funktionen benötigen eigene Tests und Wartung. |

**Entscheidung:** Option C — atomare PostgreSQL-Funktionen als alleiniger Schreibpfad für Session-Erstellung, Beitritt und Check-in.

**Begründung:**

[F3 AF-01](../spec/F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel) verlangt ausdrücklich „Atomarität statt Reihenfolgegarantie" für Prüfung und Anlage einer Teilnahme; [N1-QA-01](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-01--konsistenz-von-beitritt-und-check-in) macht dies zum geprüften Qualitätsziel. Für `join_session` und `check_in` sind die zugehörigen fachlichen Ergebniscodes und ihr HTTP-Mapping in [N2.3](../spec/N2-querschnittskonzepte.md#n23-fehler-mapping-ergebniscodes--http) festgelegt (u. a. `SESSION_FULL`, `ALREADY_JOINED` für AF-01; `INVALID_CREDENTIAL`, `OUTSIDE_WINDOW`, `ALREADY_CHECKED_IN` für AF-02). `create_session` ist in [S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest) ebenfalls als eine der drei atomaren RPCs benannt, jedoch aus einem anderen Grund: Die Funktion muss Session, Organisator-Eintrag und die Teilnahme des Organisators in einem Schritt anlegen, damit die Invariante „Organisator zählt ab Erstellung als Teilnehmer" ([D1.5](../spec/D1-datenmodell.md#d15-beziehungen), [F1 GP-01](../spec/F1-geschaeftsprozesse.md#f11-geschäftsprozess-sportgelegenheit-zustande-bringen-gp-01) A2) nicht durch einen fehlschlagenden Zwischenschritt verletzt werden kann — belegt durch [N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls) („kein Schreibzugriff außer über die Erstellungs-RPC, die `organizer`- und `participant`-Eintrag atomar mit der Session anlegt") und [A06 §6.3](A06-runtime-view.md#63-session-und-court-erstellen) („`create_session` ist atomar für Session und Organisator-Teilnahme"); ein eigenes Ergebniscode-Set für `create_session` ist dabei nicht spezifiziert. Da TECH-03 eine eigene Backend-Schicht ausschließt, ist die Datenbank in allen drei Fällen der einzige Ort, an dem diese Vorgänge unteilbar ausgeführt werden können; [A04](A04-solution-strategy.md#43-lösungsansätze-je-qualitätsziel) beschreibt das resultierende Verhalten. Im aktuellen UI-Prototyp ist diese Atomarität noch nicht realisiert: `createSession()`/`joinSession()`/`checkIn()` laufen synchron auf einem clientseitigen, je Browser-Instanz isolierten Array ohne Datenbankanbindung (siehe [A08 §8.4](A08-crosscutting-concepts.md#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht)).

---

## 9.2 ADR-002 — Service-Schicht als Integrationsgrenze für fachlichen Datenzugriff und Geocoding

**Status:** Angenommen

**Kontext:**

Dialogseiten benötigen fachlichen Datenzugriff über Supabase PostgREST (NB-03) und Reverse-Geocoding über Nominatim (NB-05); für UC-12 (Profil) zusätzlich die Nutzerkennung aus Supabase Auth (NB-02). Zu entscheiden ist, ob UI-Komponenten und Dialogseiten diese Nachbarsysteme direkt ansprechen oder über eine dedizierte Zwischenschicht.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A — Direkter Zugriff je Dialogseite** | Jede Seite ruft Supabase-Client-Methoden bzw. den Nominatim-Endpunkt selbst auf. | Kein zusätzliches Modul, weniger Indirektion. | Backend-Details (Tabellennamen, RPC-Signaturen, Ergebniscodes) verteilen sich über alle Dialogseiten; eine Umstellung von Mock- auf reale Daten erfordert Änderungen an jeder Seite einzeln. |
| **B — Service-Schicht als einziger Zugriffspfad** | Dialogseiten rufen für fachlichen Datenzugriff und Geocoding ausschließlich Funktionen aus `src/services/` auf; nur diese Module kennen die fachlichen PostgREST-/RPC-Details beziehungsweise den Nominatim-Endpunkt. | Backend-Anbindung ist an einer Stelle austauschbar (Mock → Supabase), ohne Dialogseiten anzupassen; Fehlerbehandlung und Ergebniscode-Übersetzung sind zentralisiert. | Zusätzliche Abstraktionsebene; Service-Signaturen müssen für alle Aufrufer passen. |

**Entscheidung:** Option B — Service-Schicht (`sessionService`, `courtService`, `userService`, `geocodingService`) als einziger fachlicher Zugriffspfad der UI auf NB-03 (vollständig) und NB-05 (vollständig); `userService` liest darüber hinaus die Nutzerkennung aus NB-02 für UC-12. Die Auth-Sitzung selbst (Login/Logout/Redirect) ist Teil des Bausteins App-Shell & Navigation und damit nicht Gegenstand dieser Entscheidung.

**Begründung:**

[A04 §4.1](A04-solution-strategy.md#41-technologie) legt fest, dass Seiten nicht direkt auf Supabase oder Nachbarsystem-Details zugreifen, „damit der UI-Prototyp schrittweise von Mock- auf persistente Services umgestellt werden kann, ohne die Dialogkomponenten neu zu strukturieren" — diese Austauschbarkeit wird bereits genutzt: Die Service-Module unter `src/services/` bilden im Prototyp bereits die vorgesehenen Integrationsgrenzen ab: `sessionService`, `courtService` und `userService` für die in [S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest) beschriebenen fachlichen Datenzugriffe sowie `geocodingService` für NB-05 gemäß [S1.6](../spec/S1-nachbarsysteme.md#s16-nb-05--nominatim-reverse-geocoding); aktuell arbeiten sie noch mit Mockdaten bzw. der vorhandenen Prototyp-Anbindung statt der vollständigen Zielarchitektur ([A08 §8.1](A08-crosscutting-concepts.md#81-datenmodell-und-persistenz)). [A05 §5.4](A05-building-block-view.md#54-whitebox-service-schicht--ebene-2) ordnet `sessionService`/`courtService` NB-03, `geocodingService` NB-05 und `userService` NB-02 (Nutzerkennung)/NB-03 (`profilAktualisieren`) zu. Die Auth-Sitzung selbst liegt außerhalb dieser Grenze: [A05 §5.1](A05-building-block-view.md#51-whitebox-localcourt--ebene-1) ordnet den Zugriffsschutz über die Supabase-Auth-Sitzung (NB-02) explizit dem Baustein App-Shell & Navigation zu (`src/auth/`), nicht der Service-Schicht — im Code entsprechend `AuthProvider`/`ProtectedRoute` statt eines Service-Moduls. Die hier dokumentierte Entscheidung betrifft daher die Integrationsgrenze für NB-03/NB-05 (vollständig) und den NB-02-Ausschnitt, den `userService` tatsächlich abdeckt — nicht die vollständige Authentifizierung.

---

## 9.3 Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | Claude Code |
| Verwendung | Analyse von Spezifikation, bestehender Architektur und aktuellem Repository sowie Entwurf und Strukturierung der Architekturentscheidungen. |
| Prüfung | Entscheidungen, Optionen und Begründungen gegen P1, N1/N2, S1 und A02–A08 geprüft; keine unbelegten Projektentscheidungen oder Technologien ergänzt. |
