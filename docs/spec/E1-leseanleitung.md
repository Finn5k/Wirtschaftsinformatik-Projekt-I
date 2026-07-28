# E1 — Leseanleitung

E1 ist eine **Leseanleitung** für die Spezifikation von LocalCourt. Der Baustein trifft selbst keine fachlichen Entscheidungen und führt keine neuen Anforderungen ein. Er erklärt, wie die Bausteine P1–P2, F1–F3, D1–D2, B1–B3, S1–S3 und N1–N2 zusammenhängen, welche Zielgruppe welchen Baustein in welcher Reihenfolge liest, welche ID- und Namenskonventionen gelten und wie sich ein einzelner Use Case von der Spezifikation über die Architektur und den Code bis in die Tests nachverfolgen lässt.

Der Spezifikationsindex [README.md](README.md) bleibt die maßgebliche **Statusübersicht** (welcher Baustein ist fertig, geplant oder nicht anwendbar) und **Versionshistorie**. E1 ergänzt diesen Index um den narrativen Leitfaden: *warum* die Bausteine so aufeinander aufbauen und *wie* man sich als Leser darin orientiert.

---

## E1.1 Zweck und Zielgruppe

E1 richtet sich an alle, die die LocalCourt-Spezifikation lesen, prüfen oder darauf aufbauen, ohne selbst an ihrer Erstellung beteiligt gewesen zu sein. Der Baustein beantwortet drei Fragen:

