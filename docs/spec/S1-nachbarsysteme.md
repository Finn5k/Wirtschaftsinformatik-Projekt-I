# S1 — Nachbarsysteme (Schnittstellen)

S1 detailliert die Schnittstellen-Contracts zwischen LocalCourt und den in [P2.2](P2-architekturueberblick.md#p22-nachbarsysteme) aufgezählten Nachbarsystemen. Für jedes Nachbarsystem NB-nn beschreibt dieser Baustein die **Operationen**, die LocalCourt gegen das System auslöst, die **Daten**, die dabei in beide Richtungen laufen, und die **Fehlersemantik**, die der aufrufende Anwendungsfall beachten muss.

S1 beschreibt ausschließlich die **Grenze** zwischen LocalCourt und dem jeweiligen Nachbarsystem. Nicht Gegenstand dieses Bausteins sind der umgebende Ablauf (das ist [F2](F2-anwendungsfaelle.md)), die fachlichen Regeln hinter einer Operation (das ist [F3](F3-anwendungsfunktionen.md)), die eigenen Entitäten von LocalCourt (das ist [D1](D1-datenmodell.md)) und die technische Umsetzung im Datenbankschema (das ist [N2](N2-querschnittskonzepte.md)).

Das Systemkontext-Diagramm in [P2.1](P2-architekturueberblick.md#p21-systemkontext) zeigt die hier detaillierten Nachbarsysteme im Überblick; es wird an dieser Stelle bewusst nicht wiederholt. Die Zuordnung lautet:

| Nachbarsystem (P2.2) | Abschnitt in S1 | Contract vorhanden? |
|---|---|---|
| NB-01 — Browser | [S1.2](#s12-nb-01--browser-nutzerkanal) | Kein eigener Protokoll-Contract; die Schnittstelle ist die Dialogfläche aus [B1](B1-dialogspezifikation.md). |
| NB-02 — Supabase Authentication | [S1.3](#s13-nb-02--supabase-auth) | Ja, fünf Operationen. |
| NB-03 — Supabase PostgREST API | [S1.4](#s14-nb-03--supabase-postgrest) | Ja, Lese- und Schreiboperationen. |
| NB-04 — OpenStreetMap / Leaflet | [S1.5](#s15-nb-04--openstreetmap-tiles) | Ja, eine Operation (Kartenkacheln); Leaflet selbst ist eine Client-Bibliothek ohne Netz-Contract. |
| NB-05 — Nominatim | [S1.6](#s16-nb-05--nominatim-reverse-geocoding) | Ja, eine Operation für Reverse-Geocoding bei der Court-Erfassung. |

## S1.1 Konventionen

Die folgenden Zusagen gelten für **jede** in S1 beschriebene Operation und werden in den Einzelabschnitten nicht wiederholt.

- **Synchron und blockierend.** Jeder Aufruf gegen ein Nachbarsystem gehört zu einer Benutzeraktion im Browser und wird synchron beantwortet. Es gibt keine Warteschlangen, keine Hintergrundprozesse, keine zeitgesteuerten Wiederholungen und keine Ereignis-Abonnements (Push/WebSocket). Das deckt sich mit dem Verzicht auf Scheduler und Message Queues in [P2](P2-architekturueberblick.md).
- **Fehlerpropagierung.** Fehler eines Nachbarsystems (Zeitüberschreitung, 4xx, 5xx, Netzabbruch) werden an den aufrufenden Anwendungsfall weitergegeben und dem Nutzer in den Fehler- und Ladezuständen aus [B1.5.4](B1-dialogspezifikation.md#b154-fehler--und-ladezustände) angezeigt. Fachliche Ablehnungen sind davon zu unterscheiden: Sie folgen den Ergebniscodes aus [F3](F3-anwendungsfunktionen.md) und dem Fehler-Mapping in [N2.3](N2-querschnittskonzepte.md#n23-fehler-mapping-ergebniscodes--http) und erscheinen als Inline-Meldung, nicht als Systemfehler. Ein fehlgeschlagener Aufruf verändert den fachlichen Zustand nicht.
- **Kontrollierte Degradation.** Ist ein Nachbarsystem nicht erreichbar, bleibt die Anwendung bedienbar, soweit sie ohne dieses System auskommt; ein Ausfall führt zu einer verständlichen Meldung, nicht zum Absturz ([N1-QA-06](N1-nichtfunktionale-anforderungen.md#n12-qualitätsziele-im-überblick)). Der jeweilige Ausfallpfad ist pro Nachbarsystem angegeben.
- **Authentifizierung.** Aufrufe gegen NB-03 tragen das Zugangstoken (JWT), das LocalCourt zuvor über NB-02 erhalten hat. Der öffentliche Projektschlüssel von Supabase (Publishable Key) begleitet jeden Aufruf, ist **kein Geheimnis** und liegt bauartbedingt im ausgelieferten Frontend-Bundle; der Zugriffsschutz wird nicht über diesen Schlüssel, sondern über Row-Level-Security ([N2.2](N2-querschnittskonzepte.md#n22-row-level-security-rls)) erbracht. Geheime Schlüssel (Service-Role-Key) werden vom Frontend **nie** verwendet und liegen nicht im Repository ([N1-QA-05](N1-nichtfunktionale-anforderungen.md#n1-qa-05--sicherheit)).
- **Ebene der Beschreibung.** S1 benennt Operationen und ihre Semantik. Konkrete Bindung und Laufzeitverhalten gehören in die [Architekturdokumentation](../arch/README.md) sowie in den Code. Die technische Ausformung des Datenmodells hinter NB-03 steht in [N2](N2-querschnittskonzepte.md).

## S1.2 NB-01 — Browser (Nutzerkanal)

Der Browser ist der einzige Kontaktpunkt zum Menschen. Die Schnittstelle ist die in [B1](B1-dialogspezifikation.md) spezifizierte Dialogfläche (Dialoge DLG-01–DLG-08, Standardaktionen B1.5); ein zusätzlicher Protokoll-Contract ist nicht nötig. Zu ergänzen sind nur zwei Punkte, die über die Dialogbeschreibung hinausgehen:

| Aspekt | Inhalt |
|---|---|
| **Einstieg per Deep-Link** | Der Check-in-Dialog ist über einen Link mit Session-Bezug und PIN erreichbar (`…/check-in?session=<session_id>&pin=<pin>`, [F3 AF-04](F3-anwendungsfunktionen.md#af-04--pin--und-qr-code-erzeugung)). Der Browser muss diesen Aufruf auch aus einem fremden Kontext (Kamera-App, Nachricht) verarbeiten; ist der Nutzer nicht angemeldet, greift die Weiterleitung aus [B1.5.2](B1-dialogspezifikation.md#b152-weiterleitung-nicht-angemeldeter-nutzer). |
| **Genutzte Plattformfähigkeiten** | Darstellung und Formulareingabe; Ablage des Zugangstokens im Browser (siehe [S1.3](#s13-nb-02--supabase-auth)); Öffnen von Deep-Links. LocalCourt nutzt **keine** Kamera-Schnittstelle und **keine** Standortermittlung des Geräts (siehe [S1.7](#s17-nicht-genutzte-schnittstellen-und-abgrenzung)). |

Der Aufbau des Frontends selbst (Komponenten, Zustandsverwaltung, Routing) ist keine Schnittstelle zu einem Nachbarsystem, sondern innere Architektur, und gehört nach `docs/arch/`.

## S1.3 NB-02 — Supabase Auth

Anmeldung und Sitzungsverwaltung. Der Auth-Nutzer selbst (E-Mail, Passwort, Token) gehört zum Nachbarsystem und ist **nicht** Teil des Datenmodells; LocalCourt übernimmt aus diesem System ausschließlich die Nutzerkennung als `profile.user_id` ([D1.4](D1-datenmodell.md#d14-entitätstypen-im-detail), [D2.2](D2-datentypen.md#d22-identifier)).

**Verfahren:** Ausschließlich **E-Mail und Passwort**. OAuth- bzw. Social-Login wird im MVP nicht verwendet. Eine **E-Mail-Bestätigung ist deaktiviert**: Nach der Registrierung ist der Nutzer unmittelbar angemeldet, wie es [B1 DLG-01](B1-dialogspezifikation.md#b141-dlg-01--anmelden--registrieren) beschreibt. LocalCourt versendet damit keine E-Mails.

| Operation | Beschreibung |
|---|---|
| `registrieren(email, passwort, anzeigename) → Sitzung` | Legt einen Auth-Nutzer an und eröffnet unmittelbar eine Sitzung. Ausgelöst durch [UC-01](F2-anwendungsfaelle.md#uc-01--registrieren--anmelden) (DLG-01, Zustand *Registrieren*). |
| `anmelden(email, passwort) → Sitzung` | Prüft die Zugangsdaten und eröffnet eine Sitzung. Ausgelöst durch [UC-01](F2-anwendungsfaelle.md#uc-01--registrieren--anmelden) (DLG-01, Zustand *Anmelden*). |
| `abmelden() → ∅` | Beendet die Sitzung und verwirft das Token. Ausgelöst durch die Abmeldeaktion in [DLG-08](B1-dialogspezifikation.md#b148-dlg-08--profil). |
| `sitzungErneuern() → Sitzung` | Tauscht ein ablaufendes Zugangstoken gegen ein neues. Läuft ohne Nutzerinteraktion. |
| `angemeldetenNutzerLesen() → Nutzerkennung` | Liefert die Kennung der aktuellen Sitzung; Grundlage jeder Berechtigungsprüfung in NB-03. |

| Aspekt | Inhalt |
|---|---|
| **Richtung** | Bidirektional (Anfrage: Zugangsdaten bzw. Token; Antwort: Sitzung mit Zugangstoken und Nutzerkennung). |
| **Eingaben** | E-Mail und Passwort aus DLG-01; der Anzeigename bei der Registrierung (wird zu `profile.display_name`, [D1.4](D1-datenmodell.md#d14-entitätstypen-im-detail)). Passwortrichtlinie und E-Mail-Syntaxprüfung erbringt das Nachbarsystem; die Formprüfung im Dialog steht in B1. |
| **Ausgaben** | Eine Sitzung mit Zugangstoken und der Nutzerkennung. Diese Kennung ist identisch mit `profile.user_id` und wird von LocalCourt **nicht** selbst vergeben. |
| **Semantik — Profilanlage** | Mit dem Auth-Nutzer entsteht **automatisch** der zugehörige `profile`-Datensatz; die Registrierung ist damit ein einziger fachlicher Vorgang und kann keinen Auth-Nutzer ohne Profil hinterlassen. Die technische Umsetzung (Trigger auf der Auth-Nutzertabelle) gehört nach [N2](N2-querschnittskonzepte.md). |
| **Semantik — Tokenablage** | Das Zugangstoken wird im Browser gehalten, damit eine Sitzung einen Seitenwechsel oder Neuladen überlebt, und beim Abmelden verworfen. Es wird ausschließlich an NB-03 und NB-02 gesendet, nie an NB-04. Läuft es ab und lässt sich nicht erneuern, beantwortet NB-03 Aufrufe mit `401`; LocalCourt leitet dann gemäß [B1.5.2](B1-dialogspezifikation.md#b152-weiterleitung-nicht-angemeldeter-nutzer) zur Anmeldung. |
| **Fehlerbehandlung** | Ungültige Zugangsdaten, bereits verwendete E-Mail-Adresse, zu schwaches Passwort und ein zu häufiger Anmeldeversuch (Rate-Limit des Dienstes) werden als Meldung im Dialog angezeigt, ohne dass eine Sitzung entsteht ([UC-01](F2-anwendungsfaelle.md#uc-01--registrieren--anmelden) Ausnahmefälle). Ist der Dienst nicht erreichbar, bleiben nur öffentlich lesbare Ansichten nutzbar; geschützte Aktionen werden abgelehnt statt ungeprüft ausgeführt. |
| **Nicht genutzt** | Passwort-Zurücksetzen, E-Mail-Bestätigung, Magic Links, Telefon-/SMS-Anmeldung, Fremdanbieter-Anmeldung, Mehrfaktor-Authentifizierung (siehe [S1.7](#s17-nicht-genutzte-schnittstellen-und-abgrenzung)). |

## S1.4 NB-03 — Supabase PostgREST

Fachlicher Datenzugriff. Jede Operation wird durch Row-Level-Security auf die Zeilen und Spalten eingeschränkt, die der angemeldete Nutzer sehen bzw. ändern darf ([N2.2](N2-querschnittskonzepte.md#n22-row-level-security-rls)); der Contract beschreibt daher stets den maximal möglichen Zugriff.

### Lesende Operationen

| Operation | Ausgelöst durch | Ausgaben und Semantik |
|---|---|---|
| `sessionsSuchen(ort?, sportart?, zeitraum?) → Sessionliste` | [UC-02](F2-anwendungsfaelle.md#uc-02--session-suchen) | Zukünftige und laufende Sessions passend zu den Filtern, je Session der Sportort, die Sportart, der abgeleitete Status und die bestätigte Teilnehmerzahl. Status und Zahl sind **abgeleitete** Merkmale ([D1.6](D1-datenmodell.md#d16-abgeleitete-merkmale)) und werden wie normale Felder gelesen. Die PIN ist in dieser Ansicht nicht enthalten. |
| `sessionLesen(session_id) → Sessiondetail` | [UC-03](F2-anwendungsfaelle.md#uc-03--session-detail-ansehen) | Eine Session mit Sportort, Sportart, Organisator, abgeleitetem Status und bestätigter Teilnehmerzahl. Die PIN ist nur enthalten, wenn der Aufrufer Organisator oder bestätigter Teilnehmer ist ([N2.2](N2-querschnittskonzepte.md#n22-row-level-security-rls)). |
| `teilnehmerLesen(session_id) → Teilnehmerliste` | [UC-07](F2-anwendungsfaelle.md#uc-07--teilnehmerliste-anzeigen) | Teilnehmer der Session mit Anzeigename, optionalem Profilbild und Teilnahmestatus. Den Check-in-Status aller Teilnehmer sieht nur der Organisator; ein Teilnehmer sieht seinen eigenen Eintrag. |
| `eigeneSessionsLesen() → Sessionliste` | [UC-05](F2-anwendungsfaelle.md#uc-05--eigene-sessions-anzeigen), [UC-11](F2-anwendungsfaelle.md#uc-11--session-historie-ansehen) | Sessions, an denen der angemeldete Nutzer teilnimmt oder die er organisiert — bevorstehende und vergangene, unterschieden über den abgeleiteten Status. |
| `courtsLesen(suchbegriff?) → Courtliste` | [UC-10](F2-anwendungsfaelle.md#uc-10--court--sportort-erfassen-oder-auswählen) | Sportorte des Verzeichnisses mit Name, Ort, optionaler Adressangabe und optionalen Koordinaten. Für alle angemeldeten Nutzer lesbar. |
| `sportartenLesen() → Sportartenliste` | UC-02, UC-06, UC-12 | Der Sportartenkatalog als Referenzdaten ([D1.3](D1-datenmodell.md#d13-entitätstypen-im-überblick)). Für alle angemeldeten Nutzer lesbar, unveränderlich aus Anwendungssicht. |
| `profilLesen(user_id) → Profil` | [UC-12](F2-anwendungsfaelle.md#uc-12--profil-und-sportpräferenzen-verwalten), UC-03, UC-07 | Anzeigename und Profilbild. Andere Nutzer sehen ausschließlich diese Basisfelder; Auth-Daten sind grundsätzlich nicht enthalten ([N1-QA-04](N1-nichtfunktionale-anforderungen.md#n1-qa-04--datensparsamkeit)). |
| `sportpraeferenzenLesen(user_id) → Sportartenliste` | [UC-12](F2-anwendungsfaelle.md#uc-12--profil-und-sportpräferenzen-verwalten) | Die Sportarten-Interessen eines Profils. |

### Schreibende Operationen — fachlich geprüft und atomar

Die drei Operationen, hinter denen eine Anwendungsfunktion aus [F3](F3-anwendungsfunktionen.md) steht, werden **serverseitig als eine unteilbare Einheit** ausgeführt und nicht als Schreibzugriff auf einzelne Tabellen angeboten. Direkte Änderungen an `session` und `participant` sind ausgeschlossen ([N2.2](N2-querschnittskonzepte.md#n22-row-level-security-rls)); nur so lassen sich die Kapazitäts- und Check-in-Regeln bei gleichzeitigen Zugriffen einhalten ([N1-QA-06](N1-nichtfunktionale-anforderungen.md#n12-qualitätsziele-im-überblick)).

| Operation | Beschreibung |
|---|---|
| `create_session(sportart, court, titel, beschreibung?, start, dauer, max_teilnehmer) → Session` | Legt eine Session an, erzeugt dabei ihre vierstellige PIN ([F3 AF-04](F3-anwendungsfunktionen.md#af-04--pin--und-qr-code-erzeugung)), legt den `organizer`-Eintrag an und führt den Organisator unmittelbar als bestätigten Teilnehmer ([D1.4](D1-datenmodell.md#d14-entitätstypen-im-detail), Invariante „Organisator ist Teilnehmer"). Alle drei Wirkungen treten gemeinsam ein oder gar nicht. Ausgelöst durch [UC-06](F2-anwendungsfaelle.md#uc-06--session-erstellen) (DLG-05). |
| `join_session(session_id) → Teilnahme` | Prüft Beitrittsfähigkeit, Doppelbeitritt und freie Plätze und legt die Teilnahme an ([F3 AF-01](F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel)). Prüfung und Anlage sind unteilbar, sodass die Kapazität auch bei gleichzeitigen Beitritten nicht überschritten wird. Keine Warteliste ([P1](P1-ziele-rahmenbedingungen.md) NG-10). Ausgelöst durch [UC-04](F2-anwendungsfaelle.md#uc-04--session-beitreten) (DLG-04). |
| `check_in(session_id, pin) → Teilnahme` | Prüft Teilnahme, PIN und Zeitfenster und markiert die Teilnahme als eingecheckt ([F3 AF-02](F3-anwendungsfunktionen.md#af-02--check-in-validierung)). Maßgeblich ist die Serverzeit, nie die Uhr des Geräts. Mehrfachaufrufe sind unschädlich (idempotent). QR-Weg und manuelle PIN-Eingabe nutzen dieselbe Operation. Ausgelöst durch [UC-08](F2-anwendungsfaelle.md#uc-08--check-in-per-qr-code-durchführen) und [UC-09](F2-anwendungsfaelle.md#uc-09--check-in-per-pin-durchführen) (DLG-06). |

**Ergebnisse und Ablehnungen:** Die fachlichen Ergebniscodes dieser drei Operationen (`OK`, `SESSION_FULL`, `ALREADY_JOINED`, `SESSION_NOT_JOINABLE`, `NOT_JOINED`, `INVALID_CREDENTIAL`, `OUTSIDE_WINDOW`, `ALREADY_CHECKED_IN`) sind in F3 definiert und in [N2.3](N2-querschnittskonzepte.md#n23-fehler-mapping-ergebniscodes--http) auf HTTP-Antworten abgebildet. Eine Ablehnung ist **kein** Systemfehler: Sie lässt den fachlichen Zustand unverändert und erscheint als Inline-Meldung mit dem Text aus [B1 DLG-06](B1-dialogspezifikation.md#b146-dlg-06--check-in) bzw. DLG-04.

### Schreibende Operationen — einfache Zuordnung

Hier genügt eine Berechtigungsprüfung ohne mehrschrittige fachliche Regel; die Prüfung erfolgt über Row-Level-Security.

| Operation | Ausgelöst durch | Semantik |
|---|---|---|
| `courtAnlegen(name, ort, adresse?, koordinaten) → Court` | [UC-10](F2-anwendungsfaelle.md#uc-10--court--sportort-erfassen-oder-auswählen) | Jeder angemeldete Nutzer darf einen Sportort erfassen; er wird als Erfasser vermerkt. Name, Ort und Koordinaten sind Pflicht, die Adressangabe ist optional ([D1.4](D1-datenmodell.md#d14-entitätstypen-im-detail)). Koordinaten entstehen durch den Kartenpin ([S1.5](#s15-nb-04--openstreetmap-tiles)); Ort und Adresse stammen aus dem unmittelbar ausgelösten Reverse-Geocoding ([S1.6](#s16-nb-05--nominatim-reverse-geocoding)). Eine automatische Dublettenprüfung ist gemäß UC-10 bewusst nicht Teil des MVP. |
| `profilAktualisieren(anzeigename, ort) → Profil` | [UC-12](F2-anwendungsfaelle.md#uc-12--profil-und-sportpräferenzen-verwalten) | Nur das eigene Profil ist änderbar. `avatar_url` wird im MVP nicht geändert. |
| `sportpraeferenzSetzen(sportart)` / `sportpraeferenzEntfernen(sportart)` | [UC-12](F2-anwendungsfaelle.md#uc-12--profil-und-sportpräferenzen-verwalten) | Nur die eigenen Präferenzen sind änderbar; je Nutzer und Sportart höchstens ein Eintrag ([D1.4](D1-datenmodell.md#d14-entitätstypen-im-detail)). |

### Rahmenbedingungen von NB-03

| Aspekt | Inhalt |
|---|---|
| **Richtung** | Bidirektional (Anfrage: Filter bzw. Nutzdaten; Antwort: Datensätze bzw. Ergebniscode). |
| **Fehlerbehandlung** | Technische Fehler (fehlendes oder abgelaufenes Token, verletzte Zugriffsregel, Datenbankfehler) werden nach [N2.3](N2-querschnittskonzepte.md#n23-fehler-mapping-ergebniscodes--http) beantwortet und als Fehlerzustand nach [B1.5.4](B1-dialogspezifikation.md#b154-fehler--und-ladezustände) angezeigt. Meldungen an den Nutzer enthalten keine technischen Interna ([N1-QA-09](N1-nichtfunktionale-anforderungen.md#n12-qualitätsziele-im-überblick)). |
| **Ausfallpfad** | Ist NB-03 nicht erreichbar, ist LocalCourt fachlich nicht nutzbar — es gibt keinen lokalen Datenbestand und keinen Offline-Betrieb. Der Nutzer erhält eine Meldung mit Wiederholmöglichkeit; es werden keine Daten zwischengespeichert und später nachgesendet. |
| **Mengen und Grenzen** | Die Nutzung bleibt im Rahmen des Free-Tiers ([N1-QA-10](N1-nichtfunktionale-anforderungen.md#n1-qa-10--betrieb-im-free-student-tier), [Architekturdokumentation §6](../arch/README.md#6-verteilung-und-deployment)). Ergebnislisten werden seitenweise abgerufen; die konkrete Seitengröße ist ein Umsetzungsdetail. |

## S1.5 NB-04 — OpenStreetMap-Tiles

Kartendarstellung der Sportorte. Zu trennen sind zwei Dinge: Der **Kachel-Dienst** von OpenStreetMap ist das Nachbarsystem mit einem Netz-Contract; **Leaflet** ist eine im Browser laufende Client-Bibliothek, die diese Kacheln darstellt — sie ist kein Nachbarsystem und ihre Programmierschnittstelle gehört nach `docs/arch/`.

| Aspekt | Inhalt |
|---|---|
| **Operation** | `kachelnLaden(kartenausschnitt, zoomstufe) → Kartenbilder` |
| **Richtung** | Ausgehend (die Antwort wird ausschließlich dargestellt, nicht gespeichert). |
| **Eingaben** | Der aktuell sichtbare Kartenausschnitt und die Zoomstufe. Es werden **keine** personenbezogenen Daten und keine Nutzerkennung übertragen; insbesondere geht das Zugangstoken aus NB-02 nie an dieses System. |
| **Ausgaben** | Kartenbilder zur Darstellung. Es werden keine Kartendaten persistiert ([D1.7](D1-datenmodell.md#d17-nicht-modellierte-datenobjekte)). |
| **Ausgelöst durch** | [UC-02](F2-anwendungsfaelle.md#uc-02--session-suchen) und [UC-03](F2-anwendungsfaelle.md#uc-03--session-detail-ansehen) (Kartenansicht, [B1 DLG-03](B1-dialogspezifikation.md#b143-dlg-03--session-karte)) sowie [UC-10](F2-anwendungsfaelle.md#uc-10--court--sportort-erfassen-oder-auswählen) beim Setzen eines Pins. |
| **Semantik — Koordinaten** | Die Karte dient der Anzeige vorhandener Sportorte und dem **Setzen eines Pins** bei der Neuerfassung. Ein gesetzter Pin liefert Breite und Länge ([D2.7](D2-datentypen.md#d27-geocoordinate)); dieses Koordinatenpaar wird anschließend an NB-05 übergeben, um Ort und optionale Adresse zu bestimmen. |
| **Semantik — Nutzungsbedingungen** | Die Kacheln werden gemäß der Nutzungsrichtlinie von OpenStreetMap bezogen: sichtbare Quellenangabe in der Kartenansicht, sparsame Nutzung durch normales Kartenverhalten (kein flächiges Vorabladen, kein Massenabruf, kein Weiterverteilen der Kacheln). Die Quellenangabe ist verpflichtend und Teil der Dialogfläche. |
| **Fehlerbehandlung** | Laden die Kacheln nicht oder ist der Dienst nicht erreichbar, bleiben Suche, Listen- und Detailansichten vorhandener Courts nutzbar. Die Neuerfassung eines Courts ist ohne Kartenpin jedoch nicht möglich; der Dialog zeigt einen Hinweis und eine Wiederholmöglichkeit. |

## S1.6 NB-05 — Nominatim Reverse-Geocoding

Nominatim bestimmt bei der Neuerfassung eines Courts aus dem vom Nutzer gesetzten
Kartenpin die nächstgelegenen strukturierten Orts- und Adressdaten. Der Dienst
wird ausschließlich durch diese einzelne Nutzeraktion ausgelöst; es gibt keine
Adresssuche, Autovervollständigung oder automatische Geräteortung.

| Aspekt | Inhalt |
|---|---|
| **Operation** | `ortAufloesen(latitude, longitude) → { city, address? }` |
| **Richtung** | Ausgehend; Koordinaten werden übertragen, Orts- und Adressdaten zurückgegeben. |
| **Eingaben** | Das WGS84-Koordinatenpaar des in DLG-05 gesetzten Kartenpins. Keine Nutzerkennung, kein JWT und keine Profildaten. |
| **Ausgaben** | Ein strukturierter Ort (`city`) und, sofern für das nächstgelegene geeignete OpenStreetMap-Objekt verfügbar, eine Adresse (`address`). |
| **Ausgelöst durch** | [UC-10](F2-anwendungsfaelle.md#uc-10--court--sportort-erfassen-oder-auswählen), unmittelbar nach dem Setzen oder Verschieben des Kartenpins in DLG-05. |
| **Semantik** | Das Ergebnis bezieht sich auf das nächstgelegene geeignete OpenStreetMap-Objekt und kann vom exakten Pin abweichen. Gespeichert werden der gesetzte Pin und die zu diesem Abruf gelieferten Ortsdaten gemeinsam. |
| **Nutzungsbedingungen** | Nutzung der öffentlichen Instanz nur für das kleine Hochschul-MVP: höchstens eine Anfrage pro Sekunde anwendungsweit, identifizierbarer Referer beziehungsweise User-Agent, sichtbare Attribution und keine systematischen oder periodischen Abfragen. Wiederholte identische Anfragen werden vermieden; der Anbieter muss ohne fachliche Datenmigration austauschbar bleiben. |
| **Fehlerbehandlung** | Liefert der Dienst keinen verwertbaren Ort, ist er nicht erreichbar oder begrenzt er den Zugriff, wird kein unvollständiger Court gespeichert. DLG-05 zeigt eine verständliche Meldung und eine manuell auslösbare Wiederholmöglichkeit. |

Maßgeblich sind die
[Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
und die
[Dokumentation der Reverse-Operation](https://nominatim.org/release-docs/latest/api/Reverse/).

## S1.7 Nicht genutzte Schnittstellen und Abgrenzung

Bewusst **nicht** genutzte Fähigkeiten der bestehenden Nachbarsysteme — hier festgehalten, damit ihr Fehlen als Entscheidung erkennbar ist und nicht als Lücke:

| Nicht genutzt | Begründung |
|---|---|
| Ereignis-Abonnements / Echtzeit-Kanal (Supabase Realtime) | Alle Ansichten werden bei Aufruf bzw. Aktualisierung neu gelesen. Ein dauerhafter Kanal wäre ein zusätzliches Nachbarsystem-Verhalten mit eigenen Free-Tier-Grenzen und eigenem Ausfallpfad, ohne dass ein Anwendungsfall es fordert. |
| Dateiablage (Supabase Storage) | Das Profilbild wird als Verweis (`avatar_url`, [D1.4](D1-datenmodell.md#d14-entitätstypen-im-detail)) geführt; LocalCourt lädt keine Dateien hoch. Der QR-Code wird zur Laufzeit erzeugt und nicht als Bild gespeichert ([F3 AF-04](F3-anwendungsfunktionen.md#af-04--pin--und-qr-code-erzeugung)). |
| Serverseitige Funktionen außerhalb der Datenbank (Edge Functions) | Die drei fachlich geprüften Operationen laufen in der Datenbank; eine weitere Ausführungsumgebung ist nicht nötig. |
| Passwort-Zurücksetzen und E-Mail-Bestätigung | Beide setzen E-Mail-Versand voraus, der außerhalb des MVP liegt. **Folge, bewusst in Kauf genommen:** Ein vergessenes Passwort kann im MVP nicht selbst zurückgesetzt werden. |
| Fremdanbieter-Anmeldung (OAuth / Social Login) | Im MVP nur E-Mail und Passwort. |
| Kamera-Schnittstelle des Browsers | Der QR-Code wird mit der Kamera-App des Geräts gescannt, die den Deep-Link im Browser öffnet ([B1 DLG-06](B1-dialogspezifikation.md#b146-dlg-06--check-in)). LocalCourt braucht deshalb keinen eigenen Scanner, keine Kameraberechtigung und keine Scanner-Bibliothek. Steht keine Kamera zur Verfügung, greift die gleichwertige PIN-Eingabe ([UC-09](F2-anwendungsfaelle.md#uc-09--check-in-per-pin-durchführen)). |
| Standortermittlung des Geräts (Geolocation) | Die Ortssuche erfolgt gemäß [F1](F1-geschaeftsprozesse.md) GP-01 A3 und [UC-02](F2-anwendungsfaelle.md#uc-02--session-suchen) über eine Eingabe des Nutzers, nicht über die Geräteposition — datenschutzseitig die zurückhaltendere Variante ([N1-QA-04](N1-nichtfunktionale-anforderungen.md#n1-qa-04--datensparsamkeit)). |

Ebenfalls **nicht** Gegenstand von S1:

- **Endpunkt-URLs, Feldnamen, Header, Wiederholungsbudgets, Bibliotheksaufrufe** — Umsetzungsdetails, siehe [Architekturdokumentation](../arch/README.md) und Code.
- **Innerer Aufbau des Frontends** (Komponenten, Zustandsverwaltung, Routing) — Architektur, nicht Schnittstelle.
- **Datenbankschema, Schlüssel, Zugriffsregeln im Detail** — siehe [N2](N2-querschnittskonzepte.md).
- **Ablauf und Reihenfolge der Aufrufe** innerhalb eines Anwendungsfalls — siehe [F2](F2-anwendungsfaelle.md) und die Laufzeitsichten in der [Architekturdokumentation §5](../arch/README.md#5-laufzeitsichten).

## S1.8 Konsistenz und Cross-References

| Baustein | Bezug zu S1 |
|---|---|
| [P1](P1-ziele-rahmenbedingungen.md) | Die Free-Tier-Rahmenbedingungen (CON-T-01–CON-T-05) begrenzen die Auswahl der Nachbarsysteme und damit auch das Anmeldeverfahren in S1.3: E-Mail und Passwort statt eines kostenpflichtigen SMS-Gateways. |
| [P2](P2-architekturueberblick.md) | P2.2 zählt die Nachbarsysteme auf; jeder dortige NB-Eintrag wird hier in genau einem Abschnitt detailliert. Die [Architekturdokumentation §5](../arch/README.md#5-laufzeitsichten) zeigt die Aufrufreihenfolge, S1 die Operationen selbst. |
| [F1](F1-geschaeftsprozesse.md) | Die Akteure „Supabase", „OpenStreetMap" und „Nominatim" entsprechen NB-02/NB-03, NB-04 und NB-05. |
| [F2](F2-anwendungsfaelle.md) | Jede Operation ist einem Anwendungsfall zugeordnet („Ausgelöst durch"); UC-01 wird durch S1.3, UC-02–UC-12 durch S1.4, die Kartenanteile von UC-02/UC-03/UC-10 zusätzlich durch S1.5 und das Reverse-Geocoding von UC-10 durch S1.6 erbracht. |
| [F3](F3-anwendungsfunktionen.md) | AF-01, AF-02 und AF-04 stehen hinter den drei atomaren Operationen in S1.4; AF-03 liefert den abgeleiteten Status, der in den Leseoperationen mitgelesen wird. |
| [D1](D1-datenmodell.md) | Die Operationen in S1.4 lesen und schreiben genau die Entitäten aus D1.4; `profile.user_id` stammt aus S1.3. Kartendaten und Auth-Objekte sind laut D1.7 bewusst nicht modelliert. |
| [D2](D2-datentypen.md) | `Pin` (D2.4) wird in `check_in` geprüft, `GeoCoordinate` (D2.7) entsteht durch den Kartenpin in S1.5 und wird in S1.6 aufgelöst, `QrContent` (D2.8) trägt den Deep-Link aus S1.2. |
| [B1](B1-dialogspezifikation.md) | B1 ist der Contract von NB-01; die Fehler- und Ladezustände aus B1.5.4 sind die Anzeigeseite der Fehlerbehandlung aus S1.1. |
| [N1](N1-nichtfunktionale-anforderungen.md) | N1-QA-04 begrenzt die übertragenen personenbezogenen Daten, N1-QA-05 die Behandlung von Schlüsseln, N1-QA-06 fordert die Ausfallpfade, N1-QA-09 die Meldungen ohne technische Interna, N1-QA-10 den Free-Tier-Rahmen. |
| [N2](N2-querschnittskonzepte.md) | N2 ergänzt die hier beschriebenen Operationen um die systemweiten Querschnittskonzepte: N2.2 die Zugriffsregeln, N2.3 die Antwortcodes. Der in N2.2 erwähnte, dort unbenannte Erstellungsaufruf ist die Operation `create_session` aus S1.4. |
| [ARCH](../arch/README.md) | Bindet die Operationen an Bausteine, Laufzeitabläufe und Bibliotheken. |

## S1.9 Architekturfestlegungen

Die [Architekturdokumentation](../arch/README.md) legt für das MVP fest:
Gefilterte Ergebnislisten werden ohne Pagination vollständig geladen, und
fehlgeschlagene Aufrufe werden nicht automatisch wiederholt. Eine erneute
Anfrage wird ausschließlich durch den Nutzer ausgelöst. Eine automatische
Court-Dublettenprüfung ist gemäß
[F2 UC-10](F2-anwendungsfaelle.md#uc-10--court--sportort-erfassen-oder-auswählen)
ebenfalls nicht Teil des MVP.

## S1.10 Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | GitHub Copilot, Claude Code, Codex |
| Verwendung | Ausarbeitung der Schnittstellen-Contracts je Nachbarsystem: Operationen, Ein- und Ausgaben, Semantik und Fehlerbehandlung. `create_session` nach Einführung der `organizer`-Entität in D1 um deren atomare Anlage ergänzt. |
| Prüfung | Abgeglichen mit [P1](P1-ziele-rahmenbedingungen.md), [P2](P2-architekturueberblick.md), [F1](F1-geschaeftsprozesse.md), [F2](F2-anwendungsfaelle.md), [F3](F3-anwendungsfunktionen.md), [D1](D1-datenmodell.md), [D2](D2-datentypen.md), [B1](B1-dialogspezifikation.md), [N1](N1-nichtfunktionale-anforderungen.md) und [N2](N2-querschnittskonzepte.md). Konkrete Endpunkt-URLs sind bewusst nicht aufgeführt; diese Ebene gehört in die [Architekturdokumentation](../arch/README.md). |
