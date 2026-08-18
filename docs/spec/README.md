# Spezifikation nach Siedersleben-Schema

Dieser Ordner enthält die systematische Softwarespezifikation des LocalCourt-Projekts nach dem Siedersleben-Schema. Er dient als Index über alle Bausteine, deren Status und die Querverweise zwischen ihnen.

---

## Bausteine der Spezifikation

### **P1 — Ziele und Rahmenbedingungen** ✅ (fertig)
**Datei**: [P1-ziele-rahmenbedingungen.md](P1-ziele-rahmenbedingungen.md)

Beantwortet die strategischen Fragen:
- **Warum** wird das System gebaut?
- **Für wen** wird es gebaut?
- **Welche** Geschäftsziele sollen erreicht werden?
- **Welche** Constraints umrahmen den Lösungsraum?

**Inhalte**:
- Mission & Kernproblem
- Geschäftsziele (G-01 bis G-05)
- Stakeholder & Nutzer
- In-Scope vs. Out-of-Scope
- Technische, organisatorische, datenschutz-relevante Constraints
- Success Criteria

---

### **P2 — Architekturüberblick** ✅ (fertig)
**Datei**: [P2-architekturueberblick.md](P2-architekturueberblick.md)
**Verwandte Datei**: [S1-nachbarsysteme.md](S1-nachbarsysteme.md)

Beschreibt aus Anwendungssicht, wie sich LocalCourt in seine Umgebung einbettet:
- Welche externen Systeme kommunizieren mit LocalCourt?
- In welche Richtung läuft der Datenaustausch?
- Welche Koppelung und Häufigkeit der Kommunikation?

**Inhalte**:
- Systemkontext-Diagramm (Browser ↔ Supabase ↔ PostgreSQL, OpenStreetMap/Nominatim)
- Nachbarsysteme-Inventar (NB-01: Browser, NB-02: Supabase Auth, NB-03: Supabase PostgREST, NB-04: OpenStreetMap/Leaflet, NB-05: Nominatim)
- Deployment-Topologie & Infrastruktur
- 3 kritische Datenflüsse: Session erstellen, Session entdecken/beitreten, Check-in
- Bewusste Ausschlüsse (KI-APIs, Payment, E-Mail-Services, Message Queues)

**Hinweis**: Interne Komponentenarchitektur, React-Komponenten, API-Struktur, Laufzeitsichten, Deployment-Details und Architekturentscheidungen stehen in der [Architekturdokumentation](../arch/README.md).

---

### **F1 — Geschäftsprozesse** ✅ (fertig)
**Datei**: [F1-geschaeftsprozesse.md](F1-geschaeftsprozesse.md)

Nach Siedersleben (Kapitel 4.3): Reale (IT-unabhängige) Workflows mit temporaler und logischer Folge von Aktivitäten, durchgeführt von Akteuren (Menschen & IT-Systeme).

**Inhalte**:
- **F1.1 GP-01: Spontan Sportaktivitäten finden** (Participant-Sicht)
  - Akteure: Teilnehmer, Browser, LocalCourt, Supabase, OpenStreetMap
  - Aktivitäten A1–A18: Von "Lust auf Sport" → Suche → Karte → Beitreten → Session-Start
  - Activity Diagram mit Swimlanes

- **F1.2 GP-02: Regelmäßige Treffen organisieren** (Organizer-Sicht)
  - Akteure: Organisator, Browser, LocalCourt, QR-Code-Library
  - Aktivitäten A1–A23: Session-Erstellung → QR+PIN Generation → Check-in (QR oder PIN) → Auto-Close
  - Check-in-Details: QR-Code-Scan + Fallback PIN-Eingabe
  - Activity Diagram mit Swimlanes

- **F1.3 GP-03: Neue Sportarten entdecken** (Variante von GP-01)
  - Vereinfachte Beschreibung: Filterung auf "Alle Sportarten" statt einzelne

- **F1.4 Grenzen (Boundaries)**:
  - ❌ KEINE Benachrichtigungen (E-Mail, SMS, Push)
  - ❌ KEINE Wartelisten (würden Notifications brauchen)
  - ❌ KEINE Ratings/Reviews
  - ❌ KEINE Admin-Reports
  - ❌ KEINE Direct Messaging

