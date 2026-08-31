# LocalCourt — Dokumentation

Dieses Verzeichnis enthält die Projektdokumentation für **LocalCourt**, eine
Webanwendung zum Finden, Erstellen und Organisieren von Sport-Sessions auf
lokalen Courts (React 19, TypeScript, Vite, Tailwind CSS). Die Dokumentation
gliedert sich in zwei fachlich getrennte Ebenen sowie eine ergänzende
Statusdokumentation des Frontends:

| Verzeichnis/Datei | Ebene | Struktur | Zweck |
|---|---|---|---|
| [spec/](spec/README.md) | Spezifikation — *was* und *warum* | [Siedersleben-Schema](spec/E1-leseanleitung.md) | Technologieunabhängige Beschreibung von Zielen, Geschäftsprozessen, Anwendungsfällen, Datenmodell, Dialogen und nichtfunktionalen Anforderungen. |
| [arch/](arch/README.md) | Architektur — *wie* | arc42 + ADRs | Lösungsstrategie, Bausteinsicht, Laufzeitsichten, Deployment und Architekturentscheidungen zur Umsetzung der Spezifikation. |
| [frontend.md](frontend.md) | Umsetzungsstand | Screens, Komponenten, Abweichungen | Abgleich des Frontends (Routen, Komponenten, Servicezugriffe) mit den in `spec/B1` beschriebenen Dialogen. |
| [../supabase/](../supabase/README.md) | Umsetzung — Datenbank | Migrationen | Datenbankschema, RLS-Policies und atomare RPCs; setzt `spec/D1`, `spec/D2`, `spec/N2.2` und `arch/A09` ADR-001 um. |

Die Trennung zwischen Spezifikation und Architektur ist bewusst: `spec/`
beschreibt die fachlichen Anforderungen — Ziele, Prozesse, Anwendungsfälle,
Datenmodell und Dialoge — unabhängig von der technischen Umsetzung. Fachliche
Anforderungen, Dialogfelder und Ergebniscodes werden in `arch/` nicht erneut
definiert; dafür bleiben `spec/F2`, `spec/F3` und `spec/B1` maßgeblich (siehe
[arch/README.md, Abschnitt 1](arch/README.md#1-zweck-und-abgrenzung)). `arch/`
beschreibt umgekehrt, *wie* diese Anforderungen mit dem festgelegten
Technologie-Stack (React, Supabase, PostgreSQL, Leaflet/OpenStreetMap)
umgesetzt werden — als Lösungsstrategie, Bausteinsicht, Laufzeitsichten,
Deployment-Topologie und Architekturentscheidungen (ADRs).

## Nachvollziehbarkeit

Die Bausteine der Spezifikation verwenden durchgängig stabile IDs
(`GP-nn`, `UC-nn`, `AF-nn`, `DLG-nn`, `NB-nn` u. a.), die als Referenz über
alle Dokumente hinweg dienen. Die Architekturdokumentation greift diese IDs
auf und ordnet ihnen konkrete Bausteine, Code-Pfade (z. B. `src/pages/`,
`src/services/`) und Architekturentscheidungen zu; `frontend.md` gleicht den
tatsächlichen Implementierungsstand dagegen ab. Wie Anforderungen von P1/F1–F3
über D1–D2 bis zu Code und Test nachvollzogen werden können, beschreibt
[spec/E1 — Leseanleitung](spec/E1-leseanleitung.md).

## Bezug zum Modul

Dieses Projekt entsteht im Rahmen des Moduls **Wirtschaftsinformatik-Projekt I**
(B.Sc. Wirtschaftsinformatik) an der THM. Details zu Team und Rollen stehen in
[../TEAMINFO.md](../TEAMINFO.md), verbindliche Projektkonventionen (Commits,
Branches, Spezifikationsschema) in [../CLAUDE.md](../CLAUDE.md).

## Hinweis

LocalCourt befindet sich in aktiver Entwicklung. Spezifikation, Architektur
und Frontend-Dokumentation werden fortlaufend aktualisiert und an den
jeweils aktuellen Projektstand angepasst.

## Deklaration von Hilfsmitteln

Im Projekt LocalCourt werden KI-gestützte Werkzeuge unterstützend
eingesetzt. Diese Deklaration wird zentral für das gesamte Projekt geführt
und ersetzt die zuvor in einzelnen Spezifikations- und
Architekturdokumenten enthaltenen Abschnitte zu eingesetzten
KI-Werkzeugen.

Dokumentiert wird der jeweils tatsächlich erfolgte Einsatz in
Spezifikation, Architektur, Implementierung und weiterer
Projektdokumentation. Die fachliche Verantwortung und Freigabe aller
Inhalte bleibt beim Team. KI-generierte oder KI-überarbeitete Inhalte und
Vorschläge werden vor ihrer Übernahme geprüft und bei Bedarf angepasst.

| Werkzeug | Einsatzbereich | Verwendung |
|---|---|---|
| Claude Code | Spezifikation, Architektur | Analyse bestehender Spezifikation, Architektur und Code; Entwurf und Strukturierung von Spezifikationsbausteinen und arc42-Kapiteln; Unterstützung bei der Erstellung und Überarbeitung von Diagrammen in Spezifikation und Architektur; Konsistenz- und Querverweisprüfung. |
| ChatGPT | Spezifikation, Projektdokumentation | Formulierungsvorschläge und redaktionelle Überarbeitung einzelner Spezifikationsbausteine sowie Abgleich der Frontend-Statusdokumentation (`docs/frontend.md`) mit dem Code. |
| Codex | Spezifikation, Implementierung, Projektdokumentation | Ausarbeitung und redaktionelle Überarbeitung von Spezifikationsbausteinen; Unterstützung bei Frontend-Implementierung und -Prüfung; Nachführen der Frontend-Statusdokumentation nach Codeänderungen; Unterstützung bei der Strukturierung der Architektur-Übersicht (`docs/arch/README.md`). |
| GitHub Copilot | Spezifikation | Formulierungsunterstützung bei einzelnen frühen Spezifikationsbausteinen (P1, F1, P2, S1). |
