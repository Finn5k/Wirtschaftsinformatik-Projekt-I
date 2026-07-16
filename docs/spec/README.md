# Spezifikation nach Siedersleben-Schema

Dieser Ordner enthält die systematische Softwarespezifikation des LocalCourt-Projekts nach dem Siedersleben-Schema.

---

## Bausteine der Spezifikation

### **P1 — Ziele und Rahmenbedingungen** ✅ (fertig)
**Status**: ✅ Fertig  
**Datei**: `P1-ziele-rahmenbedingungen.md`

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
**Datei**: `P2-architekturueberblick.md`  
**Verwandte Datei**: `S1-nachbarsysteme.md` (Stub)

Beschreibt aus Anwendungssicht, wie sich LocalCourt in seine Umgebung einbettet:
- Welche externen Systeme kommunizieren mit LocalCourt?
- In welche Richtung läuft der Datenaustausch?
- Welche Koppelung und Häufigkeit der Kommunikation?

**Inhalte**:
- Systemkontext-Diagramm (Browser ↔ Supabase ↔ PostgreSQL, OpenStreetMap)
- Nachbarsysteme-Inventar (NB-01: Browser, NB-02: Supabase Auth, NB-03: Supabase PostgREST, NB-04: OpenStreetMap/Leaflet)
- Deployment-Topologie & Infrastruktur
- 3 kritische Datenflüsse: Session erstellen, Session entdecken/beitreten, Check-in
- Bewusste Ausschlüsse (KI-APIs, Payment, Email-Services, Message Queues)

**Hinweis**: Interne Komponenten-Architektur (z. B. React-Komponentenstruktur) ist nicht Bestandteil von P2 und im aktuellen Spezifikationsbestand noch nicht als eigener Baustein vorhanden.

---

### **F1 — Geschäftsprozesse** ✅ (fertig)
**Status**: ✅ Fertig
**Datei**: `F1-geschaeftsprozesse.md`

Nach Siedersleben (Kapitel 4.3): Reale (IT-unabhängige) Workflows mit temporaler und logischer Folge von Aktivitäten, durchgeführt von Akteuren (Menschen & IT-Systeme).

**Inhalte**:
- **F1.1 GP-01: Spontan Sportaktivitäten finden** (Participant-Sicht)
  - Akteure: Teilnehmer, Browser, LocalCourt, Supabase, OpenStreetMap
  - Aktivitäten A1–A18: Von "Lust auf Sport" → Suche → Karte → Beitreten → Session-Start
  - Activity Diagram mit Swimlanes
  
- **F1.2 GP-02: Regelmäßige Treffen organisieren** (Organizer-Sicht)
  - Akteure: Organisator, Browser, LocalCourt, QR-Code-Library
  - Aktivitäten A1–A23: Session-Erstellung → QR+PIN Generation → Check-In (QR oder PIN) → Auto-Close
  - Check-In-Details: QR-Code-Scan + Fallback PIN-Eingabe
  - Activity Diagram mit Swimlanes
  
- **F1.3 GP-03: Neue Sportarten entdecken** (Variant von GP-01)
  - Vereinfachte Beschreibung: Filterung auf "Alle Sportarten" statt einzelne
  
- **F1.4 Grenzen (Boundaries)**:
  - ❌ KEINE Benachrichtigungen (Email, SMS, Push)
  - ❌ KEINE Wartelisten (würden Notifications brauchen)
  - ❌ KEINE Ratings/Reviews
  - ❌ KEINE Admin-Reports
  - ❌ KEINE Direct Messaging
  
- **F1.5 Konsistenz-Check**: Mapping F1-Akteure ↔ P1-Stakeholder, P2-Nachbarsysteme, P1-Constraints

---

### **F2 — Anwendungsfälle** ✅ (fertig)
**Status**: ✅ Fertig  
**Datei**: `F2-anwendungsfaelle.md`

Systemunterstützte Interaktionen als stabile Use Cases UC-01 bis UC-12 (Suchen, Detail, Beitreten, Erstellen, Teilnehmer, Check-in, Historie, Profil) mit Use-Case-Diagrammen, detaillierten Spezifikationen, Akzeptanzkriterien und Konsistenzprüfung gegen P1/P2/F1.

---

