# F3 — Anwendungsfunktionen

## F3.1 Zweck und Einordnung

Anwendungsfälle ([F2](F2-anwendungsfaelle.md)) sind bewusst kurz, einfach und übersichtlich. Sie beschreiben, *was* ein Nutzer erreichen will und *welche* Schritte sichtbar ablaufen. Wenn hinter einem Schritt jedoch ein fachlich komplexes Regelwerk steht, würde dessen Beschreibung den Anwendungsfall überladen und unlesbar machen.

Nach Siedersleben beschreibt man solche komplexen Regelwerke deshalb **außerhalb** des Anwendungsfalls als **Anwendungsfunktion**. Eine Anwendungsfunktion ist ein fachlicher Algorithmus aus Sicht des Anwenders (vergleichbar mit Bonitätsprüfung oder Check-in-Prioritätsregeln), nicht ein Informatik-Algorithmus. Such-, Sortier- oder Speicherverfahren gehören daher **nicht** hierher (siehe [F3.8](#f38-nicht-als-anwendungsfunktion-modelliert)).

F3 legt die fachlichen Regeln fest: *unter welchen Bedingungen* eine Aktion zulässig ist, *welches Ergebnis* sie erzeugt und *welche Invarianten* dabei gelten. Die **technische** Umsetzung (Transaktionen, Datenbank-Constraints, Scheduler, Isolationsstufen) ist nicht Teil von F3, sondern von [D2](#), N2 und den Architekturbausteinen. F3 ist damit die fachliche Referenz, gegen die Architektur, Tests und Code später geprüft werden.

**Hinweis zur Gliederung:** Für Anwendungsfunktionen gibt es nach Siedersleben bewusst keine Standardgliederung, weil sie sich stark unterscheiden. Zur Lesbarkeit und für die durchgängige Nachverfolgbarkeit im Review verwenden wir hier dennoch ein einheitliches, schlankes Schema (Zweck, Eingaben, Ergebnis, Regeln, Entscheidungstabelle, Bezüge) und ergänzen Pseudocode nur dort, wo eine Regel sonst mehrdeutig bliebe.

## F3.2 Katalog der Anwendungsfunktionen

| AF-ID | Name | Zweck (Kurz) | Genutzt von (UC) | Bezug F1 |
|---|---|---|---|---|
| **AF-01** | Beitritts- und Kapazitätsregel | Entscheidet, ob ein Beitritt zulässig ist, und hält die Kapazitätsgrenze auch bei gleichzeitigen Beitritten ein (keine Überbuchung, keine Warteliste). | UC-04 | GP-01 A9-A13 |
| **AF-02** | Check-in-Validierung | Prüft, ob ein Check-in (per QR oder PIN) gültig ist, und markiert den Teilnehmer idempotent als eingecheckt. | UC-08, UC-09 | GP-02 A12-A19 |
| **AF-03** | Session-Lifecycle / Statusübergänge | Leitet den Session-Status zeitbasiert ab (scheduled → active → completed) und erzwingt zulässige, monotone Übergänge inkl. Auto-Close. | UC-02, UC-03, UC-04, UC-08, UC-09, UC-11 | GP-01 A15, A17; GP-02 A21 |
| **AF-04** | PIN- und QR-Code-Erzeugung | Erzeugt bei Session-Erstellung ein Check-in-Geheimnis (PIN) und einen eindeutig auf die Session verweisenden QR-Inhalt. | UC-06, UC-08, UC-09 | GP-02 A8 |

Die vier Anwendungsfunktionen greifen ineinander: AF-03 definiert den Status, der sowohl AF-01 (Beitritt nur bis/während bestimmter Zustände) als auch AF-02 (Check-in nur während `active`) als Vorbedingung nutzen. AF-04 liefert das Geheimnis, das AF-02 prüft. Das Zusammenspiel ist in [F3.7](#f37-zusammenspiel-der-anwendungsfunktionen) beschrieben.

## F3.3 AF-01 — Beitritts- und Kapazitätsregel

| Abschnitt | Inhalt |
|---|---|
| Identifier | AF-01 |
| Name | Beitritts- und Kapazitätsregel |
| Zweck | Entscheidet für einen Beitrittswunsch, ob er zulässig ist, und reserviert bei Zulässigkeit genau einen Platz, ohne die Kapazität zu überschreiten — auch wenn mehrere Nutzer gleichzeitig beitreten. |
| Eingaben | Angemeldeter Nutzer (Auth-Kennung); Session mit Status, Teilnehmerlimit `max_participants` und aktueller Anzahl bestätigter Teilnehmer; vorhandene Teilnahme des Nutzers (ja/nein). |
| Ergebnis | Entweder ein neuer Participant-Eintrag mit Status `confirmed` (Beitritt erfolgreich) **oder** eine Ablehnung mit Ergebniscode; der Datenbestand bleibt bei Ablehnung unverändert. |
| Vorbedingungen | Nutzer ist angemeldet (sonst Weiterleitung zu UC-01). Session ist sichtbar. |
| Ergebniscodes | `OK`, `NOT_AUTHENTICATED`, `SESSION_NOT_JOINABLE`, `ALREADY_JOINED`, `SESSION_FULL`. |

### Regeln und Invarianten (AF-01)

1. **Anmeldepflicht:** Nur angemeldete Nutzer können beitreten.
2. **Beitrittsfähiger Status:** Ein Beitritt ist nur zulässig, solange die Session laut AF-03 im Status `scheduled` oder `active` ist. Bei `completed` oder `cancelled` ist kein Beitritt möglich.
3. **Kein Doppelbeitritt:** Ein Nutzer, der bereits einen Teilnahme-Eintrag (in beliebigem Status) für die Session besitzt, kann nicht erneut beitreten. Der Organisator zählt ab Erstellung als Teilnehmer (F1 GP-02 A7) und kann seiner eigenen Session nicht zusätzlich beitreten.
4. **Harte Kapazitätsgrenze:** Ein Beitritt ist nur zulässig, wenn die Anzahl bestätigter Teilnehmer **kleiner** als `max_participants` ist. Der Organisator belegt einen der Plätze.
5. **Keine Überbuchung, keine Warteliste (Invariante):** Zu keinem Zeitpunkt darf die Anzahl bestätigter Teilnehmer `max_participants` überschreiten. Wartelisten sind out of scope (P1 NG-10); „voll" bedeutet endgültige Ablehnung.
6. **Wer zuerst kommt (Concurrency):** Treffen mehrere Beitritte gleichzeitig auf die letzten freien Plätze, werden sie in Eingangsreihenfolge angenommen, bis die Kapazität erreicht ist; alle weiteren erhalten `SESSION_FULL`. Prüfung freier Plätze und Anlegen des Eintrags müssen **atomar** erfolgen, damit Regel 5 nie verletzt wird. Die fachliche Regel ist hier festgelegt; die technische Realisierung der Atomarität (z. B. bedingtes Insert, Transaktion, Unique-Constraint auf `(session_id, user_id)`) gehört in D2/N2.
7. **Idempotenz gegen Doppelklick:** Ein wiederholter Beitrittsversuch desselben Nutzers zur selben Session erzeugt keinen zweiten Eintrag (folgt aus Regel 3) und führt zu `ALREADY_JOINED`, nicht zu einem Fehlerzustand.

### Entscheidungstabelle (AF-01)

Reihenfolge der Auswertung von oben nach unten; die erste zutreffende Regel bestimmt das Ergebnis.

| Regel | angemeldet? | Status beitrittsfähig? (scheduled/active) | bereits beigetreten? | freie Plätze (`confirmed < max`)? | Ergebnis | Ergebniscode |
|---|---|---|---|---|---|---|
| R1 | nein | – | – | – | Weiterleitung zur Anmeldung | `NOT_AUTHENTICATED` |
| R2 | ja | nein | – | – | Ablehnung | `SESSION_NOT_JOINABLE` |
| R3 | ja | ja | ja | – | Ablehnung (kein zweiter Eintrag) | `ALREADY_JOINED` |
| R4 | ja | ja | nein | nein | Ablehnung | `SESSION_FULL` |
| R5 | ja | ja | nein | ja | Beitritt wird gespeichert (`confirmed`) | `OK` |

### Ablauf des atomaren Beitritts (Pseudocode, AF-01)

Nur der kapazitätskritische Kern ist als Pseudocode dargestellt, weil die Reihenfolge von Prüfung und Speicherung fachlich entscheidend ist.

```
funktion beitreten(nutzer, session):
    wenn nicht nutzer.angemeldet:            gib NOT_AUTHENTICATED zurück
    wenn status(session) nicht in {scheduled, active}: gib SESSION_NOT_JOINABLE zurück

    # Ab hier atomar (eine unteilbare Einheit):
    beginne_atomar:
        wenn existiert_teilnahme(nutzer, session):  brich_ab; gib ALREADY_JOINED zurück
        wenn anzahl_confirmed(session) >= session.max_participants: brich_ab; gib SESSION_FULL zurück
        lege_teilnahme_an(nutzer, session, status = confirmed)
    ende_atomar
    gib OK zurück
```

| Abschnitt | Inhalt |
|---|---|
| Bezug zu F1 | GP-01 A9-A13 (Beitritt). |
| Bezug zu Daten | Session (`max_participants`, Status), Participant (`session_id`, `user_id`, `status`); Datentypen in D1/D2. |
| Bezug zu NFR | Konsistenz bei Parallelzugriff, verständliche Ablehnungsmeldungen, Performance der Kapazitätsprüfung. |
| Offene Punkte | Konkrete technische Sperr-/Transaktionsstrategie in D2/N2; ob die aktuelle Teilnehmerzahl gezählt oder als Feld geführt wird, ist eine D2/N2-Entscheidung. |

## F3.4 AF-02 — Check-in-Validierung

| Abschnitt | Inhalt |
|---|---|
| Identifier | AF-02 |
| Name | Check-in-Validierung |
| Zweck | Prüft für einen Check-in-Versuch (per QR-Code oder PIN), ob er gültig ist, und markiert den Teilnehmer bei Gültigkeit als eingecheckt. QR und PIN sind fachlich gleichwertig. |
| Eingaben | Angemeldeter Nutzer; Session (Status, PIN); vorhandene Teilnahme des Nutzers (Status); vorgelegtes Merkmal (QR-Inhalt **oder** eingegebene PIN); aktuelle Zeit. |
| Ergebnis | Teilnahme-Status wird auf `checked_in` gesetzt und der Check-in-Zeitpunkt festgehalten **oder** Ablehnung mit Ergebniscode; bei Ablehnung bleibt der Status unverändert. |
| Vorbedingungen | Nutzer ist angemeldet und der Session beigetreten (`confirmed`). |
| Ergebniscodes | `OK`, `NOT_JOINED`, `INVALID_CREDENTIAL`, `OUTSIDE_WINDOW`, `ALREADY_CHECKED_IN`. |

### Regeln und Invarianten (AF-02)

1. **Gleichwertigkeit QR/PIN:** Beide Wege lösen sich fachlich auf dieselbe Prüfung auf. Der QR-Inhalt trägt Session-Bezug und PIN (siehe AF-04); die manuelle PIN-Eingabe erfolgt in der Check-in-Ansicht einer konkreten Session. Beide werden gegen die PIN dieser Session geprüft.
2. **Teilnahmepflicht:** Nur ein Nutzer mit bestehendem `confirmed`-Eintrag kann einchecken. Check-in ohne vorherigen Beitritt ist unzulässig (`NOT_JOINED`).
3. **Merkmalsprüfung:** Das vorgelegte Merkmal muss zur PIN der Session passen. Eine falsche PIN oder ein QR-Code einer anderen Session führt zu `INVALID_CREDENTIAL` und erzeugt keinen Check-in.
4. **Zeitfenster:** Ein Check-in ist **nur möglich, solange die Session im Status `active` ist**, d. h. im Intervall [Start, Start + Dauer] (Definition des Status siehe AF-03). Vor Start (`scheduled`) und nach Ende (`completed`) ist kein Check-in möglich (`OUTSIDE_WINDOW`).
5. **Idempotenz (Invariante):** Ein wiederholter gültiger Check-in ändert den fachlichen Endzustand nicht. Der erste erfolgreiche Check-in setzt Status und Zeitpunkt; weitere gültige Versuche lassen den ursprünglichen Zeitpunkt unverändert und melden `ALREADY_CHECKED_IN` (kein Fehlerzustand).
6. **Keine Statusrücknahme:** Ein einmal gesetzter `checked_in`-Status wird durch AF-02 nicht zurückgenommen.

### Entscheidungstabelle (AF-02)

Auswertung von oben nach unten; erste zutreffende Regel gewinnt.

| Regel | beigetreten (`confirmed`)? | Merkmal gültig? | im Fenster (`active`)? | bereits eingecheckt? | Ergebnis | Ergebniscode |
|---|---|---|---|---|---|---|
| R1 | nein | – | – | – | Ablehnung | `NOT_JOINED` |
| R2 | ja | nein | – | – | Ablehnung | `INVALID_CREDENTIAL` |
| R3 | ja | ja | nein | – | Ablehnung | `OUTSIDE_WINDOW` |
| R4 | ja | ja | ja | ja | keine Änderung, Bestätigung | `ALREADY_CHECKED_IN` |
| R5 | ja | ja | ja | nein | Status → `checked_in`, Zeitpunkt setzen | `OK` |

| Abschnitt | Inhalt |
|---|---|
| Bezug zu F1 | GP-02 A12-A17 (QR-Check-in), A18-A19 (PIN-Fallback). |
| Bezug zu Daten | Session (Status, PIN), Participant (Status, Check-in-Zeitpunkt); Datentypen in D1/D2. |
| Bezug zu NFR | Schnelle mobile Bedienung, Schutz gegen falsche Session-Zuordnung, verständliche Fehlertexte. |
| Offene Punkte | Ob das Zeitfenster serverseitig strikt oder mit kleiner Toleranz (Uhrdifferenz Client/Server) geprüft wird, ist in N1/N2 zu präzisieren; fachlich gilt exakt `active`. |

## F3.5 AF-03 — Session-Lifecycle / Statusübergänge

| Abschnitt | Inhalt |
|---|---|
| Identifier | AF-03 |
| Name | Session-Lifecycle / Statusübergänge |
| Zweck | Bestimmt den fachlichen Status einer Session zeitbasiert und legt fest, welche Statusübergänge zulässig sind. Der Status steuert, welche Aktionen (Beitritt, Check-in, Historie) erlaubt sind. |
| Eingaben | Session mit geplantem Start, Dauer und einem Storniert-Kennzeichen; aktuelle Zeit. |
| Ergebnis | Ein eindeutiger Status: `scheduled`, `active`, `completed` oder `cancelled`. |
| Statuswerte | `scheduled` (angelegt, vor Start), `active` (laufend), `completed` (beendet, read-only), `cancelled` (abgesagt — im MVP definiert, aber nicht nutzerauslösbar; reserviert). |

### Regeln und Invarianten (AF-03)

1. **Zeitbasierte Ableitung:** Solange die Session nicht storniert ist, ergibt sich ihr Status allein aus der aktuellen Zeit im Verhältnis zu Start und Ende (Ende = Start + Dauer). Es ist kein manueller Statuswechsel durch den Organisator vorgesehen (F1 schließt Session-Bearbeitung nach Erstellung aus).
2. **Auto-Close:** Der Übergang `active` → `completed` erfolgt automatisch, sobald die Zeit Start + Dauer erreicht ist (F1 GP-01 A17, GP-02 A21). Es ist keine Aktion eines Nutzers nötig.
3. **Monotonie (Invariante):** Der Status bewegt sich ausschließlich vorwärts (`scheduled` → `active` → `completed`). Ein Rücksprung ist unzulässig; eine abgeschlossene Session wird nie wieder aktiv.
4. **Stornierung reserviert:** `cancelled` ist als Status definiert (P1 nennt „storniert" im Lifecycle), im MVP jedoch nicht durch eine Nutzeraktion auslösbar, da F1 keine nachträgliche Session-Änderung modelliert. Der Wert bleibt für spätere Ausbaustufen reserviert.
5. **Statusgesteuerte Aktionen:** Der abgeleitete Status bestimmt die zulässigen Aktionen anderer Anwendungsfunktionen und Use Cases (siehe Tabelle unten).

### Ableitungstabelle Status (AF-03)

Gilt, wenn die Session nicht storniert ist (`cancelled` = false):

| Bedingung (mit `Ende = Start + Dauer`) | Status |
|---|---|
| jetzt < Start | `scheduled` |
| Start ≤ jetzt < Ende | `active` |
| jetzt ≥ Ende | `completed` |

### Zulässige Übergänge und erlaubte Aktionen (AF-03)

| Von → Nach | Auslöser | Zulässig? | Im Zielzustand erlaubte Aktionen |
|---|---|---|---|
| scheduled → active | Zeit erreicht Start | ja (automatisch) | Beitritt (AF-01), Check-in (AF-02) |
| active → completed | Zeit erreicht Ende | ja (automatisch, Auto-Close) | nur Historie/Ansicht (UC-11), keine Änderungen |
| scheduled → completed | — | nein | — |
| completed → * | — | nein (Endzustand) | — |
| scheduled → cancelled | (reserviert) | nicht im MVP auslösbar | — |

Ableitung erlaubter Aktionen je Status:

| Status | Beitritt (AF-01) | Check-in (AF-02) | in Suche sichtbar (UC-02) | Ansicht |
|---|---|---|---|---|
| scheduled | ja | nein (außerhalb Fenster) | ja | ja |
| active | ja | ja | ja | ja |
| completed | nein | nein | nein (nur Historie UC-11) | ja (read-only) |
| cancelled | nein | nein | nein | ja (read-only) |

| Abschnitt | Inhalt |
|---|---|
| Bezug zu F1 | GP-01 A15 (aktiv), A17 (Auto-Close); GP-02 A21 (Auto-Close). |
| Bezug zu Daten | Session (Start, Dauer, Status/Storniert-Kennzeichen); Datentypen in D1/D2. |
| Bezug zu NFR | Verlässliche Zeitbasis, Konsistenz zwischen angezeigtem und tatsächlichem Status. |
| Offene Punkte | Ob der Status als abgeleiteter Wert bei jeder Abfrage berechnet oder durch einen zeitgesteuerten Mechanismus persistiert wird (Scheduler vs. berechnete Sicht), ist eine Umsetzungsfrage für N2/Architektur. |

## F3.6 AF-04 — PIN- und QR-Code-Erzeugung

| Abschnitt | Inhalt |
|---|---|
| Identifier | AF-04 |
| Name | PIN- und QR-Code-Erzeugung |
| Zweck | Erzeugt bei der Session-Erstellung ein Check-in-Geheimnis (PIN) und einen QR-Inhalt, der eindeutig auf die Session verweist, damit AF-02 Check-ins zuordnen und prüfen kann. |
| Eingaben | Neu erstellte Session (Kennung). |
| Ergebnis | Eine der Session zugeordnete PIN und ein QR-Inhalt, der Session-Bezug und PIN kodiert. |
| Zeitpunkt | Einmalig bei Session-Erstellung (UC-06, F1 GP-02 A8). |

### Regeln und Invarianten (AF-04)

1. **PIN-Format:** Die PIN ist 4-stellig und numerisch (F1-Annahme). Sie wird bei Erstellung zufällig erzeugt.
2. **Eindeutigkeit im Prüfkontext:** Die PIN muss **je Session** eindeutig zuordenbar sein, nicht global. Eine globale Eindeutigkeit ist nicht erforderlich, weil die PIN immer im Kontext einer konkreten Session geprüft wird: Der QR-Inhalt trägt die Session-Kennung, und die manuelle PIN-Eingabe (UC-09) erfolgt in der Check-in-Ansicht einer bestimmten Session. Ein PIN-Zusammenfall zwischen verschiedenen Sessions ist damit fachlich unkritisch.
3. **QR-Inhalt:** Der QR-Code kodiert einen Verweis auf die Check-in-Ansicht der Session inklusive Session-Kennung und PIN (F1 GP-02 A13-A14, konzeptionell `…/check-in?session=<id>&pin=<pin>`). Er enthält dieselbe PIN, die AF-02 prüft — QR und PIN sind daher fachlich gleichwertig.
4. **Stabilität:** PIN und QR-Inhalt bleiben über die Lebensdauer der Session unverändert. Eine Neuerzeugung ist im MVP nicht vorgesehen (keine Session-Bearbeitung nach Erstellung, F1).
5. **Sicherheitsniveau (bewusst):** Eine 4-stellige PIN hat geringe Entropie (10 000 Möglichkeiten) und ist kein starkes Geheimnis. Das ist akzeptabel, weil ein Check-in zusätzlich Anmeldung und vorherigen Beitritt voraussetzt (AF-02) und die fachliche Auswirkung eines falschen Check-ins gering ist (reine Anwesenheitsmarkierung, keine Zahlung, kein Zugang). Eine höhere Sicherheitsstufe ist in N1 zu bewerten, falls nötig.

### Eigenschaften der erzeugten Merkmale (AF-04)

| Merkmal | Format | Erzeugung | Eindeutigkeit | Prüfung durch |
|---|---|---|---|---|
| PIN | 4-stellig numerisch | zufällig bei Erstellung | je Session (nicht global) | AF-02 (UC-09) |
| QR-Inhalt | Verweis mit Session-Kennung + PIN | abgeleitet aus Session-Kennung + PIN | über Session-Kennung eindeutig | AF-02 (UC-08) |

| Abschnitt | Inhalt |
|---|---|
| Bezug zu F1 | GP-02 A8 (Erzeugung von QR-Code und PIN). |
| Bezug zu Daten | Session (PIN, optional QR-Inhalt); Datentypen in D1/D2. |
| Bezug zu NFR | Angemessenes Sicherheitsniveau (N1), einfache mobile Nutzung des QR-Wegs. |
| Offene Punkte | Konkrete Kodierung des QR-Inhalts (URL-Format, Ablage des QR-Bilds) ist in S1/N2 zu präzisieren; ob die PIN gehasht gespeichert wird, ist eine N2-/Sicherheitsentscheidung. |

## F3.7 Zusammenspiel der Anwendungsfunktionen

Die vier Anwendungsfunktionen sind nicht unabhängig, sondern bauen aufeinander auf. Die folgende Übersicht zeigt die fachlichen Abhängigkeiten:

| Anwendungsfunktion | nutzt … | … liefert |
|---|---|---|
| AF-01 Beitritt | AF-03 (Status `scheduled`/`active` als Vorbedingung) | bestätigte Teilnahme als Vorbedingung für AF-02 |
| AF-02 Check-in | AF-03 (Status `active` als Zeitfenster), AF-04 (PIN als Prüfmerkmal), AF-01 (Teilnahme muss bestehen) | eingecheckte Anwesenheit |
| AF-03 Lifecycle | — (nur Zeit + Session-Daten) | Status als Steuergröße für AF-01 und AF-02 |
| AF-04 PIN/QR | — (nur Session-Kennung) | Prüfmerkmal für AF-02 |

Typische fachliche Kette einer organisierten Session:

1. Organisator erstellt Session (UC-06) → **AF-04** erzeugt PIN und QR-Inhalt; **AF-03** setzt Status `scheduled`.
2. Teilnehmer treten bei (UC-04) → **AF-01** prüft Zulässigkeit und Kapazität, solange **AF-03** `scheduled`/`active` liefert.
3. Zum Start wechselt der Status via **AF-03** auf `active` → Check-in-Fenster öffnet.
4. Teilnehmer checken ein (UC-08/UC-09) → **AF-02** prüft Teilnahme (aus AF-01), Merkmal (aus AF-04) und Fenster (aus AF-03).
5. Zum Ende schließt **AF-03** die Session automatisch (`completed`) → Beitritt und Check-in sind gesperrt, nur noch Historie (UC-11).

## F3.8 Nicht als Anwendungsfunktion modelliert

| Thema | Begründung |
|---|---|
| Session-Suche / Filterung / Sortierung | Suchen und Sortieren sind Informatik-Algorithmen und gehören nach Siedersleben ausdrücklich **nicht** in F3. Die fachliche Sicht (was gesucht/gefiltert wird) steht in UC-02; die technische Umsetzung in der Architektur. |
| Ranking / Empfehlung von Sessions | Kein fachliches Regelwerk im MVP; KI/Empfehlungen sind out of scope (P1 NG-08). Sessions werden ungewichtet nach Filterkriterien angezeigt. |
| Kartendarstellung / Geokodierung | Technische Funktion der Nachbarsysteme (OpenStreetMap/Leaflet), kein fachlicher Anwender-Algorithmus. Gehört zu S1/Architektur. |
| Authentifizierung | Wird durch Supabase Auth erbracht (Nachbarsystem, S1). Fachlich nur als Vorbedingung in AF-01/AF-02 referenziert, kein eigenes Regelwerk in F3. |
| Datenvalidierung von Formularen | Feldvalidierung (Pflichtfelder, Zeit in der Zukunft, gültiges Limit) ist Teil der Use Cases (UC-06) und der Datentypen (D2), kein komplexes fachliches Regelwerk. |
| Warteliste | Out of scope (P1 NG-10); AF-01 modelliert bewusst keine Warteliste. |

## F3.9 Konsistenz und Cross-References

| Baustein | Relevanz für F3 |
|---|---|
| [P1](P1-ziele-rahmenbedingungen.md) | Kapazität als harte Grenze und Ausschluss der Warteliste (NG-10) sind Grundlage von AF-01. Status-Lifecycle (geplant/aktiv/abgeschlossen/storniert) ist Grundlage von AF-03. |
| [F1](F1-geschaeftsprozesse.md) | Liefert die Aktivitäten, aus denen die Regeln stammen: Beitritt (GP-01 A9-A13), Check-in (GP-02 A12-A19), Auto-Close (GP-01 A17, GP-02 A21), PIN/QR (GP-02 A8). |
| [F2](F2-anwendungsfaelle.md) | AF-01 präzisiert UC-04, AF-02 präzisiert UC-08/UC-09, AF-03 stützt UC-02/UC-03/UC-11, AF-04 stützt UC-06. Die in F2 offen gelassenen Punkte (Concurrency, Check-in-Fenster, PIN-Regel) werden hier geschlossen. |
| [S1](S1-nachbarsysteme.md) | Nachbarsysteme (Supabase Auth, PostgREST/PostgreSQL, OpenStreetMap) erbringen die Vorbedingungen und die technische Ausführung; F3 beschreibt nur die fachlichen Regeln. |
| D1 / D2 | Die fachlichen Objekte (Session, Participant, Court, Profile) und ihre Datentypen; F3 nennt Felder wie `status`, `max_participants`, `checked_in_at`, `pin`, die in D1/D2 formal definiert werden. |
| N1 / N2 | Nichtfunktionale Bewertung (Sicherheitsniveau der PIN, Konsistenz bei Parallelzugriff) und technische Umsetzung der Atomarität, des Zeitfensters und des Auto-Close. |
| E2 | Glossar: einheitliche Begriffe (Session, Teilnahme/Participant, Check-in, Status). |

## F3.10 Offene Punkte

| Punkt | Beschreibung | Zuständiger Baustein |
|---|---|---|
| Atomarität des Beitritts | Konkrete technische Strategie gegen Überbuchung (Transaktion, bedingtes Insert, Constraint). | D2 / N2 |
| Zählung der Teilnehmerzahl | Berechnet (COUNT) oder als geführtes Feld; beeinflusst AF-01. | D2 / N2 |
| Statuspersistenz | Abgeleiteter Wert bei Abfrage vs. zeitgesteuerte Persistierung (Scheduler). | N2 / Architektur |
| Zeittoleranz beim Check-in | Umgang mit Uhrdifferenzen Client/Server am Fensterrand. | N1 / N2 |
| PIN-Speicherung | Klartext vs. gehasht; QR-Inhaltsformat. | N2 / S1 |

## F3.11 Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | Claude Code |
| Verwendung | Entwurf des F3-Bausteins, Identifikation der Anwendungsfunktionen aus den offenen Punkten von F2, Formulierung der Regeln, Entscheidungstabellen und Pseudocode-Kerne. |
| Prüfung | Inhalte wurden gegen [P1](P1-ziele-rahmenbedingungen.md), [F1](F1-geschaeftsprozesse.md), [F2](F2-anwendungsfaelle.md) und die Herold-Referenz geprüft und manuell abgestimmt; der Warteliste-Scope-Konflikt wurde in P1 (NG-10) aufgelöst und in F2 nachgezogen. |