- **F1.5 Konsistenz-Check**: Mapping F1-Akteure ↔ P1-Stakeholder, P2-Nachbarsysteme, P1-Constraints

---

### **F2 — Anwendungsfälle** ✅ (fertig)
**Datei**: [F2-anwendungsfaelle.md](F2-anwendungsfaelle.md)

Systemunterstützte Interaktionen als stabile Use Cases UC-01 bis UC-12 (Suchen, Detail, Beitreten, Erstellen, Teilnehmer, Check-in, Historie, Profil) mit Use-Case-Diagrammen, detaillierten Spezifikationen, Akzeptanzkriterien und Konsistenzprüfung gegen P1/P2/F1.

---

### **F3 — Anwendungsfunktionen** ✅ (fertig)
**Datei**: [F3-anwendungsfunktionen.md](F3-anwendungsfunktionen.md)

Nach Siedersleben: komplexe fachliche Regelwerke außerhalb der Anwendungsfälle. Enthält vier Anwendungsfunktionen mit Regeln, Entscheidungstabellen und einem Zustandsdiagramm (AF-03):
- **AF-01 Beitritts- und Kapazitätsregel** (löst die Concurrency-/Kapazitätsfrage aus UC-04; keine Überbuchung, keine Warteliste)
- **AF-02 Check-in-Validierung** (QR/PIN gleichwertig, Zeitfenster nur während `active`, Idempotenz)
- **AF-03 Status einer Sport-Session** (zeitbasierte Ableitung scheduled → active → completed, Auto-Close)
- **AF-04 PIN- und QR-Code-Erzeugung** (4-stellige PIN je Session, QR mit Session-Bezug)

Schließt die in F2 offen gelassenen Punkte und hält Informatik-Algorithmen (Suchen/Sortieren) bewusst heraus.

---

### **D1 — Datenmodell** ✅ (fertig)
**Datei**: [D1-datenmodell.md](D1-datenmodell.md)

Fachliches, konzeptionelles Datenmodell nach Siedersleben: Entitätstypen, Attribute und Beziehungen — unabhängig von der technischen Umsetzung.

**Inhalte**:
- ER-Diagramm (Mermaid) über 6 Entitätstypen: `profile`, `sport`, `court`, `session`, `participant`, `sport_preference`
- Attributtabellen je Entität (Typ, Multiplizität, Notiz) mit Verweisen auf D2
- Initialer Sportarten-Katalog mit `key` und `display_name`
- Beziehungstabelle B1–B7; Auflösung der n:m-Beziehungen (Teilnahme, Präferenz)
- Abgeleitete Merkmale (`status`, `confirmed_count`, `qr_content`) statt gepflegter Felder
- Invarianten (Organisator-als-Teilnehmer, Eindeutigkeit der Teilnahme, Check-in-Kopplung)
- Bewusst nicht modellierte Objekte (Warteliste, Nachrichten, Auth-Nutzer)

---

### **D2 — Datentypen (Datentypenverzeichnis)** ✅ (fertig)
**Datei**: [D2-datentypen.md](D2-datentypen.md)

Fachliches Datentypenverzeichnis: Wertebereiche, Aufzählungen und Validierungsregeln der in D1 verwendeten Typen. Technische Typzuordnung (PostgreSQL) bleibt in N2.

**Inhalte**:
- Triviale Typen (`Text`, `Integer`, `Boolean`, `Timestamp`, `Url`) + Katalogübersicht
- Nicht-triviale Typen: `Identifier`, `SessionStatus`, `Pin`, `ParticipantStatus`, `Duration`, `GeoCoordinate`, `QrContent`
- Je Typ: Wertform, Enum-Werte, Gleichheit/Ordnung, Validierung
- Notations- und Multiplizitätskonventionen

---

### **B1 — Dialogspezifikation** ✅ (fertig)
**Datei**: [B1-dialogspezifikation.md](B1-dialogspezifikation.md)

Benutzerdialoge nach Siedersleben: Dialoglandkarte, je Dialog Statik (Feldliste) und Dynamik (Aktionsliste, Zustände). Normativ für das MVP; der UI-Prototyp dient als Illustration.

