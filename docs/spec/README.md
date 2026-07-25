# Spezifikation nach Siedersleben-Schema

Dieser Ordner enthält die systematische Softwarespezifikation des LocalCourt-Projekts nach dem Siedersleben-Schema. Er dient als Index über alle Bausteine, deren Status und die Querverweise zwischen ihnen.

---

## Bausteine der Spezifikation

### **P1 — Ziele und Rahmenbedingungen** ✅ (fertig)
**Status**: ✅ Fertig
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
**Status**: ✅ Fertig
**Datei**: [P2-architekturueberblick.md](P2-architekturueberblick.md)
**Verwandte Datei**: [S1-nachbarsysteme.md](S1-nachbarsysteme.md)

Beschreibt aus Anwendungssicht, wie sich LocalCourt in seine Umgebung einbettet:
- Welche externen Systeme kommunizieren mit LocalCourt?
- In welche Richtung läuft der Datenaustausch?
- Welche Koppelung und Häufigkeit der Kommunikation?

**Inhalte**:
- Systemkontext-Diagramm (Browser ↔ Supabase ↔ PostgreSQL, OpenStreetMap)
- Nachbarsysteme-Inventar (NB-01: Browser, NB-02: Supabase Auth, NB-03: Supabase PostgREST, NB-04: OpenStreetMap/Leaflet)
- Deployment-Topologie & Infrastruktur
- 3 kritische Datenflüsse: Session erstellen, Session entdecken/beitreten, Check-in
- Bewusste Ausschlüsse (KI-APIs, Payment, E-Mail-Services, Message Queues)

**Hinweis**: Interne Komponentenarchitektur, React-Komponenten, API-Struktur, Laufzeitsichten, Deployment-Details und Architekturentscheidungen gehören nicht in P2, sondern in die Architekturdokumentation nach arc42 unter [../arch/](../arch/).

---

### **F1 — Geschäftsprozesse** ✅ (fertig)
**Status**: ✅ Fertig
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
**Status**: ✅ Fertig
**Datei**: [F2-anwendungsfaelle.md](F2-anwendungsfaelle.md)

Systemunterstützte Interaktionen als stabile Use Cases UC-01 bis UC-12 (Suchen, Detail, Beitreten, Erstellen, Teilnehmer, Check-in, Historie, Profil) mit Use-Case-Diagrammen, detaillierten Spezifikationen, Akzeptanzkriterien und Konsistenzprüfung gegen P1/P2/F1.

---

### **F3 — Anwendungsfunktionen** ✅ (fertig)
**Status**: ✅ Fertig
**Datei**: [F3-anwendungsfunktionen.md](F3-anwendungsfunktionen.md)

Nach Siedersleben: komplexe fachliche Regelwerke außerhalb der Anwendungsfälle. Enthält vier Anwendungsfunktionen mit Regeln, Entscheidungstabellen und Pseudocode-Kernen:
- **AF-01 Beitritts- und Kapazitätsregel** (löst die Concurrency-/Kapazitätsfrage aus UC-04; keine Überbuchung, keine Warteliste)
- **AF-02 Check-in-Validierung** (QR/PIN gleichwertig, Zeitfenster nur während `active`, Idempotenz)
- **AF-03 Session-Lifecycle** (zeitbasierte Ableitung scheduled → active → completed, Auto-Close)
- **AF-04 PIN- und QR-Code-Erzeugung** (4-stellige PIN je Session, QR mit Session-Bezug)

Schließt die in F2 offen gelassenen Punkte und hält Informatik-Algorithmen (Suchen/Sortieren) bewusst heraus.

---

### **D1 — Datenmodell** ✅ (fertig)
**Status**: ✅ Fertig
**Datei**: [D1-datenmodell.md](D1-datenmodell.md)

Fachliches, konzeptionelles Datenmodell nach Siedersleben: Entitätstypen, Attribute und Beziehungen — unabhängig von der technischen Umsetzung.

**Inhalte**:
- ER-Diagramm (Mermaid) über 6 Entitätstypen: `profile`, `sport`, `court`, `session`, `participant`, `sport_preference`
- Attributtabellen je Entität (Typ, Multiplizität, Notiz) mit Verweisen auf D2
- Beziehungstabelle B1–B7; Auflösung der n:m-Beziehungen (Teilnahme, Präferenz)
- Abgeleitete Merkmale (`status`, `confirmed_count`, `qr_content`) statt gepflegter Felder
- Invarianten (Organisator-als-Teilnehmer, Eindeutigkeit der Teilnahme, Check-in-Kopplung)
- Bewusst nicht modellierte Objekte (Warteliste, Nachrichten, Auth-Nutzer)

---

### **D2 — Datentypen (Datentypenverzeichnis)** ✅ (fertig)
**Status**: ✅ Fertig
**Datei**: [D2-datentypen.md](D2-datentypen.md)

