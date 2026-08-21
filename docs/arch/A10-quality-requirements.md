# 10 Qualitätsanforderungen

Die drei Qualitätsziele von LocalCourt sind bereits in [A01 §1.2](A01-introduction-and-goals.md#12-qualitätsziele) benannt und in [N1.2](../spec/N1-nichtfunktionale-anforderungen.md#n12-qualitätsziele) mit Beschreibung, Begründung, Akzeptanzkriterien, Prüfmethode und Abgrenzung vollständig spezifiziert. Dieses Kapitel wiederholt N1 nicht, sondern macht die drei Ziele architektonisch nachvollziehbar: Abschnitt [10.1](#101-qualitätsbaum) ordnet sie in einem Qualitätsbaum, Abschnitt [10.2](#102-qualitätsszenarien) konkretisiert sie in wenigen prüfbaren Szenarien und verweist auf die jeweils tragenden Architekturmaßnahmen. Alle Szenarien beschreiben das Zielsystem; wo der aktuelle UI-Prototyp eine Anforderung noch nicht umsetzt, ist dies in [A08](A08-crosscutting-concepts.md) je Konzept ausgewiesen und wird hier nicht wiederholt.

## 10.1 Qualitätsbaum

```
Qualität
├── Konsistenz (N1-QA-01)
│   ├── QS-01 Konsistenz bei konkurrierendem Beitritt
│   └── QS-02 Einmaligkeit des Check-ins
├── Mobile Nutzbarkeit (N1-QA-02)
│   └── QS-03 Mobile Nutzbarkeit der Dialoge
└── Zugriffsschutz / Datensparsamkeit (N1-QA-03)
    └── QS-04 Zugriffsschutz und Datensparsamkeit
```

Die drei Äste entsprechen genau den in [N1.2](../spec/N1-nichtfunktionale-anforderungen.md#n12-qualitätsziele) definierten Zielen N1-QA-01 bis N1-QA-03; N1-QA-01 wird auf zwei Szenarien aufgeteilt, weil Kapazitätsprüfung ([F3 AF-01](../spec/F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel)) und Check-in-Einmaligkeit ([F3 AF-02](../spec/F3-anwendungsfunktionen.md#af-02--check-in-validierung)) unterschiedliche Algorithmen und Laufzeitszenarien betreffen. Die bewusst nicht verfolgten Qualitätsmerkmale aus [N1.3](../spec/N1-nichtfunktionale-anforderungen.md#n13-bewusst-nicht-verfolgte-qualitätsziele) tauchen im Baum entsprechend nicht auf.

## 10.2 Qualitätsszenarien

| ID | Qualitätsziel | Auslöser / Situation | Erwartete Reaktion | Prüfkriterium | Architekturbezug |
|---|---|---|---|---|---|
| QS-01 | [N1-QA-01](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-01--konsistenz-von-beitritt-und-check-in) — Kapazitätsgrenze bleibt bei gleichzeitigen Beitritten konsistent | Eine Session hat genau einen freien Platz; zwei Nutzer beitreten nahezu gleichzeitig. | Genau ein Beitritt wird bestätigt, der andere erhält `SESSION_FULL`; ein bereits beigetretener Nutzer erhält bei erneutem Versuch `ALREADY_JOINED` statt eines zweiten Eintrags. | Nach beiden Aufrufen enthält die Session höchstens `maxParticipants` bestätigte Teilnahmen und keinen Doppeleintrag für denselben Nutzer. | [F3 AF-01](../spec/F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel); [A04 §4.3](A04-solution-strategy.md#43-lösungsansätze-je-qualitätsziel); [A06 §6.1](A06-runtime-view.md#61-session-beitreten); [A08 §8.4](A08-crosscutting-concepts.md#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht); [A09](A09-architecture-decisions.md) ADR-001 (RPC `join_session`) |
| QS-02 | [N1-QA-01](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-01--konsistenz-von-beitritt-und-check-in) — Check-in bleibt bei Wiederholung eindeutig | Ein bereits eingecheckter Teilnehmer sendet den Check-in erneut (QR oder PIN). | Der bereits gesetzte Zeitstempel `checked_in_at` wird nicht überschrieben; die Antwort lautet `ALREADY_CHECKED_IN`. | `checked_in_at` bleibt nach dem Wiederholungsaufruf auf dem beim ersten Check-in gesetzten Wert (F3 AF-02 „Idempotenz"). | [F3 AF-02](../spec/F3-anwendungsfunktionen.md#af-02--check-in-validierung); [D1](../spec/D1-datenmodell.md#participant--teilnahme) `participant.checked_in_at`; [A06 §6.2](A06-runtime-view.md#62-check-in-per-qr-code-oder-pin); [A08 §8.4](A08-crosscutting-concepts.md#84-atomare-fachoperationen-und-datenzugriff-über-die-service-schicht), [§8.6](A08-crosscutting-concepts.md#86-zeit--und-statuskonzept); [A09](A09-architecture-decisions.md) ADR-001 (RPC `check_in`) |
| QS-03 | [N1-QA-02](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-02--mobile-nutzbarkeit) — Mobile Nutzbarkeit der Dialoge | Ein Nutzer öffnet einen der Dialoge DLG-01 bis DLG-08 auf einem Viewport von höchstens 768 px, u. a. über einen Check-in-Deep-Link aus einer Kamera-App. | Der gesamte Inhalt ist ohne horizontales Scrollen erreichbar, jede Muss-Aktion ist mit dem Finger auslösbar, und der Check-in-Ablauf ist ohne Zoomen durchführbar. | Geräteemulation über alle acht Dialoge zeigt keinen horizontalen Scrollbalken und erreichbare Muss-Aktionen. | [A04 §4.1](A04-solution-strategy.md#41-technologie), [§4.3](A04-solution-strategy.md#43-lösungsansätze-je-qualitätsziel); [A02](A02-architecture-constraints.md#21-technische-randbedingungen) TECH-04; [A05](A05-building-block-view.md#51-whitebox-localcourt--ebene-1) Dialogseiten / App-Shell & Navigation |
| QS-04 | [N1-QA-03](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-03--zugriffsschutz-und-datensparsamkeit) — Zugriffsschutz und Datensparsamkeit | Ein nicht angemeldeter Nutzer löst eine geschützte Aktion aus (Beitritt, Session-Erstellung, Check-in, Profilverwaltung); ein angemeldeter Nutzer öffnet die Teilnehmerliste bzw. den Teilnehmer-Zustand von DLG-04. | Der Nutzer wird zu DLG-01 geleitet, die Aktion wird nicht ausgeführt; die Teilnehmerliste zeigt ausschließlich Anzeigename und optionales Profilbild; PIN und QR-Code erscheinen nicht im Teilnehmer-Zustand. | Geschützte Route ohne Anmeldung liefert eine Weiterleitung statt Aktionsausführung; Felder der Teilnehmerliste entsprechen [D1.4](../spec/D1-datenmodell.md#d14-entitätstypen-im-detail); PIN im Teilnehmer-Zustand nicht sichtbar; keine Geheimnisse im Repository oder Frontend-Bundle. | [N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls); [A04 §4.3](A04-solution-strategy.md#43-lösungsansätze-je-qualitätsziel); [A05](A05-building-block-view.md#51-whitebox-localcourt--ebene-1) App-Shell & Navigation, [§5.4](A05-building-block-view.md#54-whitebox-service-schicht--ebene-2) Service-Schicht; [A08 §8.3](A08-crosscutting-concepts.md#83-authentifizierung-und-zugriffsschutz) |

## 10.3 Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | Claude Code |
| Verwendung | Analyse der spezifizierten Qualitätsanforderungen sowie der bestehenden Architektur und Entwurf von Qualitätsbaum und Qualitätsszenarien für Kapitel 10. |
| Prüfung | Qualitätsziele und Szenarien gegen N1, A01 und A04–A09 geprüft; keine zusätzlichen Qualitätsanforderungen oder Messwerte erfunden. |
