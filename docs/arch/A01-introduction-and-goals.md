# 1 Einführung und Ziele

Dieses Kapitel fasst die Anforderungen und Qualitätsziele zusammen, die die Architektur rahmen. Die maßgebliche Spezifikation liegt unter [`../spec/`](../spec/) und wird hier referenziert, nicht wiederholt.

## 1.1 Aufgabenstellung / Anforderungsüberblick

LocalCourt verbindet Menschen aus der Region, um gemeinsam Sport zu treiben, und schafft dafür einen zentralen Ort für lokale Sportaktivitäten ([P1.1](../spec/P1-ziele-rahmenbedingungen.md#p11-mission)). Fachlicher Ausgangspunkt ist die dezentrale Koordination von Sportgelegenheiten, die heute ohne LocalCourt über Bekanntenkreis, Gruppenchats oder Zufall am Sportort abläuft. LocalCourt unterstützt genau einen Geschäftsprozess — Sportgelegenheit zustande bringen (GP-01, [F1](../spec/F1-geschaeftsprozesse.md#f11-geschäftsprozess-sportgelegenheit-zustande-bringen-gp-01)) — in den Schritten Bekanntmachen, Zusagen und Anwesenheit feststellen.

Daraus ergeben sich folgende fachlichen Fähigkeiten im Scope des MVP ([P1.4](../spec/P1-ziele-rahmenbedingungen.md#p14-scope)); die zugehörigen Anwendungsfälle stehen einzeln in [F2](../spec/F2-anwendungsfaelle.md#f23-use-case-index):

| Fähigkeit | Umfang | F2-Gruppe (UC) |
|---|---|---|
| Zugriff | Registrierung/Anmeldung als Voraussetzung für personenbezogene Aktionen | Zugriff (UC-01) |
| Session Discovery | Sessions nach Ort und optional Sportart suchen, Details ansehen | Session Discovery (UC-02, UC-03) |
| Teilnahme | Sessions beitreten, eigene Sessions einsehen | Teilnahme (UC-04, UC-05) |
| Organisation | Sessions erstellen, Court erfassen oder auswählen, Teilnehmerliste einsehen | Organisation (UC-06, UC-07, UC-10) |
| Check-in | Anwesenheit per QR-Code oder PIN feststellen | Check-in (UC-08, UC-09) |
| Historie | Vergangene Sessions read-only einsehen | Historie (UC-11) |
| Profil | Basisprofil und Sportpräferenzen verwalten | Profil (UC-12) |

Bewusst außerhalb dieses Scope bleiben insbesondere Bearbeiten, Absagen und Löschen bestehender Sessions sowie eine Warteliste bei voller Session ([P1.4](../spec/P1-ziele-rahmenbedingungen.md#p14-scope) NG-10, NG-11).

## 1.2 Qualitätsziele

N1 legt drei prüfbare Qualitätsziele fest ([N1.2](../spec/N1-nichtfunktionale-anforderungen.md#n12-qualitätsziele)); eine Rangfolge zwischen ihnen ist in der Spezifikation nicht festgelegt.

| ID | Qualitätsziel | Kurzbeschreibung | Quelle |
|---|---|---|---|
| N1-QA-01 | Konsistenz von Beitritt und Check-in | Die Kapazitätsgrenze (AF-01) und die Einmaligkeit eines Check-ins (AF-02) bleiben auch bei gleichzeitigen Zugriffen mehrerer Nutzer konsistent; ist ein Nachbarsystem nicht erreichbar, bleibt die Anwendung so weit bedienbar, wie sie ohne dieses System auskommt. | [N1-QA-01](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-01--konsistenz-von-beitritt-und-check-in) |
| N1-QA-02 | Mobile Nutzbarkeit | Die Dialoge DLG-01 bis DLG-08 sind auf einem Viewport von höchstens 768 px ohne horizontales Scrollen nutzbar; alle Muss-Aktionen sind mit dem Finger auslösbar. | [N1-QA-02](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-02--mobile-nutzbarkeit) |
| N1-QA-03 | Zugriffsschutz und Datensparsamkeit | Geschützte Aktionen — Beitritt, Session-Erstellung, Check-in, Profilverwaltung — stehen nur angemeldeten Nutzern offen; von fremden Profilen sind ausschließlich Anzeigename und optionales Profilbild sichtbar; Geheimnisse liegen weder im Frontend-Bundle noch im Repository. | [N1-QA-03](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-03--zugriffsschutz-und-datensparsamkeit) |

Die Begründung je Ziel — u. a. die harte Kapazitätsgrenze ohne Warteliste ([P1.4](../spec/P1-ziele-rahmenbedingungen.md#p14-scope) NG-10) und die responsive Web-UI ohne native Apps ([P1.5](../spec/P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) CON-T-04) — steht in N1.2. Weitere denkbare Qualitätsmerkmale sind in [N1.3](../spec/N1-nichtfunktionale-anforderungen.md#n13-bewusst-nicht-verfolgte-qualitätsziele) bewusst ausgeschlossen, nicht übersehen.

## 1.3 Stakeholder

[P1.3](../spec/P1-ziele-rahmenbedingungen.md#p13-stakeholder-und-nutzer) führt fachliche Rollen und tatsächliche Stakeholder in einer Tabelle. Nach [E2](../spec/E2-glossar.md#e23-alphabetisches-glossar) ist eine Rolle (Teilnehmer/Organisator) keine eigene Stakeholder-Entität, sondern ergibt sich aus der Aktion einer Person — Kapitel 1 unterscheidet daher beide Gruppen.

**Fachliche Rollen (Akteure)**

| Rolle | Beschreibung | Quelle |
|---|---|---|
| Teilnehmer | Sportinteressierte Person, die Sessions sucht, ihnen beitritt und vor Ort per QR-Code oder PIN einchecken kann. | [F1](../spec/F1-geschaeftsprozesse.md#f11-geschäftsprozess-sportgelegenheit-zustande-bringen-gp-01), [E2](../spec/E2-glossar.md#e23-alphabetisches-glossar) |
| Organisator | Rolle, die durch das Erstellen einer Session entsteht; zählt automatisch als Teilnehmer der eigenen Session und sieht zusätzlich Teilnehmerliste, PIN und QR-Code. | [F1](../spec/F1-geschaeftsprozesse.md#f11-geschäftsprozess-sportgelegenheit-zustande-bringen-gp-01), [E2](../spec/E2-glossar.md#e23-alphabetisches-glossar) |

**Weitere Stakeholder**

| Stakeholder | Beschreibung | Quelle |
|---|---|---|
| Operator (Team LocalCourt) | Vierköpfiges Entwicklungsteam der Hochschule (Spec Lead, Project Lead, QA, Frontend); entwickelt, deployt und betreibt LocalCourt, ohne Teil der fachlichen Primärnutzergruppen zu sein. | [P1.3](../spec/P1-ziele-rahmenbedingungen.md#p13-stakeholder-und-nutzer) |
| Trainings-/Vereinsgruppen | Strukturierte Sportgruppen (z. B. Hochschulsport, lokale Clubs), die LocalCourt für regelmäßige Sessions nutzen und Teilnehmerlisten verwalten. | [P1.3](../spec/P1-ziele-rahmenbedingungen.md#p13-stakeholder-und-nutzer) |
| Cloud-Provider (Free-Tier) | Stellt Hosting- und Datenbankinfrastruktur im kostenlosen Segment bereit und begrenzt damit maximale Nutzerzahl und API-Aufrufe. | [P1.3](../spec/P1-ziele-rahmenbedingungen.md#p13-stakeholder-und-nutzer) |
| External APIs | Externe Dienste, über die LocalCourt Daten bereitstellt bzw. austauscht; einzeln aufgeführt in [P2.2](../spec/P2-architekturueberblick.md#p22-nachbarsysteme). | [P1.3](../spec/P1-ziele-rahmenbedingungen.md#p13-stakeholder-und-nutzer) |