### **F3 — Anwendungsfunktionen** ✅ (fertig)
**Status**: ✅ Fertig  
**Datei**: `F3-anwendungsfunktionen.md`

Nach Siedersleben: komplexe fachliche Regelwerke außerhalb der Anwendungsfälle. Enthält vier Anwendungsfunktionen mit Regeln, Entscheidungstabellen und Pseudocode-Kernen:
- **AF-01 Beitritts- und Kapazitätsregel** (löst die Concurrency-/Kapazitätsfrage aus UC-04; keine Überbuchung, keine Warteliste)
- **AF-02 Check-in-Validierung** (QR/PIN gleichwertig, Zeitfenster nur während `active`, Idempotenz)
- **AF-03 Session-Lifecycle** (zeitbasierte Ableitung scheduled → active → completed, Auto-Close)
- **AF-04 PIN- und QR-Code-Erzeugung** (4-stellige PIN je Session, QR mit Session-Bezug)

Schließt die in F2 offen gelassenen Punkte und hält Informatik-Algorithmen (Suchen/Sortieren) bewusst heraus.

---

### **D1 — Datenmodell** ✅ (fertig)
**Status**: ✅ Fertig  
**Datei**: `D1-datenmodell.md`

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
**Datei**: `D2-datentypen.md`

Fachliches Datentypenverzeichnis: Wertebereiche, Aufzählungen und Validierungsregeln der in D1 verwendeten Typen. Technische Typzuordnung (PostgreSQL) bleibt in N2.

**Inhalte**:
- Triviale Typen (`Text`, `Integer`, `Boolean`, `Timestamp`, `Url`) + Katalogübersicht
- Nicht-triviale Typen: `Identifier`, `SessionStatus`, `Pin`, `ParticipantStatus`, `Duration`, `GeoCoordinate`, `QrContent`
- Je Typ: Wertform, Enum-Werte, Gleichheit/Ordnung, Validierung
- Notations- und Multiplizitätskonventionen

---

### **S1 — Nachbarsysteme (Schnittstellen)** 🔄 (in Arbeit)
**Status**: 🔄 Stub vorhanden  
**Datei**: `S1-nachbarsysteme.md`

Detaillierte Schnittstellen-Contracts je Nachbarsystem (Browser, Supabase Auth, Supabase PostgREST, OpenStreetMap/Leaflet). Inventar liegt in P2.

---

### **B1 — Dialogspezifikation** ✅ (fertig)
**Status**: ✅ Fertig  
**Datei**: `B1-dialogspezifikation.md`

Benutzerdialoge nach Siedersleben: Dialoglandkarte, je Dialog Statik (Feldliste) und Dynamik (Aktionsliste, Zustände). Normativ für das MVP; der UI-Prototyp dient als Illustration.

**Inhalte**:
- Dialoglandkarte (Mermaid) und Index DLG-01–DLG-08 mit UC-/AF-Bezug
- 8 Dialoge: Anmelden, Entdecken (Liste), Karte, Session-Detail (zustandsabhängig), Session erstellen, Check-in (QR/PIN-Zustände), Meine Sessions (bevorstehend/vergangen), Profil
- Feldlisten mit Datentyp (D2), Datenmodell-Bezug (D1), Vorbelegung, Muss/Kann, Prüfung
- Standard-Benutzeraktionen (Navigation, Validierung, Fehler-/Leerzustände) einmal zentral
- Abgleich mit dem aktuellen Frontend: alle acht Dialoge sind im UI-Prototyp realisiert, aber noch ohne Backend beziehungsweise Persistenz
- Tatsächlich verbleibende Abweichungen, insbesondere Authentifizierung, Zugriffsschutz, Persistenz, echte QR-Verarbeitung und API-Fehlerzustände

---

### **N1 — Nichtfunktionale Anforderungen** ✅ (fertig)
**Status**: ✅ Fertig
**Datei**: `N1-nichtfunktionale-anforderungen.md`

Qualitätsanforderungen und prüfbare Qualitätsszenarien für den MVP.

**Inhalte**:
- Performance, mobile Nutzbarkeit und Bedienbarkeit
- Datenschutz, Sicherheit und Fehlerrobustheit
- Wartbarkeit, Testbarkeit und verständliche Fehlerkommunikation
- Betrieb im Free-/Student-Tier
- Zuordnung zu Use Cases, Dialogen, Datenobjekten und Prüfmethoden
- bewusst offene Qualitäts- und Umsetzungsfragen

