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
