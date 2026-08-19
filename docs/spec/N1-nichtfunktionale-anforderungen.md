# N1 — Nichtfunktionale Anforderungen

## N1.1 Zweck und Auswahl

N1 beschreibt, *wie gut* LocalCourt seine Funktionen erbringt. Die Funktionen selbst stehen in [F2](F2-anwendungsfaelle.md) und [F3](F3-anwendungsfunktionen.md), die Dialoge in [B1](B1-dialogspezifikation.md), die technische Umsetzung in der [Architekturdokumentation](../arch/README.md).

LocalCourt verfolgt **drei** Qualitätsziele. Sie sind so gewählt, dass jedes im Review an einem konkreten Verhalten überprüfbar ist; ein Ziel, das sich nicht prüfen lässt, ist keines. Weitere denkbare Qualitätsmerkmale werden in [N1.3](#n13-bewusst-nicht-verfolgte-qualitätsziele) mit Begründung ausgeschlossen, statt sie unverbindlich mitzuführen.

**Stand:** N1 formuliert Anforderungen an das MVP, keine bereits erreichten Zusagen. Der Prototyp hat noch kein Backend; wie weit eine Anforderung heute umgesetzt ist, steht in [arch §8](../arch/README.md#8-aktueller-implementierungsstand).

## N1.2 Qualitätsziele

### N1-QA-01 — Konsistenz von Beitritt und Check-in

| Abschnitt | Inhalt |
|---|---|
| Beschreibung | Die Kapazitätsgrenze einer Session ([AF-01](F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel)) und die Einmaligkeit eines Check-ins ([AF-02](F3-anwendungsfunktionen.md#af-02--check-in-validierung)) bleiben auch bei gleichzeitigen Zugriffen mehrerer Nutzer konsistent. Ist ein Nachbarsystem nicht erreichbar, bleibt die Anwendung bedienbar, soweit sie ohne dieses System auskommt. |
| Begründung | Die harte Kapazitätsgrenze ohne Warteliste ist ein Kernversprechen aus [P1](P1-ziele-rahmenbedingungen.md). Eine Überbuchung fällt erst am Sportort auf und macht die Gelegenheit für die Betroffenen wertlos — der Schaden entsteht außerhalb des Systems und lässt sich dort nicht mehr korrigieren. |
| Akzeptanzkriterien | Given eine Session mit genau einem freien Platz, When zwei Nutzer nahezu gleichzeitig beitreten, Then wird genau einer bestätigt und der andere erhält `SESSION_FULL`. Given eine bereits eingecheckte Teilnahme, When der Check-in wiederholt wird, Then bleibt der Zeitpunkt unverändert und die Antwort lautet `ALREADY_CHECKED_IN`. Given einen nicht erreichbaren Kartendienst, When der Nutzer die Suche öffnet, Then bleibt die Listenansicht bedienbar. |
| Prüfmethode | Zwei parallele Beitritte auf den letzten freien Platz auslösen; den Check-in zweimal absenden; Karten- und Nominatim-Zugriff in den Browser-DevTools blockieren. |
| Abgrenzung | Keine Zusage zu Verfügbarkeit, Antwortzeiten oder Verhalten unter Last. |

### N1-QA-02 — Mobile Nutzbarkeit

| Abschnitt | Inhalt |
|---|---|
| Beschreibung | Die Dialoge DLG-01 bis DLG-08 sind auf einem Viewport von höchstens 768 px ohne horizontales Scrollen nutzbar; alle Muss-Aktionen sind mit dem Finger auslösbar. |
| Begründung | [P1](P1-ziele-rahmenbedingungen.md) legt eine responsive Web-UI statt nativer Apps fest (CON-T-04) und nennt mobile Nutzbarkeit als Erfolgskriterium (SC-05). Der Check-in geschieht nach [F1](F1-geschaeftsprozesse.md) in Aktivität A6 am Sportort, also praktisch immer am Telefon. |
| Akzeptanzkriterien | Given einen Viewport von höchstens 768 px, When ein Nutzer einen der acht Dialoge öffnet, Then ist der gesamte Inhalt ohne horizontales Scrollen erreichbar und jede Muss-Aktion bedienbar. Given einen Check-in-Deep-Link auf einem Telefon, When er aus einer Kamera-App geöffnet wird, Then ist der Ablauf ohne Zoomen durchführbar. |
| Prüfmethode | Geräteemulation in den Browser-DevTools über alle acht Dialoge, einschließlich des Check-in-Einstiegs per Deep-Link. |
| Abgrenzung | Keine Barrierefreiheitszertifizierung und keine zugesagte Geräte- oder Browsermatrix. |

### N1-QA-03 — Zugriffsschutz und Datensparsamkeit

| Abschnitt | Inhalt |
|---|---|
| Beschreibung | Geschützte Aktionen — Beitritt, Session-Erstellung, Check-in und Profilverwaltung — stehen nur angemeldeten Nutzern offen. Von fremden Profilen sind ausschließlich `display_name` und optional `avatar_url` sichtbar. PIN und QR-Code erscheinen nur im Organisator-Zustand von DLG-04. Geheime Schlüssel liegen weder im Frontend-Bundle noch im Repository. |
| Begründung | [UC-01](F2-anwendungsfaelle.md#uc-01--registrieren--anmelden) sowie die Anwendungsfunktionen AF-01 und AF-02 setzen eine Anmeldung voraus; [D1.4](D1-datenmodell.md#d14-entitätstypen-im-detail) begrenzt die für andere sichtbaren Profilfelder; [S1.1](S1-nachbarsysteme.md#s11-konventionen) schließt den Service-Role-Key im Frontend aus. |
| Akzeptanzkriterien | Given einen nicht angemeldeten Nutzer, When er eine geschützte Aktion auslöst, Then wird er zu DLG-01 geleitet und die Aktion wird nicht ausgeführt. Given eine Teilnehmerliste, When sie angezeigt wird, Then erscheinen ausschließlich Anzeigename und optionales Profilbild. Given den Teilnehmer-Zustand von DLG-04, When ein Nutzer die Session öffnet, Then ist die PIN nicht sichtbar. |
| Prüfmethode | Geschützte Routen ohne Anmeldung aufrufen; die Felder der Teilnehmerliste gegen D1.4 abgleichen; Repository und Git-Verlauf auf Schlüsselmuster und `.env`-Dateien durchsuchen. |
| Abgrenzung | Kein Bedrohungsmodell, kein Penetrationstest, kein Security-Audit. Die vierstellige PIN ist bewusst ein schwaches Geheimnis ([D2.4](D2-datentypen.md#d24-pin)); sie schützt keine personenbezogenen Daten, sondern nur die Anwesenheitsmarkierung. |

## N1.3 Bewusst nicht verfolgte Qualitätsziele

Die folgenden Merkmale werden **nicht** als Qualitätsziel geführt. Das grenzt den Umfang ab und ist keine Aussage über ihre allgemeine Bedeutung.

| Merkmal | Begründung |
|---|---|
| Antwortzeiten und Performance | Ohne reale Last ließe sich kein Grenzwert begründen; ein Ziel ohne Messgröße wäre nicht prüfbar. |
| Zeitziele für Suche und Erstellung | Bereits als Erfolgskriterien SC-02 und SC-03 in [P1](P1-ziele-rahmenbedingungen.md) festgelegt; N1 wiederholt sie nicht. |
| Betrieb im Free-Tier | Eine Randbedingung aus [P1](P1-ziele-rahmenbedingungen.md) (CON-T-02, CON-T-05), die den Lösungsraum von vornherein begrenzt — kein Qualitätsziel. |
| Verständliche Fehlertexte ohne technische Interna | Als verbindliche Texte je Dialog in [B1.5.4](B1-dialogspezifikation.md#b154-fehler--und-ladezustände) festgelegt. |
| Wartbarkeit als eigenes Ziel | Benennung und Modulstruktur folgen D1/D2; das ist eine Konvention und keine prüfbare Qualitätsschwelle. |
| Automatisierte Tests und Testabdeckung | Für das MVP ist weder ein Testframework noch eine Test-CI vorgegeben (P1 SC-07). Geprüft wird manuell anhand der Akzeptanzkriterien aus [F2](F2-anwendungsfaelle.md) und der Algorithmen aus [F3](F3-anwendungsfunktionen.md). |
| Verfügbarkeits-SLA, Monitoring und Alerting | Hochschulprojekt im Free-Tier; ohne dedizierte Infrastruktur nicht seriös zusagbar. Die Logs von Supabase und Vercel genügen. |
| Barrierefreiheitszertifizierung | In P1 weder als Ziel noch als Erfolgskriterium genannt. |
| Feldlängen für `title`, `display_name`, `description` | Es gibt keinen fachlichen Grenzwert, der sich begründen ließe; die Felder werden von Nutzern für Nutzer gefüllt. |
| Maximale Session-Dauer | Eine Obergrenze hätte keinen Schutzzweck: Eine unrealistische Dauer schadet niemandem außer dem Ersteller. |
| Zeittoleranz beim Check-in | Am Rand des `active`-Fensters gilt keine zusätzliche Toleranz; maßgeblich ist ausschließlich die Serverzeit ([AF-02](F3-anwendungsfunktionen.md#af-02--check-in-validierung)). |

## N1.4 Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | Claude Code, ChatGPT, Codex |
| Verwendung | Entwurf der Qualitätsziele samt Akzeptanzkriterien und Prüfmethoden; Zuschnitt auf drei prüfbare Kernziele nach Rückmeldung des Professors. |
| Prüfung | Abgeglichen mit P1, F1, F2, F3, D1, D2, B1 und S1; für jedes Ziel wurde geprüft, ob es sich an einem beobachtbaren Verhalten nachweisen lässt. |
