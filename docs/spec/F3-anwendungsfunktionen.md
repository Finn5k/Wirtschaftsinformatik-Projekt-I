# F3 — Anwendungsfunktionen

F3 enthält fachliche Berechnungs-, Prüf- und Entscheidungslogik, die für eine Beschreibung innerhalb eines Anwendungsfalls ([F2](F2-anwendungsfaelle.md)) zu umfangreich wäre. Eine Anwendungsfunktion ist ein fachlicher Algorithmus aus Sicht des Anwenders, kein Informatik-Algorithmus — Suchen, Sortieren und Speichern gehören daher nicht hierher (siehe [F3.3](#f33-nicht-teil-von-f3)); die technische Umsetzung ist Sache von [N2](N2-querschnittskonzepte.md).

**Begriffsklärung:** Eine `Session` ist bei LocalCourt ein geplanter Sporttermin (siehe [E2](E2-glossar.md#e23-alphabetisches-glossar)), **keine** technische Anmelde- oder Authentifizierungssitzung — Letztere wird, wo nötig, als „Anmeldesitzung" beziehungsweise „Auth-Session" bezeichnet.

## F3.1 Katalog der Anwendungsfunktionen

| AF-ID | Funktion | Fachliche Berechnung/Entscheidung | Genutzte Use Cases |
|---|---|---|---|
| **AF-01** | Beitritts- und Kapazitätsregel | Freie Plätze ermitteln und Beitritt anhand Status, Kapazität und Doppelbeitritt entscheiden. | UC-04 |
| **AF-02** | Check-in-Validierung | Check-in anhand Teilnahme, Merkmal, Zeitfenster und vorhandenem Check-in entscheiden. | UC-08, UC-09 |
| **AF-03** | Status einer Sport-Session | Status zeitbasiert aus Start, Dauer und aktueller Zeit ableiten. | UC-02, UC-03, UC-04, UC-08, UC-09, UC-11 |
| **AF-04** | PIN- und QR-Code-Erzeugung | PIN zufällig erzeugen, QR-Inhalt aus Session-Kennung und PIN ableiten. | UC-06, UC-08, UC-09 |

## F3.2 Beschreibung der Anwendungsfunktionen

### AF-01 — Beitritts- und Kapazitätsregel

| Abschnitt | Inhalt |
|---|---|
| Zweck | Entscheidet für einen Beitrittswunsch, ob er zulässig ist, und reserviert bei Zulässigkeit genau einen Platz, ohne die Kapazität zu überschreiten. |
| Eingaben | Angemeldeter Nutzer; Session mit Status und Teilnehmerlimit `max_participants`; Anzahl bestätigter Teilnahmen (`confirmed_count`); vorhandene Teilnahme des Nutzers. |
| Ergebnis | Neuer Participant-Eintrag mit Status `confirmed` **oder** Ablehnung mit Ergebniscode; bei Ablehnung bleibt der Datenbestand unverändert. |
| Ergebniscodes | `OK`, `NOT_AUTHENTICATED`, `SESSION_NOT_JOINABLE`, `ALREADY_JOINED`, `SESSION_FULL` |
| Zusicherungen | **Kapazitätsinvariante:** `confirmed_count` überschreitet `max_participants` nie; keine Warteliste (P1 NG-10), der Organisator zählt ab Erstellung als Teilnehmer (F1 GP-01 A2). **Atomarität statt Reihenfolgegarantie:** Prüfung und Anlage sind unteilbar (technisch: [N2](N2-querschnittskonzepte.md)); eine bestimmte Eingangsreihenfolge wird nicht zugesichert, garantiert ist nur die Kapazitätsinvariante. |
| Bezug | [F1](F1-geschaeftsprozesse.md) GP-01 A4; [UC-04](F2-anwendungsfaelle.md#uc-04--session-beitreten); Daten `session`, `participant` ([D1](D1-datenmodell.md)). |

#### Algorithmus (AF-01)

Die Prüfungen laufen in dieser Reihenfolge; die erste zutreffende Bedingung bestimmt das Ergebnis und bricht ab.

```text
beitreten(nutzer, session):
    wenn nutzer nicht angemeldet                 -> NOT_AUTHENTICATED
    wenn status(session) = completed             -> SESSION_NOT_JOINABLE
    wenn teilnahme(nutzer, session) vorhanden    -> ALREADY_JOINED

    freie_plaetze := session.max_participants - confirmed_count(session)
    wenn freie_plaetze <= 0                      -> SESSION_FULL

    lege teilnahme an mit status = confirmed
                                                 -> OK
```

### AF-02 — Check-in-Validierung

| Abschnitt | Inhalt |
|---|---|
| Zweck | Prüft für einen Check-in-Versuch (QR-Code oder PIN), ob er gültig ist, und markiert den Teilnehmer bei Gültigkeit als eingecheckt. |
| Eingaben | Angemeldeter Nutzer; Session (Status, PIN); vorhandene Teilnahme (Status); vorgelegtes Merkmal (QR-Inhalt oder PIN); aktuelle Zeit. |
| Ergebnis | Teilnahme-Status wird auf `checked_in` gesetzt und der Zeitpunkt festgehalten **oder** Ablehnung mit Ergebniscode; bei Ablehnung bleibt der Status unverändert. |
| Ergebniscodes | `OK`, `NOT_JOINED`, `INVALID_CREDENTIAL`, `OUTSIDE_WINDOW`, `ALREADY_CHECKED_IN` |
| Zusicherungen | **Keine Statusrücknahme:** ein gesetzter `checked_in`-Status wird nicht zurückgenommen, der einmal festgehaltene Zeitpunkt nicht überschrieben. **Kein Toleranzfenster:** maßgeblich ist ausschließlich der Status `active` (AF-03). |
| Bezug | [F1](F1-geschaeftsprozesse.md) GP-01 A6; [UC-08](F2-anwendungsfaelle.md#uc-08--check-in-per-qr-code-durchführen), [UC-09](F2-anwendungsfaelle.md#uc-09--check-in-per-pin-durchführen); Daten `session`, `participant` ([D1](D1-datenmodell.md)). |

#### Algorithmus (AF-02)

```text
einchecken(nutzer, session, merkmal, jetzt):
    teilnahme := teilnahme(nutzer, session)
    wenn teilnahme fehlt                         -> NOT_JOINED
    wenn merkmal != session.pin                  -> INVALID_CREDENTIAL
    wenn status(session, jetzt) != active        -> OUTSIDE_WINDOW
    wenn teilnahme.status = checked_in           -> ALREADY_CHECKED_IN

    teilnahme.status := checked_in
    teilnahme.checked_in_at := jetzt
                                                 -> OK
```

Der QR-Weg liefert dasselbe Merkmal wie die manuelle Eingabe (AF-04); beide Wege durchlaufen denselben Algorithmus.

### AF-03 — Status einer Sport-Session

![Zustandsdiagramm AF-03: Status einer Sport-Session](diagrams-png/F3-af03-session-lifecycle.png)

PlantUML-Quelle: [`diagrams/F3-af03-session-lifecycle.puml`](diagrams/F3-af03-session-lifecycle.puml)

Der Status einer Session (`scheduled`, `active`, `completed`) wird bei jeder Abfrage aus Startzeitpunkt, Dauer und aktueller Zeit abgeleitet — nicht separat gespeichert und nicht manuell gesetzt. Es gibt keinen Rücksprung und keinen Statuswechsel durch den Organisator; Bearbeiten, Absagen und Löschen sind gemäß P1 NG-11 nicht Teil des MVP.

```text
status(session, jetzt):
    ende := session.start_at + session.duration_min
    wenn jetzt <  session.start_at   -> scheduled
    wenn jetzt <  ende               -> active
    sonst                            -> completed
```

Bezug: [F1](F1-geschaeftsprozesse.md) GP-01 A2, A6, A8; [UC-02](F2-anwendungsfaelle.md#uc-02--session-suchen), UC-03, UC-04, UC-08, UC-09, UC-11; Daten `session` ([D1](D1-datenmodell.md)).

### AF-04 — PIN- und QR-Code-Erzeugung

Erzeugt bei der Session-Erstellung eine vierstellige, numerische PIN sowie einen QR-Inhalt, der Session-Kennung und PIN kodiert, damit AF-02 Check-ins prüfen kann. PIN und QR-Inhalt entstehen einmalig bei der Erstellung, bleiben über die Lebensdauer der Session unverändert und sind nur je Session (nicht global) eindeutig. Format, Erzeugung, Stabilität und das bewusst niedrige Sicherheitsniveau der PIN sind abschließend in [D2.4 `Pin`](D2-datentypen.md#d24-pin) und [D2.8 `QrContent`](D2-datentypen.md#d28-qrcontent) festgelegt; F3 nennt AF-04 nur, weil AF-02 auf ihrem Ergebnis aufbaut.

Bezug: [F1](F1-geschaeftsprozesse.md) GP-01 A2; [UC-06](F2-anwendungsfaelle.md#uc-06--session-erstellen).

## F3.3 Nicht Teil von F3

| Thema | Begründung |
|---|---|
| Session-Suche, Filterung, Sortierung | Informatik-Algorithmen gehören nach Siedersleben nicht in F3; die fachliche Sicht steht in [UC-02](F2-anwendungsfaelle.md#uc-02--session-suchen). |
| Formularvalidierung | Teil der Use Cases ([F2](F2-anwendungsfaelle.md)) und der Datentypen ([D2](D2-datentypen.md)), kein eigenständiges fachliches Regelwerk. |
| Authentifizierung | Wird durch Supabase Auth erbracht ([S1](S1-nachbarsysteme.md)); in AF-01/AF-02 nur als Vorbedingung referenziert. |
| Warteliste | Out of scope ([P1](P1-ziele-rahmenbedingungen.md) NG-10); AF-01 modelliert bewusst keine Warteliste. |
| Persistenz, Zugriffsregeln, Transaktionen | Technische Umsetzung, Sache von [N2](N2-querschnittskonzepte.md). |

## F3.4 Querverweise

| Baustein | Relevanz für F3 |
|---|---|
| [F1](F1-geschaeftsprozesse.md) | Liefert die fachliche Herkunft: GP-01 A4 (AF-01), A6 (AF-02), A2/A6/A8 (AF-03), A2 (AF-04). |
| [F2](F2-anwendungsfaelle.md) | UC-04, UC-08, UC-09 nutzen AF-01/AF-02 unmittelbar; UC-02, UC-03, UC-06, UC-11 setzen AF-03 beziehungsweise AF-04 voraus. |
| [D1](D1-datenmodell.md) / [D2](D2-datentypen.md) | Binden die in F3 genannten Felder (`max_participants`, `status`, `pin`, `checked_in_at`) an Entitäten und Datentypen; D2.4/D2.8 sind für AF-04 maßgeblich. |
