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

**Hinweis**: Interne Komponenten-Architektur (z.B. React Component Structure) gehört zu M1–M2, nicht zu P2.

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

### **M1 — Fachliche/Fachliche Anforderungen** (geplant)
**Status**: 🔄 Ausstehend  
**Geplante Inhalte**:
- Detaillierte Funktionale Anforderungen
- Use Cases / User Stories
- Datenmodell und Geschäftsobjekte
- Schnittstellen und Integrationen

---

### **M2 — Technische Architektur** (geplant)
**Status**: 🔄 Ausstehend  
**Geplante Inhalte**:
- Systemarchitektur (Client-Server, Komponenten)
- Technologie-Stack (React, Node.js, PostgreSQL, …)
- Deployment-Strategie
- Sicherheitsarchitektur & Authentication
- API-Design

---

### **N1 — Nichtfunktionale Anforderungen (Anforderungen)** (geplant)
**Status**: 🔄 Ausstehend  
**Geplante Inhalte**:
- Performance-Anforderungen (Latenz, Throughput)
- Skalierbarkeit
- Zuverlässigkeit & Verfügbarkeit
- Sicherheitsanforderungen (Encryption, DSGVO)
- Benutzerfreundlichkeit (Usability)
- Wartbarkeit

---

### **N2 — Nichtfunktionale Anforderungen (Umsetzung)** (geplant)
**Status**: 🔄 Ausstehend  
**Geplante Inhalte**:
- Testing-Strategie
- Sicherheits-Implementierung
- Monitoring & Logging
- Performance-Optimierungen

---

### **A1 — Funktionale Architektur** (geplant)
**Status**: 🔄 Ausstehend  
**Geplante Inhalte**:
- Detaillierte Komponentenstruktur
- Datenfluss zwischen Modulen
- Fehlerbehandlung
- Erweiterungspunkte

---

### **A2 — Technische Architektur (Umsetzung)** (geplant)
**Status**: 🔄 Ausstehend  
**Geplante Inhalte**:
- Code-Struktur & Organisa
- Framework-Konfiguration
- Build- und Deployment-Pipeline
- Dependency Management

---

## Workflow

1. **P1 definieren** (✅ Erledigt): Ziele, Scope, Constraints festlegen
2. **Stakeholder-Feedback** (🔄 Laufend): Team-Review & Approvals einholen
3. **M1 schreiben**: Fachliche Anforderungen in Details fassen
4. **M2 schreiben**: Technische Lösung entwerfen
5. **N1 schreiben**: Nichtfunktionale Kriterien definieren
6. **N2 schreiben**: Umsetzungsdetails dokumentieren
7. **A1 schreiben**: Funktionale Architektur konkretisieren
8. **A2 schreiben**: Technische Implementierung beschreiben

---

## Linkssamlung

- **Projekt-Root**: `README.md` (Tech-Stack, Kurzbeschreibung)
- **Team & Rollen**: `TEAMINFO.md`
- **Architektur**: `docs/arch/` (falls vorhanden)
- **Herold-Referenz**: [Herold P1 Example](https://github.com/carstenlucke/herold/blob/main/docs/spec/P1-ziele-rahmenbedingungen.md)

---

## Versionshistorie

| Datum | Autor | Änderung |
|-------|-------|----------|
| 2026-06-19 | Copilot (Plan-Mode) | P1 erstellt, Struktur definiert |
| — | — | — |

---

## Hinweise

- Alle Dokumente sollten in **Deutsch** geschrieben sein (konsistent mit TEAMINFO.md und Hochschul-Kontext).
- Tabellen und Listen bevorzugen statt Prosa-Fließtext, wo möglich.
- Querverweise zwischen Bausteinen (z.B. P1.5 → M2) explizit als Links dokumentieren.
- Nach Abschluss jeder Phase: Spec-Lead (Afrem) + Project-Lead (Finn) reviewen.