**Inhalte**:
- Dialoglandkarte (Mermaid) und Index DLG-01–DLG-08 mit UC-/AF-Bezug
- 8 Dialoge: Anmelden, Entdecken (Liste), Karte, Session-Detail (zustandsabhängig), Session erstellen, Check-in (QR/PIN-Zustände), Meine Sessions (bevorstehend/vergangen), Profil
- Feldlisten mit Datentyp (D2), Datenmodell-Bezug (D1), Vorbelegung, Muss/Kann, Prüfung
- Standard-Benutzeraktionen (Navigation, Validierung, Fehler-/Leerzustände) einmal zentral
- Prototyp-Screenshots je Dialog (illustrativ, nicht bindend für das visuelle Design)
- Abgleich mit dem aktuellen Frontend: alle acht Dialoge sind im UI-Prototyp realisiert, teilweise mit lokaler Mock-Persistenz, aber noch ohne Backend beziehungsweise serverseitige Persistenz
- Verbleibende Abweichungen, insbesondere echte Authentifizierung und Autorisierung, serverseitige Persistenz, Court-Erfassung mit Reverse-Geocoding sowie API-Fehlerzustände

---

### **B2 — Batch** ❌ (nicht anwendbar)
LocalCourt sieht keine klassischen Batchprozesse (zeitgesteuerte Massenverarbeitung) vor: Der Session-Status wird laut [N2.6](N2-querschnittskonzepte.md#n26-statuspersistenz-af-03) bewusst bei jeder Abfrage berechnet statt per Scheduler/Cron gepflegt, gerade um eine zusätzliche Batch-Komponente im Free-Tier zu vermeiden (CON-T-02). Sollte sich dies ändern, wird B2 nachgezogen.

---

### **B3 — Druckausgaben** ❌ (nicht anwendbar)
LocalCourt sieht keine Druckausgaben vor; der QR-Code für den Check-in wird ausschließlich am Bildschirm angezeigt und gescannt (F1 GP-02, [N2.8](N2-querschnittskonzepte.md#n28-qr-inhalt-af-04)). Sollte sich dies ändern, wird B3 nachgezogen.

---

### **S1 — Nachbarsysteme (Schnittstellen)** ✅ (fertig)
**Datei**: [S1-nachbarsysteme.md](S1-nachbarsysteme.md)

Schnittstellen-Contracts je Nachbarsystem: die Operationen, die LocalCourt gegen ein Nachbarsystem auslöst, mit Ein-/Ausgaben, Semantik und Fehlerbehandlung. Das Inventar der Nachbarsysteme liegt in P2.

**Inhalte**:
- S1.1 Konventionen (synchron, Fehlerpropagierung, Degradation, Authentifizierung, Beschreibungsebene)
- NB-01 Browser als Nutzerkanal (Contract ist B1), inkl. Deep-Link-Einstieg für den Check-in
- NB-02 Supabase Auth: fünf Operationen, nur E-Mail+Passwort, automatische Profilanlage, Tokenablage
- NB-03 Supabase PostgREST: Leseoperationen je Use Case, drei atomare Schreiboperationen (`create_session`, `join_session`, `check_in`), einfache Schreibzugriffe
- NB-04 OpenStreetMap-Kachel-Dienst: Kartenanzeige und Pin-Setzen, Attribution und Nutzungsrichtlinie, Ausfallpfad
- NB-05 Nominatim: Reverse-Geocoding des gesetzten Court-Pins zu Ort und optionaler Adresse
- S1.7 bewusst nicht genutzte Schnittstellen (Realtime, Storage, Passwort-Reset, OAuth, Kamera, Geolocation)

**Ebene:** S1 benennt Operationen und Semantik; ihre Bindung an Bausteine und Laufzeitabläufe steht in der [Architekturdokumentation](../arch/README.md).

---

### **S2 — Datenmigration** ❌ (nicht anwendbar)
LocalCourt ist ein Greenfield-Projekt (siehe NG-09); es gibt keine Altdaten und damit keine Migration.

---

### **S3 — Inbetriebnahme** 🔄 (nach der Implementierung)
Installation, Umgebungseinrichtung, Betrieb auf Supabase/Vercel sowie Start- und Betriebsablauf lassen sich erst beschreiben, wenn die Anwendung tatsächlich betrieben wird. S3 wird deshalb bewusst nach der Implementierungsphase gepflegt und ist konsequenterweise auch nicht Teil der in [P1](P1-ziele-rahmenbedingungen.md) CON-O-03 als verpflichtend genannten Bausteine.

---

### **N1 — Nichtfunktionale Anforderungen** ✅ (fertig)
**Datei**: [N1-nichtfunktionale-anforderungen.md](N1-nichtfunktionale-anforderungen.md)

**Inhalte**:
- Performance, Skalierbarkeit im Free-Tier, Verfügbarkeit
- Sicherheit (PIN-Niveau, DSGVO), Usability, Datenschutz
- begründete Nicht-Festlegungen zu Feldlängen und fachlichen Obergrenzen

---

### **N2 — Querschnittskonzepte / Umsetzung** ✅ (fertig)
**Datei**: [N2-querschnittskonzepte.md](N2-querschnittskonzepte.md)

Technische Umsetzung der in D1, D2 und F3 bewusst offengelassenen Fragen auf dem Technologie-Stack aus P1/P2.

**Inhalte**:
- Technische Typzuordnung (D2 → PostgreSQL), Schlüssel, Constraints, Indizes
- Atomarität des Beitritts, Statuspersistenz und Zählstrategie
- PIN-Erzeugung und -Speicherung, QR-Inhalt, Identifier-Strategie
- Row-Level-Security, Fehler-Mapping der Ergebniscodes auf HTTP, Testing und Monitoring

---

### **E1 — Leseanleitung** ✅ (fertig)
**Datei**: [E1-leseanleitung.md](E1-leseanleitung.md)

Einstieg in die Spezifikation: wie sie aufgebaut ist, in welcher Reihenfolge man sie liest und welche Konventionen durchgängig gelten.

**Inhalte**:
- Zielgruppen und empfohlene Lesereihenfolge je Zielgruppe
- Überblick der Bausteingruppen (P, F, D, B, S, N, E) mit ihren Leitfragen
- Namens- und ID-Konventionen (GP-nn, UC-nn, AF-nn, G-nn, NG-nn, DLG-nn, NB-nn, N1-QA-nn)
- Diagramm- und Notationskonventionen
- Querverweise und Traceability von der Anforderung bis zu Code und Test
- Umgang mit offenen und nicht anwendbaren Bausteinen
- Konsistenzregeln für die gesamte Spezifikation

---

### **E2 — Glossar** ✅ (fertig)
**Datei**: [E2-glossar.md](E2-glossar.md)

Einheitliche Begriffe für die gesamte Spezifikation, jeweils mit fachlicher Definition, Abgrenzung und Fundstelle.

**Inhalte**:
- Begriffs- und Schreibkonventionen (deutsche Fachbegriffe, englische Feld- und ID-Namen)
- Alphabetisches Glossar mit rund 45 Einträgen — fachliche Begriffe (Session, Teilnahme, Court/Sportort, Profil, Sportart, Check-in, Beitritt, Kapazitätsgrenze), Rollen (Teilnehmer, Organisator) und technische Begriffe aus N2/S1 (RPC, RLS, Atomarität, Deep-Link, Ergebniscode)
- Bewusst abgegrenzte Begriffspaare (Court/Sportort, Use Case/Anwendungsfall, Sport/Sportart) und ausgeschlossene Konzepte (Warteliste)

---

## Workflow

1. **P1/P2 prüfen und pflegen** (✅ vorhanden): Ziele, Scope, Constraints, Architekturüberblick aktuell halten
2. **F1/F2/F3 prüfen und pflegen** (✅ vorhanden): Geschäftsprozesse, Anwendungsfälle, Anwendungsfunktionen aktuell halten
3. **D1/D2 prüfen und pflegen** (✅ vorhanden): Datenmodell und Datentypenverzeichnis aktuell halten
4. **B1 prüfen und pflegen** (✅ vorhanden): Dialogspezifikation aktuell halten
5. **S1/N2 prüfen und pflegen** (✅ vorhanden): Schnittstellen der Nachbarsysteme und Querschnittskonzepte aktuell halten
6. **E1/E2 prüfen und pflegen** (✅ vorhanden): Leseanleitung und Glossar aktuell halten
7. **B2/B3/S2** (✅ als nicht anwendbar dokumentiert)
8. **Architektur pflegen**: Interne Architektur in [docs/arch/README.md](../arch/README.md) mit der Spezifikation und Implementierung synchron halten
9. **Anforderungen umsetzen**: Anforderungen aus P1/F1–F3/D1–D2/N1 nachvollziehbar in Architektur, Code und Tests umsetzen
10. **S3 ergänzen**: Inbetriebnahme nach der Implementierung dokumentieren

---

## Linksammlung

- **Projekt-Root**: [../../README.md](../../README.md)
- **Team & Rollen**: [../../TEAMINFO.md](../../TEAMINFO.md)
- **Frontend-Prototyp**: [../frontend.md](../frontend.md)
- **Architektur**: [docs/arch/README.md](../arch/README.md)
- **Herold-Referenz**: [Herold P1 Example](https://github.com/carstenlucke/herold/blob/main/docs/spec/P1-ziele-rahmenbedingungen.md)

---

## Versionshistorie

| Datum | Autor | Änderung |
|-------|-------|----------|
| 2026-06-19 | Finn Belk, mit Copilot-Unterstützung | P1 und P2 Spezifikationsdokumente erstellt |
| 2026-06-30 | Finn Belk, mit Copilot-Unterstützung | F1 Geschäftsprozesse nach Siedersleben ergänzt |
| 2026-07-09 | Afrem Aydin, mit KI-Unterstützung | F2 Anwendungsfälle erstellt |
| 2026-07-10 | Finn Belk, mit Copilot-Unterstützung | F3 Anwendungsfunktionen ergänzt |
| 2026-07-10 | Finn Belk, mit Copilot-Unterstützung | P1/F2 fachlich angepasst und Wartelisten aus dem Scope entfernt |
| 2026-07-11 | Finn Belk, mit Claude-Code-Unterstützung | D1 Datenmodell erstellt |
| 2026-07-11 | Finn Belk, mit Claude-Code-Unterstützung | D2 Datentypenverzeichnis erstellt |
| 2026-07-11 | Finn Belk, mit KI-Unterstützung | Spezifikationsindex für D1/D2 aktualisiert und KI-Disclosure ergänzt |
| 2026-07-12 | Finn Belk, mit Claude-Code-Unterstützung | B1 Dialogspezifikation erstellt und im Spezifikationsindex als fertig markiert |
| 2026-07-14 | Afrem Aydin, mit KI-Unterstützung | P1 bereinigt |
| 2026-07-14 | Afrem Aydin, mit KI-Unterstützung | F2 Use-Case-Diagramme und Verweise überarbeitet |
| 2026-07-14 | Afrem Aydin, mit KI-Unterstützung | N1 Nichtfunktionale Anforderungen ergänzt |
| 2026-07-14 | Afrem Aydin, mit Claude-Code-/ChatGPT-Unterstützung | Spezifikationsindex aktualisiert: B2/B3/S2/S3/E1 ergänzt, N1-Status korrigiert, veraltete Verweise entfernt |
| 2026-07-16 | Chevron Rustler, mit Codex-Unterstützung | B1 mit dem Frontend-Prototyp abgeglichen, `docs/frontend.md` überarbeitet, AGENTS.md ergänzt |
| 2026-07-19 | Finn Belk, mit Claude-Code-Unterstützung | Prototyp-Screenshots in B1 eingebettet |
| 2026-07-26 | Finn Belk, mit Claude-Code-Unterstützung | Konsistenz-Fixes: toter Link in F3.1, P1.4-Widersprüche zu Scope (Bearbeiten/Löschen, Teilnehmerlimit, Profil-Sichtbarkeit) aufgelöst, Terminologie-Nit in F1, B2/B3/S2 final als nicht anwendbar dokumentiert |
| 2026-07-26 | Finn Belk, mit Claude-Code-Unterstützung | S1 Nachbarsysteme vollständig ausgearbeitet; N2-Status im Index nachgetragen; tote Anker in D1/N2 korrigiert |
| 2026-07-26 | Finn Belk, mit Claude-Code-Unterstützung | F1 auf die fachliche Ebene umgestellt; offene Punkte über alle Bausteine konsolidiert; `profile.city` spezifiziert; E1/E2-Status im Index nachgetragen und S3 auf „nach der Implementierung" gesetzt |
| 2026-07-28 | Chevron Rustler, mit Codex-Unterstützung | Veraltete Status- und Offenheitsformulierungen an bereits getroffene Entscheidungen in S1, N1 und N2 angeglichen |
| 2026-07-28 | Chevron Rustler, mit Codex-Unterstützung | Eindeutige Konsistenzfehler bei Geolocation, Beitrittsaktion, Löschverweis, F2-/N1-Statuszeilen und Verweisen auf bereits entschiedene Umsetzungsfragen bereinigt |
| 2026-07-28 | Chevron Rustler, mit Codex-Unterstützung | Doppelte Statusangaben, Entscheidungstabellen, Frontend-Offenpunktlisten und dezentrale Versionshistorie durch Verweise auf die jeweils maßgeblichen Stellen ersetzt |
| 2026-07-29 | Chevron Rustler, mit Codex-Unterstützung | Beschlossene MVP-Abgrenzungen zu Session-Änderungen und Profilbildern eingearbeitet, `cancelled` entfernt, Nominatim-Reverse-Geocoding spezifiziert und Check-in-Deep-Link im Prototyp angeglichen |
| 2026-07-29 | Chevron Rustler, mit Codex-Unterstützung | Bereits entschiedene Sichtbarkeit von Anzeigename und optionalem Profilbild in Teilnehmerlisten über B1, F2, D1, N1, N2 und S1 konsistent nachgezogen |
| 2026-07-29 | Chevron Rustler, mit Codex-Unterstützung | Teamentscheidungen zu Sortierung, Court-Dubletten, Organisator-Ergebnisdaten, Fehlertexten sowie DSGVO-Auskunft und -Löschung konsistent eingearbeitet |
| 2026-07-29 | Chevron Rustler, mit Codex-Unterstützung | Schlanke arc42-Architekturdokumentation mit Baustein-, Laufzeit- und Deployment-Sichten, Querschnittskonzepten, ADRs und Prototyp-Abgleich ergänzt |
| 2026-07-29 | Chevron Rustler, mit Codex-Unterstützung | Finalen Link-, Redundanz- und Konsistenzdurchlauf durchgeführt; P2-Kurzindex, Testabgrenzung und abgeschlossene Entscheidungsstände vereinheitlicht |
| 2026-08-16 | Chevron Rustler, mit Codex-Unterstützung | Frontend-Abgleich nach PR #49 bis #52 aktualisiert: simulierte Authentifizierung, lokale Session-Persistenz, Statusableitung und QR-Code-Erzeugung korrekt dokumentiert |

---

## Hinweise

- Alle Dokumente sollten in **Deutsch** geschrieben sein (konsistent mit TEAMINFO.md und Hochschul-Kontext).
- Tabellen und Listen bevorzugen statt Prosa-Fließtext, wo möglich.
- Querverweise zwischen Bausteinen, z. B. F2 → F3/D1/B1/N1 und D1 → D2, sollen explizit als relative Markdown-Links dokumentiert werden.
- Nach Abschluss jeder Phase: Spec-Lead (Afrem) + Project-Lead (Finn) reviewen.

---

## Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | GitHub Copilot, Claude Code, ChatGPT — soweit im jeweiligen Bearbeitungsschritt verwendet |
| Verwendung | Strukturierung, Formulierungsvorschläge, Konsistenzprüfung, Pflege des Spezifikationsindex und Verknüpfung der ergänzenden arc42-Architekturdokumentation |
| Prüfung | Inhalte wurden gegen die vorhandenen Spezifikationsbausteine, Repository-Vorgaben und Teamentscheidungen geprüft und manuell überarbeitet. Die fachliche Verantwortung bleibt beim Team. Jeder Baustein weist die konkrete KI-Nutzung zusätzlich im eigenen Abschnitt „Eingesetzte KI-Werkzeuge" aus. Redundanzkorrektur (2026-07-28, Codex): Status im Index nur noch in den Überschriften geführt; wiederholte Entscheidungen und dezentrale Status-/Historienangaben auf ihre maßgeblichen Fundstellen reduziert. Finaler Hygienecheck (2026-07-29, Codex): relative Linkziele, Abschnittsverweise, Offenheitsformulierungen und Kurzbeschreibungen erneut repositoryweit abgeglichen. Aktualisierung (2026-08-16, Codex): B1-Kurzbeschreibung und zentrale Historie gegen den implementierten Frontendstand aus PR #49 bis #52 geprüft. |