---

### **N2 — Querschnittskonzepte / Umsetzung** (geplant)
**Status**: 🔄 Ausstehend  
**Geplante Inhalte**:
- Technische Typzuordnung, Schlüssel, Constraints, Indizes
- Atomarität des Beitritts, Statuspersistenz, Zählstrategie (offene Punkte aus D1/F3)
- PIN-Speicherung, Zeittoleranz beim Check-in, Testing, Monitoring

---

### **E2 — Glossar** (geplant)
**Status**: 🔄 Ausstehend  
**Geplante Inhalte**:
- Einheitliche Begriffe (Session, Teilnahme/Participant, Court/Sportort, Profil, Sportart, Check-in)

---

## Workflow

1. **P1/P2 definieren** (✅ Erledigt): Ziele, Scope, Constraints, Architekturüberblick
2. **F1–F3 definieren** (✅ Erledigt): Geschäftsprozesse, Anwendungsfälle, Anwendungsfunktionen
3. **D1/D2 definieren** (✅ Erledigt): Datenmodell und Datentypenverzeichnis
4. **S1 vervollständigen**: Schnittstellen der Nachbarsysteme detaillieren
5. **B1 definieren** (✅ Erledigt): Dialogspezifikation aus den Use Cases abgeleitet
6. **N1 schreiben** (✅ Erledigt): Nichtfunktionale Anforderungen definieren
7. **N2 schreiben**: Querschnittskonzepte und technische Umsetzung dokumentieren
8. **E2 schreiben**: Glossar konsolidieren

---

## Linkssamlung

- **Projekt-Root**: `README.md` (Tech-Stack, Kurzbeschreibung)
- **Team & Rollen**: `TEAMINFO.md`
- **Frontend-Prototyp**: [`../frontend.md`](../frontend.md)
- **Architekturüberblick**: [`P2-architekturueberblick.md`](P2-architekturueberblick.md)
- **Herold-Referenz**: [Herold P1 Example](https://github.com/carstenlucke/herold/blob/main/docs/spec/P1-ziele-rahmenbedingungen.md)

---

## Versionshistorie

| Datum | Autor | Änderung |
|-------|-------|----------|
| 2026-06-19 | Copilot (Plan-Mode) | P1 erstellt, Struktur definiert |
| 2026-07-11 | Claude Code (Opus 4.8) | D1 (Datenmodell) und D2 (Datentypenverzeichnis) erstellt; Bausteinliste an tatsächliche Siedersleben-Struktur (D1/D2/S1/B1/N1/N2/E2) angepasst |
| 2026-07-12 | Claude Code (Fable 5) | B1 (Dialogspezifikation) erstellt: Dialoglandkarte, DLG-01–DLG-08, Prototyp-Abgleich |
| 2026-07-16 | ChatGPT / Codex | Index an vorhandenen N1-Baustein und aktuellen UI-Prototyp angeglichen; veraltete Verweise korrigiert |

---

## Hinweise

- Alle Dokumente sollten in **Deutsch** geschrieben sein (konsistent mit TEAMINFO.md und Hochschul-Kontext).
- Tabellen und Listen bevorzugen statt Prosa-Fließtext, wo möglich.
- Querverweise zwischen Bausteinen (z.B. P1.5 → M2) explizit als Links dokumentieren.
- Nach Abschluss jeder Phase: Spec-Lead (Afrem) + Project-Lead (Finn) reviewen.

---

## Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | GitHub Copilot (Plan-Mode), Claude Code (Opus 4.8), ChatGPT / Codex |
| Verwendung | Aufbau und Pflege des Spezifikations-Index und der Baustein-Struktur; Abgleich der Statusangaben und Frontend-Verweise mit dem aktuellen Repository-Stand. |
| Prüfung | Statusangaben wurden gegen die vorhandenen Dateien unter `docs/spec/` und der Frontend-Hinweis gegen `src/` sowie [`../frontend.md`](../frontend.md) geprüft. Es wurden keine neuen fachlichen oder technischen Entscheidungen getroffen. Jeder Baustein weist die konkrete KI-Nutzung im eigenen Abschnitt „Eingesetzte KI-Werkzeuge" aus. |