Fachliches Datentypenverzeichnis: Wertebereiche, Aufzählungen und Validierungsregeln der in D1 verwendeten Typen. Technische Typzuordnung (PostgreSQL) bleibt in N2.

**Inhalte**:
- Triviale Typen (`Text`, `Integer`, `Boolean`, `Timestamp`, `Url`) + Katalogübersicht
- Nicht-triviale Typen: `Identifier`, `SessionStatus`, `Pin`, `ParticipantStatus`, `Duration`, `GeoCoordinate`, `QrContent`
- Je Typ: Wertform, Enum-Werte, Gleichheit/Ordnung, Validierung
- Notations- und Multiplizitätskonventionen

---

### **B1 — Dialogspezifikation** ✅ (fertig)
**Status**: ✅ Fertig
**Datei**: [B1-dialogspezifikation.md](B1-dialogspezifikation.md)

Benutzerdialoge nach Siedersleben: Dialoglandkarte, je Dialog Statik (Feldliste) und Dynamik (Aktionsliste, Zustände). Normativ für das MVP; der UI-Prototyp dient als Illustration.

**Inhalte**:
- Dialoglandkarte (Mermaid) und Index DLG-01–DLG-08 mit UC-/AF-Bezug
- 8 Dialoge: Anmelden, Entdecken (Liste), Karte, Session-Detail (zustandsabhängig), Session erstellen, Check-in (QR/PIN-Zustände), Meine Sessions (bevorstehend/vergangen), Profil
- Feldlisten mit Datentyp (D2), Datenmodell-Bezug (D1), Vorbelegung, Muss/Kann, Prüfung
- Standard-Benutzeraktionen (Navigation, Validierung, Fehler-/Leerzustände) einmal zentral
- Abweichungen des Prototyps: Nicht-MVP-Elemente (XP/Level, Events, Skins) und fehlende MVP-Dialoge

---

### **B2 — Batch** 🔍 (zu prüfen / ggf. nicht anwendbar)
**Status**: 🔍 Zu prüfen

Aktuell sind für LocalCourt keine klassischen Batchprozesse (zeitgesteuerte Massenverarbeitung) vorgesehen. Der Baustein wird bei Bedarf nachgezogen; andernfalls wird die Nicht-Anwendbarkeit hier dokumentiert.

---

### **B3 — Druckausgaben** 🔍 (zu prüfen / ggf. nicht anwendbar)
**Status**: 🔍 Zu prüfen

Aktuell sind keine Druckausgaben vorgesehen; der QR-Code für den Check-in wird ausschließlich am Bildschirm angezeigt und gescannt. Der Baustein wird bei Bedarf nachgezogen; andernfalls wird die Nicht-Anwendbarkeit hier dokumentiert.

---

### **S1 — Nachbarsysteme (Schnittstellen)** 🔄 (in Arbeit)
**Status**: 🔄 Vorhanden, Detaillierung ausstehend
**Datei**: [S1-nachbarsysteme.md](S1-nachbarsysteme.md)

Detaillierte Schnittstellen-Contracts je Nachbarsystem (Browser, Supabase Auth, Supabase PostgREST, OpenStreetMap/Leaflet). Inventar liegt in P2.

---

### **S2 — Datenmigration** 🔍 (zu prüfen / ggf. nicht anwendbar)
**Status**: 🔍 Zu prüfen

LocalCourt ist ein Greenfield-Projekt; aktuell ist keine Migration von Altdaten vorgesehen. Der Baustein wird bei Bedarf nachgezogen; andernfalls wird die Nicht-Anwendbarkeit hier dokumentiert.

---

### **S3 — Inbetriebnahme** 🔄 (geplant)
**Status**: 🔄 Ausstehend
**Geplante Inhalte**:
- Installation und Umgebungseinrichtung
- Betrieb auf Supabase/Vercel
- Start- und Betriebsablauf

---

### **N1 — Nichtfunktionale Anforderungen** ✅ (fertig)
**Status**: ✅ Fertig
**Datei**: [N1-nichtfunktionale-anforderungen.md](N1-nichtfunktionale-anforderungen.md)

**Inhalte**:
- Performance, Skalierbarkeit im Free-Tier, Verfügbarkeit
- Sicherheit (PIN-Niveau, DSGVO), Usability, Datenschutz
- Feldlängen und fachliche Obergrenzen (offene Punkte aus D2)

---

### **N2 — Querschnittskonzepte / Umsetzung** 🔄 (geplant)
**Status**: 🔄 Ausstehend
**Geplante Inhalte**:
- Technische Umsetzung der N1-Anforderungen (Constraints, Tests, Monitoring, Sicherheitsmaßnahmen)
- Technische Typzuordnung, Schlüssel, Constraints, Indizes
- Atomarität des Beitritts, Statuspersistenz, Zählstrategie (offene Punkte aus D1/F3)
- PIN-Speicherung, Zeittoleranz beim Check-in, Testing, Monitoring

