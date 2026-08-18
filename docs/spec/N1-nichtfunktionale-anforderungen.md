# N1 — Nichtfunktionale Anforderungen

## N1.1 Zweck und Einordnung

Dieser Baustein beschreibt die **Qualitätsanforderungen** von LocalCourt: Eigenschaften, *wie gut* das System seine Funktionen erbringt, nicht *welche* Funktionen es hat.

Zur Abgrenzung gegenüber den übrigen Bausteinen:

- **Funktionale Anforderungen** (fachliche Regelwerke wie Beitritts- oder Check-in-Logik) stehen in [F3](F3-anwendungsfunktionen.md).
- **Use Cases** (Nutzerziele und Systemreaktionen) stehen in [F2](F2-anwendungsfaelle.md).
- **Datenmodell und Datentypen** stehen in [D1](D1-datenmodell.md) und [D2](D2-datentypen.md).
- **Dialoge** (Statik/Dynamik der Benutzerschnittstelle) stehen in [B1](B1-dialogspezifikation.md).
- **Nachbarsysteme** (Schnittstellen zu Supabase, OpenStreetMap) stehen in [S1](S1-nachbarsysteme.md).

N1 nimmt die in F2, F3, D1/D2 und B1 bereits als „Bezug zu NFR / Qualität" oder als offener Punkt markierten Stellen auf und bündelt sie zu prüfbaren Qualitätsanforderungen. N1 erfindet keine neuen Funktionen, sondern bewertet die bestehenden.

N1 dient später als Grundlage für:

- Architekturentscheidungen (welche Qualitätsanforderung verlangt welche technische Lösung),
- Tests (woran wird geprüft, dass eine Anforderung erfüllt ist),
- den Code-Walkthrough im Review (welcher Use Case erfüllt welche Qualitätsanforderung und wie wird das sichtbar).

Die technische Umsetzung der hier formulierten Anforderungen (konkrete Konfiguration, Bibliotheken, Grenzwerte auf Code-Ebene) ist Sache von N2 und der Architekturbausteine; N1 legt fest, *was* gelten soll und *wie es geprüft wird*.

## N1.2 Qualitätsziele im Überblick

| ID | Qualitätsmerkmal | Kurzbeschreibung | Betroffene Use Cases (F2) | Betroffene Bausteine | Priorität | Prüfbarkeit |
|---|---|---|---|---|---|---|
| N1-QA-01 | Performance | Kernabläufe (Suche, Beitritt, Check-in) reagieren unter normalen Entwicklungs-/Testbedingungen in einer für Nutzer akzeptablen Zeit. | UC-02, UC-03, UC-04, UC-06, UC-07, UC-08, UC-09 | P1 (SC-02, SC-03), F3 (AF-01, AF-02), S1 (NB-03, NB-04) | Soll | manuelle Messung im Review, keine Lasttest-Pflicht |
| N1-QA-02 | Mobile Nutzbarkeit / Responsive Design | Zentrale MVP-Dialoge sind auf mobilen Geräten ohne horizontales Scrollen und mit bedienbaren Elementen nutzbar. | UC-02, UC-03, UC-04, UC-06, UC-07, UC-08, UC-09, UC-12 | P1 (CON-T-04, SC-05), B1 (alle Dialoge) | Muss | Browser-DevTools-Test auf Mobil-Viewport |
| N1-QA-03 | Bedienbarkeit / Usability | Kernworkflows (Session finden, erstellen, beitreten) sind mit niedriger Einstiegshürde und ohne Vorwissen bedienbar. | UC-02, UC-04, UC-06 | P1 (G-03, SC-02, SC-03), B1 (DLG-02, DLG-04, DLG-05) | Muss | manuelle Durchführung des Workflows im Browser |
| N1-QA-04 | Datenschutz / DSGVO | Personenbezogene Daten werden nur angezeigt oder gespeichert, wenn sie für den jeweiligen Use Case erforderlich sind. | UC-01, UC-03, UC-07, UC-12 | P1 (CON-D-01), D1 (`profile`), B1 (DLG-04, DLG-08) | Muss | Review der angezeigten/gespeicherten Felder gegen D1 |
| N1-QA-05 | Sicherheit | Geschützte Aktionen erfordern Anmeldung; Check-in-Geheimnisse sind angemessen, aber nicht überdimensioniert abgesichert; keine Secrets im Repository. | UC-01, UC-04, UC-08, UC-09 | F3 (AF-01, AF-02, AF-04), S1 (NB-02, NB-03) | Muss | Code-Review, Repository-Scan, manuelle Prüfung der Zugriffsregeln |
| N1-QA-06 | Zuverlässigkeit / Fehlerrobustheit | Kapazitäts- und Check-in-Regeln bleiben auch bei parallelen Zugriffen konsistent; nicht verfügbare Nachbarsysteme führen zu kontrollierter Degradation statt Absturz. | UC-02, UC-04, UC-08, UC-09 | F3 (AF-01, AF-02), P2 (Fehlerbehandlung), S1 (NB-04) | Muss | Code-Walkthrough der Atomarität, manueller Test der Kartendarstellung ohne Kartendienst |
| N1-QA-07 | Wartbarkeit | Modulstruktur, Benennung und Datenobjekte folgen den in D1/D2/P2 festgelegten Namen und Zuständigkeiten. | alle | P2 (Architekturüberblick), D1, D2 | Soll | Code-Review gegen D1/D2-Benennung |
| N1-QA-08 | Testbarkeit | Use Cases und Anwendungsfunktionen besitzen prüfbare Akzeptanzkriterien, die manuell oder automatisiert nachvollzogen werden können. | alle MVP-Use-Cases | F2 (Akzeptanzkriterien), F3 (Entscheidungstabellen) | Soll | Abgleich Akzeptanzkriterien ↔ beobachtbares Verhalten |
| N1-QA-09 | Nachvollziehbarkeit / Logging ohne sensible Daten | Fehlermeldungen und Logs sind für Nutzer verständlich und enthalten keine technischen Interna oder personenbezogenen Daten. | UC-01, UC-04, UC-06, UC-08, UC-09 | F2 (Ausnahmefälle), B1 (B1.5.4) | Muss | manuelle Prüfung der Fehlertexte im Browser |
| N1-QA-10 | Betrieb im Free-/Student-Tier | Das System läuft innerhalb der Grenzen der genutzten Free-Tier-Dienste, ohne kostenpflichtige Zusatzdienste vorauszusetzen. | UC-02, UC-06 (mittelbar alle) | P1 (CON-T-02, CON-T-05, G-05), Architekturdokumentation (Deployment-Topologie, §6) | Muss | Review der Deployment-Konfiguration und genutzten Dienste |

