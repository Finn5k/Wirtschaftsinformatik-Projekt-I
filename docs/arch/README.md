# LocalCourt — Architekturdokumentation

## 1. Zweck und Abgrenzung

Dieses Dokument beschreibt die innere Architektur von LocalCourt in Anlehnung
an arc42. Es verbindet die fachliche Spezifikation mit der späteren
Implementierung und ergänzt insbesondere:

- den Systemkontext und die Deployment-Topologie aus
  [P2](../spec/P2-architekturueberblick.md),
- die Schnittstellen-Contracts aus
  [S1](../spec/S1-nachbarsysteme.md),
- das fachliche Datenmodell aus
  [D1](../spec/D1-datenmodell.md) und
- die technischen Querschnittsentscheidungen aus
  [N2](../spec/N2-querschnittskonzepte.md).

Fachliche Anforderungen, Dialogfelder und Ergebniscodes werden hier nicht
erneut definiert. Dafür bleiben F2, F3 und B1 maßgeblich. Die Architektur
beschreibt den umgesetzten Stand; wo der Code davon abweicht, ist das je
Querschnittskonzept in [A08](A08-crosscutting-concepts.md) ausgewiesen, der
Abgleich mit den Dialogen aus B1 steht in
[docs/frontend.md](../frontend.md).

## 2. Kapitel

| Kapitel | Inhalt |
|---|---|
| [A01 — Einführung und Ziele](A01-introduction-and-goals.md) | Fachliche Fähigkeiten im MVP-Scope, die drei Qualitätsziele aus N1, Stakeholder. |
| [A02 — Randbedingungen](A02-architecture-constraints.md) | Technische, organisatorische und konventionelle Randbedingungen (TECH, ORG, CONV). |
| [A03 — Kontextabgrenzung](A03-context-and-scope.md) | Fachlicher und technischer Systemkontext, Nachbarsysteme NB-01 bis NB-05. |
| [A04 — Lösungsstrategie](A04-solution-strategy.md) | Technologiewahl, Top-Level-Zerlegung, Lösungsansatz je Qualitätsziel. |
| [A05 — Bausteinsicht](A05-building-block-view.md) | Whitebox LocalCourt (Ebene 1) und Service-Schicht (Ebene 2), Traceability zu F2/F3. |
| [A06 — Laufzeitsicht](A06-runtime-view.md) | Session beitreten, Check-in per QR-Code oder PIN, Session und Court erstellen. |
| [A07 — Verteilungssicht](A07-deployment-view.md) | Produktionsverteilung auf Browser, Vercel und Supabase-Projekt. |
| [A08 — Querschnittskonzepte](A08-crosscutting-concepts.md) | Datenmodell und Persistenz, Validierung, Zugriffsschutz, atomare Fachoperationen, Fehlerbehandlung — je Konzept mit dem Stand im Code. |
| [A09 — Architekturentscheidungen](A09-architecture-decisions.md) | ADR-001 (atomare Fachoperationen als RPC) und ADR-002 (Service-Schicht als Integrationsgrenze). |
| [A12 — Glossar](A12-glossary.md) | Architekturbegriffe, die A01–A09 voraussetzen; fachliche Begriffe stehen in [E2](../spec/E2-glossar.md). |

A10 und A11 werden nicht geführt: Die prüfbaren Qualitätsanforderungen stehen
vollständig in [N1](../spec/N1-nichtfunktionale-anforderungen.md), ein eigenes
Risikokapitel wird für das MVP nicht gepflegt.