- **Wo fange ich an?** Abhängig von Rolle und Interesse ist ein anderer Einstiegspunkt sinnvoll (siehe [E1.3](#e13-empfohlene-lesereihenfolge)).
- **Wie hängen die Bausteine zusammen?** Die Siedersleben-Bausteine sind keine unabhängigen Dokumente, sondern eine Kette aus Verfeinerungsschritten (siehe [E1.4](#e14-überblick-der-bausteingruppen) und [E1.7](#e17-querverweise-und-traceability)).
- **Woran erkenne ich Konsistenz?** IDs, Benennungen und Statusangaben folgen festen Regeln, die ein Review nachvollziehbar machen (siehe [E1.5](#e15-namens--und-id-konventionen) und [E1.9](#e19-konsistenzregeln)).

E1 ersetzt nicht das Glossar (E2, geplant, siehe [README](README.md#e2--glossar--geplant)) und nicht den Spezifikationsindex ([README.md](README.md)), sondern ergänzt beide um die Lesereihenfolge und die Begründung der Struktur.

---

## E1.2 Zielgruppen

| Zielgruppe | Interesse an der Spezifikation | Primärer Fokus |
|---|---|---|
| **Projektleitung** | Überblick über Fortschritt, Scope und Rahmenbedingungen; Grundlage für Priorisierung und Abstimmung mit dem Team. | [P1](P1-ziele-rahmenbedingungen.md), [P2](P2-architekturueberblick.md), [README](README.md) (Status) |
| **Fachliche Reviewer / Product Owner** | Prüfen, ob Geschäftsprozesse korrekt in Use Cases und Anwendungsfunktionen übersetzt wurden; Abgleich mit Zielen und Nicht-Zielen. | [F1](F1-geschaeftsprozesse.md), [F2](F2-anwendungsfaelle.md), [F3](F3-anwendungsfunktionen.md), [P1](P1-ziele-rahmenbedingungen.md) |
| **Entwickler** | Konkrete, programmierbare Vorgaben: Datenmodell, Datentypen, Dialoge, Schnittstellen, technische Umsetzung. | [D1](D1-datenmodell.md), [D2](D2-datentypen.md), [B1](B1-dialogspezifikation.md), [S1](S1-nachbarsysteme.md), [N2](N2-querschnittskonzepte.md) |
| **Tester** | Prüfbare Akzeptanzkriterien und Qualitätsanforderungen je Use Case; Grundlage für Testfälle. | [F2](F2-anwendungsfaelle.md) (Akzeptanzkriterien), [F3](F3-anwendungsfunktionen.md) (Entscheidungstabellen), [N1](N1-nichtfunktionale-anforderungen.md) |
| **Architekt** | Nachbarsysteme, Datenflüsse, Deployment-Topologie und technische Entscheidungen als Grundlage für `docs/arch/` nach arc42. | [P2](P2-architekturueberblick.md), [S1](S1-nachbarsysteme.md), [N2](N2-querschnittskonzepte.md), [N1](N1-nichtfunktionale-anforderungen.md) |
| **Professor / Prüfer** | Vollständigkeit und Konsistenz der Spezifikation nach Siedersleben-Schema; Nachvollziehbarkeit vom Geschäftsprozess bis zum Code. | [README](README.md) (Status aller Bausteine), E1 (dieser Baustein), [E1.7](#e17-querverweise-und-traceability) |

---

## E1.3 Empfohlene Lesereihenfolge

| Zielgruppe | Empfohlene Reihenfolge | Begründung |
|---|---|---|
| **Projektleitung** | [README](README.md) → [P1](P1-ziele-rahmenbedingungen.md) → [P2](P2-architekturueberblick.md) → [README](README.md) (Workflow/Status) | Ziele, Scope und Rahmenbedingungen zuerst; Architekturüberblick zeigt die technische Machbarkeit; der Index liefert danach den aktuellen Bearbeitungsstand aller Bausteine. |
| **Fachliche Reviewer / Product Owner** | [P1](P1-ziele-rahmenbedingungen.md) → [F1](F1-geschaeftsprozesse.md) → [F2](F2-anwendungsfaelle.md) → [F3](F3-anwendungsfunktionen.md) | Geschäftsziele und Scope rahmen die Geschäftsprozesse; F2 leitet daraus die Use Cases ab; F3 löst die darin offen gelassenen fachlichen Regeln auf. |
| **Entwickler** | [F2](F2-anwendungsfaelle.md) → [D1](D1-datenmodell.md) → [D2](D2-datentypen.md) → [B1](B1-dialogspezifikation.md) → [S1](S1-nachbarsysteme.md) → [N2](N2-querschnittskonzepte.md) | Use Cases geben den fachlichen Rahmen vor; Datenmodell und Datentypen sind die Grundlage jeder Implementierung; Dialoge und Schnittstellen konkretisieren UI und API; N2 löst die dort offen gelassenen technischen Fragen auf. |
| **Tester** | [F2](F2-anwendungsfaelle.md) (Akzeptanzkriterien) → [F3](F3-anwendungsfunktionen.md) (Entscheidungstabellen) → [N1](N1-nichtfunktionale-anforderungen.md) | Akzeptanzkriterien je Use Case sind die Grundlage funktionaler Tests; Entscheidungstabellen decken Randfälle ab; N1 liefert die nichtfunktionalen Prüfkriterien. |
| **Architekt** | [P2](P2-architekturueberblick.md) → [S1](S1-nachbarsysteme.md) → [D1](D1-datenmodell.md)/[D2](D2-datentypen.md) → [N2](N2-querschnittskonzepte.md) → [N1](N1-nichtfunktionale-anforderungen.md) | Systemkontext und Nachbarsysteme zuerst; danach Datenmodell als Schema-Grundlage; N2 bündelt die technische Umsetzung, die die Grundlage für die spätere, noch ausstehende Architekturdokumentation nach arc42 unter `docs/arch/` bildet. |
| **Professor / Prüfer** | [README](README.md) → E1 (dieser Baustein) → [P1](P1-ziele-rahmenbedingungen.md) → [F1](F1-geschaeftsprozesse.md) → [F2](F2-anwendungsfaelle.md) → [F3](F3-anwendungsfunktionen.md) → [D1](D1-datenmodell.md) → [D2](D2-datentypen.md) → [B1](B1-dialogspezifikation.md) → [S1](S1-nachbarsysteme.md) → [N1](N1-nichtfunktionale-anforderungen.md) → [N2](N2-querschnittskonzepte.md) | Vollständiger Durchlauf durch alle Bausteine in Siedersleben-Reihenfolge; E1 vorab erklärt Struktur und ID-Schema, damit die anschließende Prüfung auf Vollständigkeit und Konsistenz zielgerichtet erfolgen kann. |

---

## E1.4 Überblick der Bausteingruppen

Die Siedersleben-Bausteine sind in sieben Gruppen organisiert, die von der strategischen Ebene bis zur Umsetzung verfeinern:

| Gruppe | Leitfrage | Bausteine in LocalCourt | Status |
|---|---|---|---|
| **P — Projektgrundlagen** | Warum wird das System gebaut, für wen, und in welche Umgebung ist es eingebettet? | [P1](P1-ziele-rahmenbedingungen.md) Ziele und Rahmenbedingungen, [P2](P2-architekturueberblick.md) Architekturüberblick | Fertig |
| **F — Abläufe und Funktionen** | Welche realen Geschäftsprozesse gibt es, welche davon werden durch Use Cases systemunterstützt, und welche fachlichen Regeln stecken dahinter? | [F1](F1-geschaeftsprozesse.md) Geschäftsprozesse, [F2](F2-anwendungsfaelle.md) Anwendungsfälle, [F3](F3-anwendungsfunktionen.md) Anwendungsfunktionen | Fertig |
| **D — Daten** | Welche Entitäten und Datentypen gibt es fachlich, unabhängig von der technischen Umsetzung? | [D1](D1-datenmodell.md) Datenmodell, [D2](D2-datentypen.md) Datentypenverzeichnis | Fertig |
| **B — Benutzerschnittstelle** | Welche Dialoge zeigt das System, mit welchen Feldern und Zustandsübergängen? | [B1](B1-dialogspezifikation.md) Dialogspezifikation; B2 Batch und B3 Druckausgaben sind nicht anwendbar (siehe [E1.8](#e18-umgang-mit-offenen-und-nicht-anwendbaren-bausteinen)) | B1 fertig; B2/B3 nicht anwendbar |
| **S — Schnittstellen** | Mit welchen Nachbarsystemen kommuniziert LocalCourt, über welche Operationen, und mit welcher Fehlersemantik? | [S1](S1-nachbarsysteme.md) Nachbarsysteme; S2 Datenmigration ist nicht anwendbar, S3 Inbetriebnahme ist geplant (siehe [E1.8](#e18-umgang-mit-offenen-und-nicht-anwendbaren-bausteinen)) | S1 fertig; S2 nicht anwendbar; S3 geplant |
| **N — Übergreifende Anforderungen und Konzepte** | Welche Qualitätsanforderungen gelten übergreifend, und wie werden fachlich offen gelassene Punkte technisch umgesetzt? | [N1](N1-nichtfunktionale-anforderungen.md) Nichtfunktionale Anforderungen, [N2](N2-querschnittskonzepte.md) Querschnittskonzepte | Fertig |
| **E — Ergänzende Bausteine** | Wie liest man die Spezifikation, und welche Begriffe werden dabei einheitlich verwendet? | E1 Leseanleitung (dieser Baustein), E2 Glossar (geplant) | E1 in Bearbeitung; E2 geplant |

Der aktuelle Bearbeitungsstand jedes Bausteins ist im [Spezifikationsindex](README.md#bausteine-der-spezifikation) verbindlich gepflegt; E1 wiederholt ihn hier nur zur Einordnung der Gruppen und verweist für Details dorthin.

---

## E1.5 Namens- und ID-Konventionen

Zentrale spezifizierte Elemente wie Ziele, Geschäftsprozesse, Use Cases, Anwendungsfunktionen, Dialoge und Qualitätsanforderungen tragen stabile IDs. Diese IDs werden nicht wiederverwendet oder umnummeriert, auch wenn sich ihr Inhalt später ändert.

| Präfix | Bedeutung | Definiert in | Beispiel |
|---|---|---|---|
| `G-nn` | Geschäftsziel | [P1.2](P1-ziele-rahmenbedingungen.md#p12-geschäftsziele) | `G-03` Niedrige Einstiegshürde |
| `NG-nn` | Nicht-Ziel (Out of Scope) | [P1.4](P1-ziele-rahmenbedingungen.md#p14-scope) | `NG-10` Wartelisten bei vollen Sessions |
| `CON-T-nn`, `CON-O-nn`, `CON-D-nn` | Rahmenbedingung (technisch / organisatorisch / Datenschutz) | [P1.5](P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) | `CON-T-01` Datenbank: PostgreSQL nur |
| `SC-nn` | Erfolgskriterium | [P1.6](P1-ziele-rahmenbedingungen.md#p16-erfolgskriterien) | `SC-02` Session-Creation Workflow UX |
| `NB-nn` | Nachbarsystem | [P2.2](P2-architekturueberblick.md#p22-nachbarsysteme), detailliert in [S1](S1-nachbarsysteme.md) | `NB-03` Supabase PostgREST API |
| `GP-nn` | Geschäftsprozess (real, IT-unabhängig) | [F1](F1-geschaeftsprozesse.md) | `GP-02` Regelmäßige Treffen organisieren |
| `A1…An` | Aktivität innerhalb eines Geschäftsprozesses | [F1](F1-geschaeftsprozesse.md) (je GP-nn eigene Zählung) | `GP-02 A12` |
| `UC-nn` | Anwendungsfall (Use Case) | [F2.2](F2-anwendungsfaelle.md#f22-use-case-index) | `UC-04` Session beitreten |
| `AF-nn` | Anwendungsfunktion (fachliches Regelwerk) | [F3.2](F3-anwendungsfunktionen.md#f32-katalog-der-anwendungsfunktionen) | `AF-01` Beitritts- und Kapazitätsregel |
| Entitätsname in Backticks (z. B. `` `session` ``) | Entitätstyp im Datenmodell | [D1.3](D1-datenmodell.md#d13-entitätstypen-im-überblick) | `` `participant` `` |
| `B1`–`B7` | Beziehung zwischen Entitätstypen | [D1.5](D1-datenmodell.md#d15-beziehungen) | `B2` Teilnahme (`session` → `participant`) |
| Datentypname in Backticks (z. B. `` `SessionStatus` ``) | Fachlicher Datentyp | [D2](D2-datentypen.md#katalogübersicht) | `` `Pin` `` |
| `DLG-nn` | Dialog | [B1.2](B1-dialogspezifikation.md#dialog-index) | `DLG-06` Check-in |
| `N1-QA-nn` | Qualitätsziel (nichtfunktional) | [N1.2](N1-nichtfunktionale-anforderungen.md#n12-qualitätsziele-im-überblick) | `N1-QA-05` Sicherheit |
| `<Baustein>.<n>` (z. B. `N2.7`) | Abschnittsnummer innerhalb eines Bausteins, kein eigenständiges ID-Schema | jeder Baustein | `N2.7` PIN-Erzeugung und -Speicherung |

Beim Verweis auf einen Baustein wird immer die Baustein-Kurzform verwendet (`P1`, `F2`, `D2`, `B1`, `S1`, `N2` usw.), nicht der ausgeschriebene Titel; das hält Querverweise kurz und eindeutig grep-bar.

---

## E1.6 Diagramme und Notationen

Alle Diagramme in der Spezifikation sind als **Mermaid**-Codeblöcke eingebettet, damit sie auf GitHub direkt gerendert werden und im Diff versionierbar bleiben. Es gibt kein Diagramm als Bilddatei.

| Diagrammtyp | Mermaid-Notation | Verwendet in | Zweck |
|---|---|---|---|
| Aktivitätsdiagramm mit Swimlanes | `flowchart` mit `subgraph` je Akteur | [F1.1.5](F1-geschaeftsprozesse.md#f115-ablaufdiagramm-mermaid), [F1.2.5](F1-geschaeftsprozesse.md#f125-ablaufdiagramm-mermaid) | Ablauf eines Geschäftsprozesses je Akteur. |
| Use-Case-Diagramm | `flowchart` mit Akteur-Knoten und Ovalen (`((...))`) | [F2.3](F2-anwendungsfaelle.md#f23-use-case-diagramm) | Zuordnung Use Cases ↔ Akteure. |
| Systemkontext- / Deployment-Diagramm | `flowchart` mit `subgraph` je Tier/System | [P2.1](P2-architekturueberblick.md#p21-systemkontext), [P2.4](P2-architekturueberblick.md#p24-deployment--architektur-topologie) | Nachbarsysteme und Deployment-Topologie. |
| Sequenzdiagramm | `sequenceDiagram` | [P2.5](P2-architekturueberblick.md#p25-kritische-datenflüsse) | Ablauf kritischer Datenflüsse über mehrere Systeme hinweg. |
| ER-Diagramm | `erDiagram` | [D1.2](D1-datenmodell.md#d12-überblick-er-diagramm) | Entitätstypen und ihre Beziehungen. |
| Dialoglandkarte | `flowchart` mit `subgraph` je Navigationsbereich | [B1.2](B1-dialogspezifikation.md#b12-dialoglandkarte) | Navigation zwischen Dialogen (DLG-nn). |
| Entscheidungstabelle | Markdown-Tabelle statt Diagramm | [F3.3](F3-anwendungsfunktionen.md#entscheidungstabelle-af-01) ff. | Fallunterscheidung fachlicher Regeln, präziser als ein Diagramm. |
| Architekturdiagramme nach arc42 | noch nicht festgelegt | `docs/arch/` (im Aufbau) | Komponenten-, Deployment- und Laufzeitsichten, die laut [P2](P2-architekturueberblick.md#p2--architekturüberblick) bewusst nicht in P2 gehören; werden ergänzt, sobald `docs/arch/` vorliegt. |

---

## E1.7 Querverweise und Traceability

Die Spezifikation folgt einer durchgängigen Verfeinerungskette:

```
P1 (Ziele, Scope, Constraints)
  → F1 (Geschäftsprozesse)
    → F2 (Anwendungsfälle) → F3 (Anwendungsfunktionen)
      → D1 (Datenmodell) → D2 (Datentypen)
      → B1 (Dialoge)
      → S1 (Nachbarsystem-Schnittstellen)
      → N1 (nichtfunktionale Anforderungen) → N2 (technische Umsetzung)
        → Architektur (docs/arch/, arc42 — im Aufbau)
          → Code
            → Tests
```

Jeder Schritt in dieser Kette **verfeinert**, ohne den vorherigen Schritt zu widersprechen: F2 leitet Use Cases aus den Geschäftsprozessen in F1 ab; F3 löst die in F2 bewusst offen gelassenen fachlichen Regeln auf; D1/D2, B1, S1 und N1 konkretisieren F2/F3 aus Daten-, Dialog-, Schnittstellen- und Qualitätssicht; N2 setzt die dort offen gelassenen technischen Fragen auf dem konkreten Stack (P1 CON-T-01–CON-T-03, P2) um. Architektur, Code und Tests liegen außerhalb von `docs/spec/` und müssen dieselben IDs referenzieren; die Architekturdokumentation nach arc42 unter `docs/arch/` ist noch im Aufbau und wird nachgezogen, sobald sie vorliegt.

**Konkretes Beispiel der Kette für UC-04 „Session beitreten":**

| Ebene | Fundstelle | Inhalt |
|---|---|---|
| Geschäftsprozess | [F1.1](F1-geschaeftsprozesse.md#f11-geschäftsprozess-spontan-sportaktivitäten-finden-gp-01) GP-01, Aktivitäten A9–A13 | Realer Ablauf: Teilnehmer findet Session und tritt bei. |
| Anwendungsfall | [F2.4 UC-04](F2-anwendungsfaelle.md#uc-04--session-beitreten) | Systemunterstützte Interaktion mit Vorbedingungen und Akzeptanzkriterien. |
| Anwendungsfunktion | [F3.3 AF-01](F3-anwendungsfunktionen.md#f33-af-01--beitritts--und-kapazitätsregel) | Fachliche Kapazitätsregel, die UC-04 zugrunde liegt. |
| Datenmodell | [D1.4 `participant`](D1-datenmodell.md#participant--teilnahme) | Entität, die den Beitritt persistiert. |
| Schnittstelle | [S1.4 NB-03](S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest) | Atomare Operation `join_session`. |
| Technische Umsetzung | [N2.4](N2-querschnittskonzepte.md#n24-atomarität-des-beitritts-af-01) | Atomarität des Beitritts auf PostgreSQL-Ebene. |
| Architektur | `docs/arch/` (ausstehend) | Komponente/Sequenz, die `join_session` aufruft; wird dokumentiert, sobald `docs/arch/` vorliegt. |
| Code | Implementierung des Beitritts-Flows | — |
| Test | Testfall zu UC-04 (Kapazität voll/frei) | — |

Im Review muss diese Kette in beide Richtungen nachvollziehbar sein: von einem Use Case aus F2 bis in Architektur und Code, und umgekehrt von einer Code-Stelle zurück zum auslösenden Use Case. Fehlt ein Glied der Kette (z. B. eine Architekturkomponente ohne erkennbaren UC-Bezug), gilt das als Konsistenzlücke.

---

## E1.8 Umgang mit offenen und nicht anwendbaren Bausteinen

Nicht jeder Siedersleben-Baustein ist für LocalCourt fachlich relevant. Damit die Spezifikation trotzdem vollständig bleibt, gilt eine feste Regel: Ein nicht relevanter Baustein **fehlt nicht einfach**, sondern wird im [Spezifikationsindex](README.md#bausteine-der-spezifikation) als „❌ nicht anwendbar" geführt und kurz begründet.

In LocalCourt betrifft das aktuell:

| Baustein | Status | Kurzbegründung |
|---|---|---|
| **B2 — Batch** | ❌ Nicht anwendbar | Keine zeitgesteuerte Massenverarbeitung; Session-Status wird laut [N2.6](N2-querschnittskonzepte.md#n26-statuspersistenz-af-03) bei jeder Abfrage berechnet statt per Scheduler gepflegt (siehe [README](README.md#b2--batch--nicht-anwendbar)). |
| **B3 — Druckausgaben** | ❌ Nicht anwendbar | Der Check-in-QR-Code wird ausschließlich am Bildschirm angezeigt und gescannt, keine Druckausgabe vorgesehen (siehe [README](README.md#b3--druckausgaben--nicht-anwendbar)). |
| **S2 — Datenmigration** | ❌ Nicht anwendbar | Greenfield-Projekt ohne Altdaten (NG-09, siehe [README](README.md#s2--datenmigration--nicht-anwendbar)). |

Davon zu unterscheiden sind Bausteine, die **grundsätzlich relevant, aber noch nicht bearbeitet** sind:

| Baustein | Status | Einordnung |
|---|---|---|
| **S3 — Inbetriebnahme** | 🔄 Geplant | Installation, Betrieb und Deployment-Ablauf; noch ausstehend, aber fachlich relevant. |
| **E2 — Glossar** | 🔄 Geplant | Einheitliche Begriffe; noch ausstehend. |

Ein fehlender Eintrag im Index wäre also ein Fehler, keine bewusste Auslassung: Jeder Baustein trägt genau einen der drei Status mit Begründung.

---

## E1.9 Konsistenzregeln

Für die gesamte Spezifikation gelten unabhängig vom einzelnen Baustein folgende Regeln:

- **Relative Markdown-Links.** Querverweise verwenden relative Pfade innerhalb von `docs/spec/`, keine absoluten Repository-URLs.
- **Stabile IDs.** `G-nn`, `UC-nn`, `AF-nn`, `DLG-nn` & Co. werden nie umnummeriert oder wiederverwendet (siehe [E1.5](#e15-namens--und-id-konventionen)).
- **Identische Benennungen.** Datentypen, Entitäten und Use-Case-IDs heißen in D1/D2/F2, Architektur, Code und Tests jeweils gleich (siehe [E1.7](#e17-querverweise-und-traceability)).
- **Ein Ort für den Status.** Der Bearbeitungsstand jedes Bausteins steht ausschließlich im [Spezifikationsindex](README.md#bausteine-der-spezifikation); andere Bausteine verlinken ihn, statt ihn zu wiederholen oder abweichend darzustellen (siehe [E1.8](#e18-umgang-mit-offenen-und-nicht-anwendbaren-bausteinen)).
- **Keine neuen Fachentscheidungen in E1.** E1 erklärt die vorhandene Struktur; fachliche Änderungen gehören in den jeweils zuständigen Baustein (P1, F1–F3, D1–D2, B1, S1, N1–N2).
- **Ebenentrennung.** Jeder Baustein bleibt auf seiner Ebene: F2 beschreibt sichtbare Nutzerziele statt Implementierungsdetails, S1 Operationen und Semantik statt Endpunkt-URLs, N2 setzt fachliche Regeln technisch um, ohne neue zu erfinden.

---

## E1.10 Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | Claude Code |
| Verwendung | Entwurf und redaktionelle Überarbeitung des E1-Bausteins, insbesondere Zielgruppen, Lesereihenfolge, ID-Konventionen, Diagrammübersicht und Traceability-Kette. |
| Prüfung | Inhalte wurden gegen README, P1, P2, F1, F2, F3, D1, D2, B1, S1, N1 und N2 geprüft. Relative Links, Abschnittsanker, IDs und Statusangaben wurden mit den vorhandenen Dateien abgeglichen und manuell überarbeitet. |
| Fachliche Verantwortung | Bleibt beim Team. |