## N1.3 Detaillierte Qualitätsanforderungen

### N1-QA-01 — Performance

| Abschnitt | Inhalt |
|---|---|
| ID | N1-QA-01 |
| Name | Performance |
| Beschreibung | Die Session-Suche (UC-02), das Laden der Detailansicht (UC-03), der Beitritt (UC-04) und der Check-in (UC-08, UC-09) sollen unter normalen Entwicklungs- und Testbedingungen innerhalb einer für Nutzer akzeptablen Zeit reagieren, sodass die Bedienung nicht als träge empfunden wird. |
| Begründung | P1 nennt für Suche und Erstellung explizite UX-Zeitziele (SC-02: Erstellung < 2 Minuten, SC-03: 3+ passende Sessions < 3 Minuten finden). Diese Ziele setzen voraus, dass die einzelnen technischen Schritte (Suche, Laden, Speichern) nicht spürbar verzögern. |
| Betroffene Use Cases | UC-02, UC-03, UC-04, UC-06, UC-07, UC-08, UC-09 |
| Betroffene Datenobjekte / Datentypen | `session`, `participant`, `court` (D1); keine speziellen Datentypen aus D2 betroffen. |
| Betroffene Dialoge | DLG-02, DLG-03, DLG-04, DLG-05, DLG-06 |
| Akzeptanzkriterien | Given eine übliche Entwicklungs-/Testumgebung, When ein Nutzer eine Suche, einen Beitritt oder einen Check-in auslöst, Then erscheint eine sichtbare Reaktion (Ergebnis, Ladeanzeige oder Bestätigung) ohne wahrnehmbare Hänger. Given eine laufende Anfrage, When sie länger dauert, Then zeigt der Dialog eine Ladeanzeige (B1.5.4) statt eines eingefrorenen Zustands. |
| Prüfmethode | Manuelle Durchführung der Kernworkflows im Browser während Review/Code-Walkthrough; kein automatisierter Lasttest im MVP vorgesehen. |
| Offene Punkte | Konkrete Zahlenwerte (z. B. Millisekunden-Grenzwerte) sind mangels Produktionslast nicht seriös festlegbar und bleiben als Zielgröße offen; siehe [N1.7](#n17-bewusst-nicht-festgelegte-qualitätsanforderungen). |

### N1-QA-02 — Mobile Nutzbarkeit / Responsive Design

| Abschnitt | Inhalt |
|---|---|
| ID | N1-QA-02 |
| Name | Mobile Nutzbarkeit / Responsive Design |
| Beschreibung | Auf mobilen Geräten müssen die zentralen MVP-Dialoge (Suche, Karte, Detail, Erstellung, Check-in, Meine Sessions, Profil, Anmeldung) ohne horizontales Scrollen nutzbar sein; Bedienelemente müssen mit dem Finger auslösbar sein. |
| Begründung | P1 legt responsive Web-UI als Constraint fest (CON-T-04) statt nativer Apps und definiert Mobile Usability als Erfolgskriterium (SC-05: Viewport ≤ 768px, Kernworkflows ungebrochen nutzbar). Der Check-in per QR-Code (UC-08) findet nach F1 typischerweise am Smartphone statt. |
| Betroffene Use Cases | UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-11, UC-12 |
| Betroffene Datenobjekte / Datentypen | keine spezifischen Entitäten; betrifft die Darstellung aller in B1 gelisteten Felder. |
| Betroffene Dialoge | DLG-01 bis DLG-08 (alle) |
| Akzeptanzkriterien | Given ein Viewport ≤ 768px, When ein Nutzer einen der acht Dialoge öffnet, Then ist der Inhalt ohne horizontales Scrollen erreichbar und alle Muss-Aktionen sind bedienbar. Given der Check-in-Dialog (DLG-06), When er über einen QR-Deep-Link auf einem Smartphone geöffnet wird, Then ist der Ablauf ohne Zoomen bedienbar. |
| Prüfmethode | Test mit Browser-DevTools (Geräteemulation, gängige Mobil-Breiten) je zentralem Dialog; visuelle Prüfung auf Umbruch/Überlauf. |
| Offene Punkte | Konkrete unterstützte Mindestbreite und Geräteliste sind nicht abschließend festgelegt; SC-05 nennt 768px als Referenzpunkt. |

### N1-QA-03 — Bedienbarkeit / Usability

| Abschnitt | Inhalt |
|---|---|
| ID | N1-QA-03 |
| Name | Bedienbarkeit / Usability |
| Beschreibung | Die Kernworkflows Session finden (UC-02), Session erstellen (UC-06) und Session beitreten (UC-04) müssen ohne Einarbeitung und mit minimaler Anzahl Schritte durchführbar sein. |
| Begründung | P1 nennt eine niedrige Einstiegshürde als Geschäftsziel (G-03) und konkretisiert dies mit Erfolgskriterien (SC-02: Erstellung < 2 Minuten, SC-03: passende Sessions < 3 Minuten finden). Eine hohe Bedienhürde würde dem Kernversprechen von LocalCourt widersprechen. |
| Betroffene Use Cases | UC-02, UC-04, UC-06 |
| Betroffene Datenobjekte / Datentypen | `session`, `court`, `sport` (D1); Pflichtfeld-Vorbelegungen aus D2 (z. B. `duration_min` Vorbelegung 60, siehe B1 DLG-05). |
| Betroffene Dialoge | DLG-02, DLG-04, DLG-05 |
| Akzeptanzkriterien | Given ein angemeldeter Organisator mit allen nötigen Angaben, When er DLG-05 vollständig ausfüllt, Then ist die Session in unter zwei Minuten Bearbeitungszeit erstellbar (P1 SC-02). Given ein Teilnehmer mit einer Region, When er sucht, Then findet er passende Sessions ohne zusätzliche Erklärung der Bedienoberfläche (P1 SC-03). |
| Prüfmethode | Manuelle Durchführung der drei Workflows im Browser, Zeitmessung durch das Team im Review. |
| Abgrenzung | Formale Usability-Tests mit externen Testpersonen sind nicht vorgesehen (siehe [N1.7](#n17-bewusst-nicht-festgelegte-qualitätsanforderungen)). |

### N1-QA-04 — Datenschutz / DSGVO

| Abschnitt | Inhalt |
|---|---|
| ID | N1-QA-04 |
| Name | Datenschutz / DSGVO |
| Beschreibung | Personenbezogene Daten dürfen nur angezeigt werden, wenn sie für den jeweiligen Use Case erforderlich sind. Profildaten bleiben auf die in D1 definierten Basisangaben begrenzt. |
| Begründung | P1 legt DSGVO-Compliance als Constraint fest (CON-D-01). D1 begrenzt `profile` bewusst auf MVP-relevante Felder (`display_name`, `city`, `avatar_url`) und gibt für andere Nutzer ausschließlich `display_name` und optional `avatar_url` frei. |
| Begründung (Fortsetzung) | UC-03 und UC-07 fordern ausdrücklich, dass keine nicht benötigten privaten Profildaten anderer Nutzer angezeigt werden. |
| Betroffene Use Cases | UC-01, UC-03, UC-07, UC-12 |
| Betroffene Datenobjekte / Datentypen | `profile` (D1: `display_name`, `city`, `avatar_url`); E-Mail/Passwort liegen bewusst außerhalb des Datenmodells beim Nachbarsystem Supabase Auth (D1.4, S1 NB-02). |
| Betroffene Dialoge | DLG-04 (Teilnehmerliste), DLG-07 (Rollenanzeige), DLG-08 (Profil) |
| Akzeptanzkriterien | Given eine Teilnehmerliste (DLG-04), When sie angezeigt wird, Then erscheinen als Profildaten ausschließlich `display_name` und optional `avatar_url` und keine Auth-internen Daten (Passwort, Token). Given ein Nutzer betrachtet oder bearbeitet sein eigenes Profil (DLG-08), Then bleiben die dort vorgesehenen eigenen Profilfelder verfügbar. Given eine bestätigte Löschanfrage, When ein Administrator das Auth-Konto entfernt, Then werden Profil, Präferenzen, Teilnahmen und organisierte Sessions gemäß N2.15 gelöscht. |
| Prüfmethode | Review der in der Teilnehmerliste angezeigten Felder gegen D1/B1; Prüfung, dass `city` und Auth-Rohdaten weder dort noch in dafür bestimmten Antworten sichtbar sind. |
| Festlegung | Auskunfts- und Löschanfragen werden im MVP über die in der Datenschutzerklärung genannte Kontaktadresse nach Identitätsprüfung administrativ bearbeitet; Datenumfang und Löschwirkung sind in [N2.15](N2-querschnittskonzepte.md#n215-dsgvo-auskunft-und-löschung) festgelegt. |

### N1-QA-05 — Sicherheit

| Abschnitt | Inhalt |
|---|---|
| ID | N1-QA-05 |
| Name | Sicherheit |
| Beschreibung | Geschützte Aktionen (Beitritt, Erstellung, Check-in, Profilverwaltung) dürfen nur angemeldeten und berechtigten Nutzern zur Verfügung stehen. Die vierstellige Check-in-PIN ist ein bewusst schwaches, aber für den Zweck ausreichendes Geheimnis. Das Repository darf keine API-Keys, Tokens oder Passwörter enthalten. |
| Begründung | F2 (UC-01, UC-04, UC-08, UC-09) und F3 (AF-01, AF-02) setzen Anmeldung und Berechtigung als Vorbedingung. F3/D2 begründen das PIN-Sicherheitsniveau ausdrücklich damit, dass Check-in zusätzlich Anmeldung und vorherigen Beitritt voraussetzt und die Auswirkung eines Fehlversuchs gering ist (reine Anwesenheitsmarkierung, kein Zahlungs- oder Zugangsschutz). P2 nennt Row-Level-Security als Zugriffsmechanismus des Nachbarsystems. |
| Betroffene Use Cases | UC-01, UC-04, UC-08, UC-09 |
| Betroffene Datenobjekte / Datentypen | `Pin` (D2.4), `Identifier` (D2.2), `participant.status` (D1) |
| Betroffene Dialoge | DLG-01, DLG-04 (QR/PIN-Anzeige, nur Organisator-Zustand), DLG-06 |
| Akzeptanzkriterien | Given ein nicht angemeldeter Nutzer, When er eine geschützte Aktion auslöst, Then wird er zu DLG-01 geleitet und die Aktion wird nicht ausgeführt (B1.5.2). Given eine falsche PIN oder ein QR-Code einer anderen Session, When ein Check-in versucht wird, Then bleibt der Teilnahmestatus unverändert (`INVALID_CREDENTIAL`, AF-02). Given das Repository, When es durchsucht wird, Then enthält es keine echten API-Keys, Tokens oder Passwörter. |
| Prüfmethode | Code-Review der Zugriffsprüfungen gegen F3 AF-01/AF-02; Repository-Scan auf Secrets (z. B. Suche nach typischen Schlüsselmustern, `.env`-Dateien im Git-Verlauf); manuelle Prüfung, dass QR/PIN nur im Organisator-Zustand von DLG-04 sichtbar sind. |
| Festlegung / Abgrenzung | Die PIN wird im Klartext gespeichert ([N2.7](N2-querschnittskonzepte.md#n27-pin-erzeugung-und--speicherung-af-04)). Eine vollständige Security-Audit-Abdeckung ist nicht vorgesehen (siehe [N1.7](#n17-bewusst-nicht-festgelegte-qualitätsanforderungen)). |

### N1-QA-06 — Zuverlässigkeit / Fehlerrobustheit

| Abschnitt | Inhalt |
|---|---|
| ID | N1-QA-06 |
| Name | Zuverlässigkeit / Fehlerrobustheit |
| Beschreibung | Die Kapazitätsgrenze eines Beitritts (AF-01) und die Eindeutigkeit eines Check-ins (AF-02) müssen auch bei gleichzeitigen Zugriffen mehrerer Nutzer konsistent bleiben. Ist ein Nachbarsystem nicht erreichbar, degradiert die Anwendung kontrolliert, statt abzustürzen oder unvollständige Daten zu speichern. |
| Begründung | F3 AF-01 fordert Atomarität von Kapazitätsprüfung und Eintragserzeugung als fachliche Invariante (keine Überbuchung). P2 beschreibt für die Kartendarstellung einen Fallback zur Listenansicht. UC-10 verlangt zusätzlich, dass bei Ausfall von Karte oder Reverse-Geocoding kein unvollständiger Court gespeichert wird. |
| Betroffene Use Cases | UC-02, UC-04, UC-08, UC-09, UC-10 |
| Betroffene Datenobjekte / Datentypen | `session` (`max_participants`, abgeleitet `confirmed_count`), `participant` (`status`), `GeoCoordinate` (D2.7) |
| Betroffene Dialoge | DLG-02, DLG-03 (Fehlerfall Karte), DLG-04, DLG-05 (Court-Erfassung), DLG-06 |
| Akzeptanzkriterien | Given eine Session mit einem letzten freien Platz, When zwei Nutzer nahezu gleichzeitig beitreten, Then wird höchstens einer bestätigt und der andere erhält `SESSION_FULL` (AF-01 – Kapazitätsinvariante und Atomarität). Given ein nicht erreichbarer Kartendienst, When DLG-03 geöffnet wird, Then erscheint ein Hinweis mit Verweis auf DLG-02 statt eines Fehlerabbruchs. Given Karte oder Reverse-Geocoding sind bei der Court-Erfassung nicht verfügbar, When der Nutzer speichern möchte, Then wird kein Court angelegt und eine Wiederholmöglichkeit angezeigt. Given ein wiederholter gültiger Check-in-Versuch, When er erneut ausgeführt wird, Then bleibt der ursprüngliche Check-in-Zeitpunkt erhalten (`ALREADY_CHECKED_IN`, [AF-02 – Idempotenz bei wiederholtem Check-in](F3-anwendungsfunktionen.md#af-02--check-in-validierung)). |
| Prüfmethode | Code-Walkthrough der Atomaritäts-Umsetzung gegen die AF-01-Entscheidungstabelle; manuelle Tests mit deaktiviertem Karten- beziehungsweise Nominatim-Zugriff in den Browser-DevTools. |
| Festlegung | Die technische Umsetzung der Atomarität ist in [N2.4](N2-querschnittskonzepte.md#n24-atomarität-des-beitritts-af-01) als unteilbare serverseitige Operation entschieden. |

### N1-QA-07 — Wartbarkeit

| Abschnitt | Inhalt |
|---|---|
| ID | N1-QA-07 |
| Name | Wartbarkeit |
| Beschreibung | Modulstruktur und Benennung im Code sollen die in P2 beschriebene Architektur sowie die in D1/D2 festgelegten Entitäts-, Attribut- und Typnamen widerspiegeln, damit Spezifikation und Code durchgängig aufeinander abbildbar bleiben. |
| Begründung | Der wichtigste Bewertungsaspekt des Projekts ist, dass Use Cases, Architektur und Code aufeinander aufbauen (siehe Projektvorgabe). D1 legt englische `snake_case`-Namen für Entitäten/Attribute bewusst konsistent zu den in F3 genutzten Feldbezeichnungen und den P2-Datenflüssen fest. |
| Betroffene Use Cases | alle (mittelbar, über Code-Struktur) |
| Betroffene Datenobjekte / Datentypen | alle Entitäten aus D1 und Typen aus D2 |
| Betroffene Dialoge | keine dialogspezifische Wirkung; betrifft die Code-Ebene hinter B1 |
| Akzeptanzkriterien | Given ein Datenobjekt aus D1 (z. B. `session`, `participant`), When es im Code referenziert wird, Then trägt es denselben Namen wie in D1/D2. Given eine Architekturkomponente aus P2, When sie im Code gesucht wird, Then ist sie anhand vergleichbarer Modul-/Ordnernamen auffindbar. |
| Prüfmethode | Code-Review: Stichprobenartiger Abgleich von Entitäts-/Feldnamen im Code gegen D1/D2; Abgleich von Modulnamen gegen P2. |
| Architekturbezug | Die konkrete Zuordnung zu App-Shell, Seiten, Komponenten, Services, Typen und Daten steht in der [Bausteinsicht](../arch/README.md#41-frontend). |

### N1-QA-08 — Testbarkeit

| Abschnitt | Inhalt |
|---|---|
| ID | N1-QA-08 |
| Name | Testbarkeit |
| Beschreibung | Jeder MVP-Use-Case und jede Anwendungsfunktion besitzt in F2/F3 bereits formulierte Akzeptanzkriterien bzw. Entscheidungstabellen, die im Review nachvollzogen werden können — manuell oder, soweit vorgesehen, automatisiert. |
| Begründung | F2 formuliert je Use Case Given/When/Then-Akzeptanzkriterien; F3 legt für AF-01 bis AF-04 vollständige Entscheidungstabellen fest. Diese Struktur existiert bereits und soll durch N1 nicht verdoppelt, sondern als Prüfgrundlage referenziert werden. |
| Betroffene Use Cases | alle MVP-Use-Cases (UC-01 bis UC-12) |
| Betroffene Datenobjekte / Datentypen | alle, über die jeweiligen Akzeptanzkriterien |
| Betroffene Dialoge | keine dialogspezifische Wirkung |
| Akzeptanzkriterien | Given ein Use Case aus F2, When sein Hauptszenario im Browser durchgeführt wird, Then entspricht das beobachtete Verhalten den dort formulierten Akzeptanzkriterien. Given eine Anwendungsfunktion aus F3, When ihre Entscheidungstabelle durchgespielt wird, Then stimmt das Systemverhalten mit jeder Tabellenzeile überein. |
| Prüfmethode | Manueller Abgleich Akzeptanzkriterium ↔ Verhalten im Review; ergänzend einfache automatisierte Tests, soweit vom Team eingeführt. |
| Abgrenzung | Für das MVP sind weder ein Testframework noch eine Test-CI vorgegeben (P1 SC-07, N2.11). Die spezifizierte Prüfung erfolgt deshalb manuell; automatisierte Tests sind eine optionale Ergänzung und keine offene Spezifikationsentscheidung. |

### N1-QA-09 — Nachvollziehbarkeit / Logging ohne sensible Daten

| Abschnitt | Inhalt |
|---|---|
| ID | N1-QA-09 |
| Name | Nachvollziehbarkeit / Logging ohne sensible Daten |
| Beschreibung | Fehlermeldungen dürfen keine technischen Details wie Stacktraces, interne IDs oder Datenbankfehler offenlegen. Status- und Fehlermeldungen müssen für Teilnehmer und Organisatoren verständlich formuliert sein. |
| Begründung | B1.5.4 legt fest, dass Netzwerk-/Serverfehler als nicht-blockierende, verständliche Meldung erscheinen. F3 definiert für AF-01/AF-02 sprechende Ergebniscodes (z. B. `SESSION_FULL`, `INVALID_CREDENTIAL`), die in B1 (DLG-04, DLG-06) bereits in verständliche Anzeigetexte übersetzt sind. Diese Übersetzung soll konsequent für alle Fehlerfälle gelten. |
| Betroffene Use Cases | UC-01, UC-04, UC-06, UC-08, UC-09 |
| Betroffene Datenobjekte / Datentypen | Ergebniscodes aus F3 (AF-01, AF-02); keine D1-Entität direkt betroffen. |
| Betroffene Dialoge | DLG-01, DLG-04, DLG-05, DLG-06 |
| Akzeptanzkriterien | Given ein fachlicher oder technischer Fehler, When er dem Nutzer angezeigt wird, Then enthält der Text keine Stacktraces, SQL-Fehlermeldungen oder interne Kennungen. Given einen Ergebniscode aus AF-01/AF-02 (z. B. `SESSION_FULL`, `OUTSIDE_WINDOW`), When er auftritt, Then zeigt der Dialog den in B1 (DLG-04, DLG-06) hinterlegten verständlichen Text. |
| Prüfmethode | Manuelle Prüfung der Fehlertexte je Ausnahmefall aus F2 im Browser; Stichprobe der Konsolen-/Serverlogs auf personenbezogene Daten. |
| Festlegung | Die verbindlichen Texte für AF-01 und AF-02 sowie der technische Rückfalltext stehen in B1 DLG-04/DLG-06. |

### N1-QA-10 — Betrieb im Free-/Student-Tier

| Abschnitt | Inhalt |
|---|---|
| ID | N1-QA-10 |
| Name | Betrieb im Free-/Student-Tier |
| Beschreibung | Das System muss innerhalb der Grenzen der kostenlosen Pläne von Vercel und Supabase betreibbar sein (Verbindungs-, Speicher- und Anfragegrenzen gemäß [Architekturdokumentation §6](../arch/README.md#6-verteilung-und-deployment)), ohne kostenpflichtige Zusatzdienste vorauszusetzen. |
| Begründung | P1 nennt den Betrieb im Free-/Student-Tier als Geschäftsziel (G-05) und als technischen Constraint (CON-T-02, CON-T-05). Die Architekturdokumentation dokumentiert die konkreten Free-Tier-Limits (z. B. 500 MB Datenbank, 2 Verbindungen, ~50 Anfragen/s). |
| Betroffene Use Cases | mittelbar alle; unmittelbar UC-02 (Datenbankabfragen) und UC-06 (Schreibzugriffe) |
| Betroffene Datenobjekte / Datentypen | keine spezifische Entität; betrifft die Gesamtmenge der gespeicherten Daten und die Anfragehäufigkeit. |
| Betroffene Dialoge | keine dialogspezifische Wirkung |
| Akzeptanzkriterien | Given die aktuelle Deployment-Konfiguration, When sie mit den in P2 gelisteten Nachbarsystemen und den in der Architekturdokumentation dokumentierten Free-Tier-Grenzen abgeglichen wird, Then werden ausschließlich diese Dienste innerhalb ihrer Grenzen genutzt (kein kostenpflichtiger Zusatzdienst). Given die erwartete Nutzerzahl aus P1 (SC-04: ~100–500 aktive Nutzer), When das System unter dieser Last betrachtet wird, Then bleibt es im Rahmen des jeweiligen Provider-Plans. |
| Prüfmethode | Review der Deployment- und Infrastrukturkonfiguration gegen die Architekturdokumentation (§6); Abgleich der genutzten Dienste mit der Nachbarsystem-Liste aus P2/S1. |
| Offene Punkte | Ein konkreter Lasttest bis an die Free-Tier-Grenzen ist nicht vorgesehen; SC-04 bleibt insofern eine Zielgröße, kein geprüfter Wert. |

## N1.4 Qualitätsanforderungen nach Use Cases

| Use Case | Relevante Qualitätsanforderungen | Begründung | Prüfansatz |
|---|---|---|---|
| UC-02 Session suchen | N1-QA-01, N1-QA-02, N1-QA-03, N1-QA-06, N1-QA-10 | Suche ist der zentrale Discovery-Workflow (P1 SC-03); muss performant, mobil nutzbar und robust gegen fehlende Kartendaten sein. | Manueller Suchtest, DevTools-Viewport-Test, Test ohne Kartendienst |
| UC-03 Session-Detail ansehen | N1-QA-02, N1-QA-04 | Detailansicht zeigt Organisator- und Teilnehmerdaten; Datenschutz und mobile Lesbarkeit stehen im Vordergrund. | Feldabgleich gegen D1, Viewport-Test |
| UC-04 Session beitreten | N1-QA-01, N1-QA-02, N1-QA-05, N1-QA-06 | Beitritt ist die kapazitätskritische Kernaktion (AF-01); erfordert Konsistenz bei Parallelzugriff und Zugriffsschutz. | Code-Walkthrough Atomarität, Test mit nicht angemeldetem Nutzer |
| UC-06 Session erstellen | N1-QA-01, N1-QA-02, N1-QA-03, N1-QA-10 | Erstellung soll laut SC-02 unter zwei Minuten möglich sein und im Free-Tier-Rahmen bleiben. | Zeitmessung des Workflows, Review der Schreiblast |
| UC-07 Teilnehmerliste anzeigen | N1-QA-01, N1-QA-04 | Teilnehmerliste zeigt personenbezogene Daten (Namen, Check-in-Status) nur dem berechtigten Organisator. | Feldabgleich gegen D1, Berechtigungstest |
| UC-08 Check-in per QR-Code durchführen | N1-QA-01, N1-QA-02, N1-QA-05, N1-QA-06, N1-QA-09 | Check-in muss schnell, mobil und mit klaren Fehlermeldungen funktionieren; PIN/QR-Sicherheit ist bewusst dimensioniert (AF-04). | Mobiler Test des QR-Scans, Prüfung der Ablehnungstexte |
| UC-09 Check-in per PIN durchführen | N1-QA-01, N1-QA-02, N1-QA-05, N1-QA-06, N1-QA-09 | Fallback zu UC-08 mit denselben Anforderungen an Konsistenz und verständliche Fehlertexte. | Test mit falscher PIN, Test außerhalb des Zeitfensters |
| UC-10 Court / Sportort erfassen oder auswählen | N1-QA-03, N1-QA-06, N1-QA-10 | Erfassung soll einfach bleiben; Kartenpin und Reverse-Geocoding müssen konsistente Ortsdaten liefern und die Nutzungsgrenzen des öffentlichen Dienstes einhalten. | Test mit gültigem Pin sowie Test bei Karten-/Geocoding-Ausfall |
| UC-12 Profil und Sportpräferenzen verwalten | N1-QA-02, N1-QA-04 | Profilverwaltung betrifft direkt personenbezogene Daten und muss auf allen Geräten bedienbar sein. | Feldabgleich gegen D1, Viewport-Test |

## N1.5 Abgrenzung zu Randbedingungen aus P1

Qualitätsanforderungen (N1) beschreiben **gewünschte Eigenschaften** einer bereits im Scope liegenden Lösung (wie gut, wie schnell, wie sicher). Randbedingungen (P1.5) beschränken dagegen **von vornherein den Lösungsraum** (welche Technologien, welches Budget, welche Nutzergruppe). N1 baut auf den P1-Randbedingungen auf und leitet daraus keine neuen Technologien ab, sondern konkretisiert, wie die bestehenden Randbedingungen im Betrieb einzuhalten sind.

Folgende in P1 dokumentierte Randbedingungen sind für N1 unmittelbar relevant:

| P1-Randbedingung | Bezug in N1 |
|---|---|
| CON-D-01 Datenschutz/DSGVO | N1-QA-04 |
| CON-T-02, CON-T-05 Free-/Student-Tier | N1-QA-10 |
| CON-T-04 Responsive Web-UI, kein Native App | N1-QA-02 |
| CON-D-03 Authentifizierung ohne SMS | N1-QA-05 (Auth über Supabase, keine SMS-Kosten) |
| NG-01, NG-02, NG-08 (kein Payment, kein Messaging, keine KI-Integration) | Grenzen für N1-QA-10: keine zusätzlichen kostenpflichtigen Dienste dieser Art vorzusehen |

## N1.6 Testbarkeit und Akzeptanzkriterien

| Qualitätsanforderung | Prüfmethode | Erwartetes Ergebnis | Bezug zu Architektur/Code |
|---|---|---|---|
| N1-QA-01 Performance | Manuelle Durchführung der Kernworkflows im Browser | Sichtbare Reaktion ohne wahrnehmbaren Hänger; Ladeanzeige bei längeren Anfragen | Frontend-Komponenten der Dialoge DLG-02–DLG-06, Supabase PostgREST (P2 NB-03) |
| N1-QA-02 Mobile Nutzbarkeit | Browser-DevTools, Geräteemulation | Kein horizontales Scrollen, alle Muss-Aktionen bedienbar | Responsive Layout aller Dialoge (B1) |
| N1-QA-03 Usability | Manuelle Zeitmessung der Workflows Suche/Erstellung/Beitritt | Erstellung < 2 Min. (SC-02), Suche < 3 Min. (SC-03) | DLG-02, DLG-05 |
| N1-QA-04 Datenschutz | Feldabgleich angezeigter Daten gegen D1 | Nur in D1 definierte Profilfelder sichtbar | DLG-04, DLG-08, `profile`-Zugriff |
| N1-QA-05 Sicherheit | Code-Review Zugriffsprüfung, Repository-Scan | Geschützte Aktionen nur für angemeldete/berechtigte Nutzer; keine Secrets im Repo | Auth-Prüfung (AF-01/AF-02), Repository-Historie |
| N1-QA-06 Zuverlässigkeit | Code-Walkthrough Atomarität, Test ohne Kartendienst | Keine Überbuchung; kontrollierte Degradation der Kartenansicht | AF-01-Umsetzung, DLG-03-Fehlerfall |
| N1-QA-07 Wartbarkeit | Stichprobenartiger Namensabgleich Code ↔ D1/D2/P2 | Konsistente Benennung von Entitäten und Modulen | gesamte Codebasis |
| N1-QA-08 Testbarkeit | Abgleich Akzeptanzkriterium ↔ beobachtetes Verhalten | Verhalten entspricht F2/F3-Kriterien | alle MVP-Use-Cases |
| N1-QA-09 Nachvollziehbarkeit | Prüfung der Fehlertexte je Ausnahmefall | Keine technischen Interna, verständliche Sprache | Fehlerbehandlung (B1.5.4), Ergebniscodes (F3) |
| N1-QA-10 Free-Tier-Betrieb | Review der Deployment-Konfiguration gegen die Architekturdokumentation | Ausschließlich in P2 gelistete Free-Tier-Dienste genutzt | Deployment-Topologie ([arch §6](../arch/README.md#6-verteilung-und-deployment)) |

## N1.7 Bewusst nicht festgelegte Qualitätsanforderungen

Folgende Punkte sind bewusst **nicht** Teil der Qualitätsanforderungen von LocalCourt — als saubere Scope-Abgrenzung, nicht als Ausrede:

| Nicht festgelegt | Begründung |
|---|---|
| Verbindliche 24/7-Produktivverfügbarkeit | Hochschulprojekt im Free-Tier (P1 CON-T-02); ein Verfügbarkeits-SLA wäre ohne dedizierte Infrastruktur nicht seriös zusagbar. |
| Garantierte Antwortzeiten unter realer Produktionslast | Reale Lastprofile sind unbekannt; N1-QA-01 nennt daher ein Ziel unter Entwicklungs-/Testbedingungen statt eines SLA-Werts. |
| Barrierefreiheitszertifizierung (z. B. WCAG-Konformitätsnachweis) | Nicht in P1 als Ziel oder Erfolgskriterium genannt; N1-QA-02 deckt nur responsive Mobile-Nutzbarkeit ab, keine formale Zertifizierung. |
| Vollständige Security-Audit-Abdeckung | Kein Budget/Zeitrahmen für ein externes Audit im Hochschulprojekt (P1 CON-O-02); N1-QA-05 beschränkt sich auf grundlegende Zugriffs- und Secret-Prüfung. |
| Professionelle Monitoring-/Alerting-Pflichten | Professionelles Monitoring ist im MVP nicht vorgesehen; die Provider-eigenen Logs (Supabase, Vercel) genügen. |
| Payment- oder Benachrichtigungsanforderungen | In P1 ausdrücklich ausgeschlossen (NG-01, NG-02); daher auch keine zugehörigen Qualitätsanforderungen (z. B. Zustellzuverlässigkeit von E-Mails). |
| Feldlängen für `title`, `display_name`, `description` | Es gibt keinen fachlichen Grenzwert, der sich begründen ließe; die Felder werden von Nutzern für Nutzer gefüllt, und eine zu knappe Grenze schadet mehr als sie nützt. Die Datenbank speichert sie ohne feste Längenbegrenzung ([N2.2](N2-querschnittskonzepte.md#n22-technische-typzuordnung)). Sollte sich im Betrieb Missbrauch zeigen, ist eine Obergrenze nachträglich ohne Datenmigration ergänzbar. |
| Maximale Session-Dauer | Eine Obergrenze hätte im MVP keinen Schutzzweck: Sessions legen Menschen für sich selbst an, eine unrealistische Dauer schadet niemandem außer dem Ersteller. Die Untergrenze `≥ 1` aus [D2.6](D2-datentypen.md#d26-duration) verhindert widersprüchliche Zeitfenster und genügt damit. |
| Technische Zeittoleranz beim Check-in | Am Rand des `active`-Fensters wird **keine** zusätzliche Toleranz eingeräumt; maßgeblich ist ausschließlich die Serverzeit ([N2.10](N2-querschnittskonzepte.md#n210-zeitfenster-und-zeittoleranz-beim-check-in-af-02)). Eine Toleranz von Sekunden würde die Nutzbarkeit nicht messbar verbessern, aber die Regel aus AF-02 aufweichen. |

## N1.8 Konsistenzprüfung mit anderen Bausteinen

| Quelle | Relevanz für N1 | Ergebnis der Prüfung |
|---|---|---|
| [P1](P1-ziele-rahmenbedingungen.md) | Geschäftsziele (G-03, G-05), Erfolgskriterien (SC-02–SC-05) und Constraints (CON-T-*, CON-D-*) sind die primäre Quelle der Qualitätsziele. | Konsistent; N1-QA-01–N1-QA-05, N1-QA-10 direkt aus P1 abgeleitet, keine neuen Constraints erfunden. |
| [P2](P2-architekturueberblick.md) | Nachbarsysteme grenzen die Free-Tier-Dienste ein, die N1-QA-10 einhält; die [Architekturdokumentation](../arch/README.md#6-verteilung-und-deployment) konkretisiert Deployment-Topologie und Free-Tier-Limits, ihre Fehlerbehandlungsmuster stützen N1-QA-06/N1-QA-09. | Konsistent; genannte Limits (500 MB, 2 Verbindungen) stimmen mit arch §6 überein. |
| [F1](F1-geschaeftsprozesse.md) | Mobile Nutzung des QR-Check-ins (GP-02 A13) stützt N1-QA-02; Ausschluss von Benachrichtigungen stützt N1.7. | Konsistent; keine Widersprüche zu den Geschäftsprozessen. |
| [F2](F2-anwendungsfaelle.md) | „Bezug zu NFR / Qualität" je Use Case ist die direkte Grundlage der Mapping-Tabelle in N1.4. | Konsistent; alle in F2 genannten NFR-Stichworte sind in N1.2/N1.3 aufgegriffen. |
| [F3](F3-anwendungsfunktionen.md) | Sicherheitsniveau der PIN, Konsistenz bei Parallelzugriff und Zeittoleranz sind direkte Grundlage von N1-QA-05/N1-QA-06. | Konsistent; die fachlichen Regeln aus F3 werden in N1 bewertet und in N2 technisch konkretisiert. |
| [D1](D1-datenmodell.md) | Datenschutzhinweis und festgelegte Sichtbarkeit von `profile` (D1.4) sind Grundlage von N1-QA-04. | Konsistent; kein neues Datenobjekt eingeführt. |
| [D2](D2-datentypen.md) | PIN-Sicherheitsniveau (D2.4) ist Grundlage von N1-QA-05. | Konsistent; Feldlängen, maximale Session-Dauer und Check-in-Zeittoleranz sind in [N1.7](#n17-bewusst-nicht-festgelegte-qualitätsanforderungen) als bewusst nicht festgelegt dokumentiert und damit nicht mehr offen. |
| [B1](B1-dialogspezifikation.md) | Standard-Fehler-/Ladezustände (B1.5.4) und verbindliche Fehlertexte in DLG-04/DLG-06 sind Grundlage von N1-QA-09; Responsive-Hinweis (B1.1) stützt N1-QA-02. | Konsistent; N1 verdoppelt die Dialogfestlegungen nicht, sondern bewertet sie als Qualitätsanforderung. |
| [S1](S1-nachbarsysteme.md) | Fehlerbehandlung der Nachbarsysteme (Rate-Limiting, Tile-Load-Timeout) stützt N1-QA-06/N1-QA-10. | Konsistent; S1 nennt je Nachbarsystem einen Ausfallpfad und verweist für die kontrollierte Degradation auf N1-QA-06. |

## N1.9 Weiterverwendung in Architektur, Tests und Code

- **Datenschutz/Sicherheit** (N1-QA-04, N1-QA-05) sollen später als arc42-Qualitätsszenarien übernommen werden und Architekturentscheidungen zu Authentifizierung, Datenzugriff (Row-Level-Security) und Secret-Management beeinflussen; im Code sichtbar als Zugriffsprüfungen vor Beitritt/Check-in und als Abwesenheit von Secrets im Repository.
- **Performance** (N1-QA-01) soll spätere Entscheidungen zu Datenabfragen (Indizierung, Filterlogik der Suche) und zur Karten-/Listenansicht beeinflussen; im Code sichtbar als Ladezustände und Antwortverhalten der Suche.
- **Usability** (N1-QA-02, N1-QA-03) soll unmittelbar in den B1-Dialogen sichtbar werden: Fehlermeldungen, mobile Layouts und die Kürze der Erstellungs-/Beitrittswege.
- **Wartbarkeit** (N1-QA-07) soll die Modulstruktur und Benennung im Code prägen: Wiederverwendung der D1/D2-Namen, Zuordnung von Code-Modulen zu den P2-Architekturkomponenten.
- **Testbarkeit** (N1-QA-08) soll über die vorhandenen F2-Akzeptanzkriterien und F3-Entscheidungstabellen hinaus als Grundlage für manuelle Test-Checklisten und, falls eingeführt, automatisierte Tests dienen.

Im Review lässt sich damit für jede Qualitätsanforderung erklären: welcher Use Case betroffen ist (N1.2/N1.4), warum die Anforderung besteht (N1.3 „Begründung"), und wie sie geprüft wird (N1.3 „Prüfmethode", N1.6).

## N1.10 Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | Claude Code, ChatGPT, Codex |
| Verwendung | Entwurf und Strukturierung der Qualitätsanforderungen N1-QA-01 bis N1-QA-09 samt Prüfkriterien und Akzeptanzkriterien. |
| Prüfung | Abgeglichen mit P1, P2, F1, F2, F3, D1, D2, B1 und S1; die bewusst nicht festgelegten Größen sind in [N1.7](#n17-bewusst-nicht-festgelegte-qualitätsanforderungen) begründet. |