---

### **E1 — Leseanleitung** 🔄 (geplant)
**Status**: 🔄 Ausstehend
**Geplante Inhalte**:
- Aufbau der Spezifikation und Beziehung der Bausteine zueinander
- Erläuterung der ID-Schemata (GP-nn, UC-nn, AF-nn, G-nn, NG-nn, DLG-nn)
- Konventionen für Querverweise
- Empfohlene Lesereihenfolge je nach Zielgruppe

---

### **E2 — Glossar** 🔄 (geplant)
**Status**: 🔄 Ausstehend
**Geplante Inhalte**:
- Einheitliche Begriffe (Session, Teilnahme/Participant, Court/Sportort, Profil, Sportart, Check-in)

---

## Workflow

1. **P1/P2 prüfen und pflegen** (✅ vorhanden): Ziele, Scope, Constraints, Architekturüberblick aktuell halten
2. **F1/F2/F3 prüfen und pflegen** (✅ vorhanden): Geschäftsprozesse, Anwendungsfälle, Anwendungsfunktionen aktuell halten
3. **D1/D2 prüfen und pflegen** (✅ vorhanden): Datenmodell und Datentypenverzeichnis aktuell halten
4. **B1 prüfen und pflegen** (✅ vorhanden): Dialogspezifikation aktuell halten
5. **S1 prüfen / vervollständigen**: Schnittstellen der Nachbarsysteme detaillieren
6. **B2/B3/S2 prüfen** und ggf. als nicht anwendbar dokumentieren
7. **S3/N2/E1/E2 ergänzen**: Inbetriebnahme, Querschnittskonzepte, Leseanleitung, Glossar schreiben
8. **Architektur nach arc42 erstellen**: Interne Architektur unter [../arch/](../arch/) dokumentieren
9. **Anforderungen umsetzen**: Anforderungen aus P1/F1–F3/D1–D2/N1 nachvollziehbar in Architektur, Code und Tests umsetzen

---

## Linksammlung

- **Projekt-Root**: [../../README.md](../../README.md)
- **Team & Rollen**: [../../TEAMINFO.md](../../TEAMINFO.md)
- **Architektur**: [../arch/](../arch/)
- **Herold-Referenz**: [Herold P1 Example](https://github.com/carstenlucke/herold/blob/main/docs/spec/P1-ziele-rahmenbedingungen.md)

---

## Versionshistorie

| Datum | Autor | Änderung |
|-------|-------|----------|
| 2026-06-19 | Finn Belk, mit Copilot-Unterstützung | P1 und P2 Spezifikationsdokumente erstellt |
| 2026-06-30 | Finn Belk | F1 Geschäftsprozesse nach Siedersleben ergänzt |
| 2026-07-09 | Afrem Aydin, mit KI-Unterstützung | F2 Anwendungsfälle erstellt |
| 2026-07-10 | Finn Belk | F3 Anwendungsfunktionen ergänzt |
| 2026-07-10 | Finn Belk | P1/F2 fachlich angepasst und Wartelisten aus dem Scope entfernt |
| 2026-07-11 | Finn Belk, mit Claude-Code-Unterstützung | D1 Datenmodell erstellt |
| 2026-07-11 | Finn Belk, mit Claude-Code-Unterstützung | D2 Datentypenverzeichnis erstellt |
| 2026-07-11 | Finn Belk, mit KI-Unterstützung | Spezifikationsindex für D1/D2 aktualisiert und KI-Disclosure ergänzt |
| 2026-07-12 | Finn Belk, mit Claude-Code-Unterstützung | B1 Dialogspezifikation erstellt und im Spezifikationsindex als fertig markiert |
| 2026-07-14 | Afrem Aydin, mit KI-Unterstützung | P1 bereinigt |
| 2026-07-14 | Afrem Aydin, mit KI-Unterstützung | F2 Use-Case-Diagramme und Verweise überarbeitet |
| 2026-07-14 | Afrem Aydin, mit KI-Unterstützung | N1 Nichtfunktionale Anforderungen ergänzt |
| 2026-07-14 | Afrem Aydin, mit Claude-Code-/ChatGPT-Unterstützung | Spezifikationsindex aktualisiert: B2/B3/S2/S3/E1 ergänzt, N1-Status korrigiert, veraltete Verweise entfernt |

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
| Verwendung | Strukturierung, Formulierungsvorschläge, Konsistenzprüfung und Pflege des Spezifikationsindex |
| Prüfung | Inhalte wurden gegen die vorhandenen Spezifikationsbausteine, Repository-Vorgaben und Teamentscheidungen geprüft und manuell überarbeitet. Die fachliche Verantwortung bleibt beim Team. Jeder Baustein weist die konkrete KI-Nutzung zusätzlich im eigenen Abschnitt „Eingesetzte KI-Werkzeuge" aus. |
