# N2 — Querschnittskonzepte und technische Umsetzung

## N2.1 Zweck und Einordnung

Dieser Baustein schließt die technischen Fragen, die in [D1](D1-datenmodell.md), [D2](D2-datentypen.md) und [F3](F3-anwendungsfunktionen.md) bewusst offengelassen wurden, weil sie dort als „N2-Entscheidung" markiert sind. Während D1/D2 das fachliche Datenmodell und F3 die fachlichen Regeln definieren, legt N2 fest, **wie** diese Regeln auf dem konkreten Technologie-Stack ([P1](P1-ziele-rahmenbedingungen.md) CON-T-01–CON-T-03, [P2](P2-architekturueberblick.md)) umgesetzt werden: Datenbank-Schema, Schlüssel, Constraints, Atomarität, Statusableitung, Geheimnis-Erzeugung und -Speicherung sowie Fehler-Mapping.

N2 ist ein **Querschnittsbaustein**: Er betrifft nicht einen einzelnen Anwendungsfall oder eine einzelne Entität, sondern technische Konzepte, die über das gesamte System hinweg gelten (Concurrency, Sicherheit, Fehlerbehandlung, Betrieb). Nach Siedersleben gehört die *fachliche* Entscheidung (ob eine Regel gilt) in P1/F3/D1/D2; die *technische* Umsetzung dieser Regel gehört hierher.

**Abgrenzung:** N2 trifft keine neuen fachlichen Festlegungen und erweitert das MVP nicht. Jede hier getroffene Entscheidung muss eine bereits in P1/P2/F1–F3/D1/D2/B1 beschriebene fachliche Anforderung technisch erfüllen — nicht mehr und nicht weniger. Wo eine technische Entscheidung eine nichtfunktionale Bewertung voraussetzt, die noch nicht vorliegt (N1 ist laut [README](README.md) noch ausstehend), wird dies als offener Punkt markiert statt spekulativ vorwegzunehmen.

Die Benennung von Tabellen, Spalten und Funktionen folgt **englischem `snake_case`**, konsistent mit D1/D2/F3 und den Datenflüssen in P2.

## N2.2 Technische Typzuordnung

Zuordnung der fachlichen Datentypen aus [D2](D2-datentypen.md) zu PostgreSQL-Spaltentypen (Supabase, [P1](P1-ziele-rahmenbedingungen.md) CON-T-01). Diese Tabelle löst den in D2.1 explizit an N2 verwiesenen Punkt.

| Fachlicher Typ (D2) | PostgreSQL-Typ | Anmerkung |
|---|---|---|
| `Identifier` ([D2.2](D2-datentypen.md#d22-identifier)) | `uuid`, Default `gen_random_uuid()` | Siehe [N2.9](#n29-identifier-strategie). `profile.user_id` erhält **keinen** Default, sondern übernimmt die Auth-Kennung aus Supabase Auth (NB-02, D1.4). |
| `Text` | `text` | Ohne feste `varchar`-Längenbegrenzung im Schema; fachliche Obergrenzen (falls N1 sie festlegt) werden als `CHECK`-Constraint ergänzt, sobald N1 vorliegt (siehe [N2.15](#n215-offene-punkte)). |
| `Integer` | `integer` | Für `max_participants`. |
| `Boolean` | `boolean` | Aktuell nur intern für das reservierte `cancelled`-Kennzeichen relevant (siehe [N2.6](#n26-statuspersistenz-af-03)). |
| `Timestamp` | `timestamptz` | UTC-normalisiert (D2.1), konsistent mit AF-03-Zeitvergleichen. |
| `Url` | `text` | Keine eigene Datenbank-Validierung der URL-Syntax im MVP; Prüfung liegt beim Frontend (B1). |
| `SessionStatus` ([D2.3](D2-datentypen.md#d23-sessionstatus)) | *kein gespeichertes Feld* | Abgeleiteter Wert, siehe [N2.6](#n26-statuspersistenz-af-03). |
| `Pin` ([D2.4](D2-datentypen.md#d24-pin)) | `char(4)` | Nur Ziffern; Erzwingung über `CHECK (pin ~ '^[0-9]{4}$')`. Speicherform (Klartext) siehe [N2.7](#n27-pin-erzeugung-und-speicherung-af-04). |
| `ParticipantStatus` ([D2.5](D2-datentypen.md#d25-participantstatus)) | `text` mit `CHECK (status IN ('confirmed','checked_in'))` | Kein natives PostgreSQL-`enum` (einfachere Erweiterbarkeit ohne `ALTER TYPE`); fachlich gleichwertig zur Enum-Definition in D2.5. |
| `Duration` ([D2.6](D2-datentypen.md#d26-duration)) | `integer` | Minuten, `CHECK (duration_min >= 1)`. |
| `GeoCoordinate` ([D2.7](D2-datentypen.md#d27-geocoordinate)) | `double precision` | Für `latitude`/`longitude`; `CHECK`-Constraints für die Wertebereiche (±90/±180) sowie eine kombinierte Prüfung, dass beide Felder gemeinsam gesetzt oder gemeinsam leer sind (D1.4-Invariante). |
| `QrContent` ([D2.8](D2-datentypen.md#d28-qrcontent)) | *kein gespeichertes Feld* | Wird aus `session_id` + `pin` zur Laufzeit gebildet, siehe [N2.8](#n28-qr-inhalt-af-04). |

## N2.3 Schlüssel, Constraints und Indizes

Technische Realisierung der Entitäten aus [D1.4](D1-datenmodell.md#d14-entitätstypen) und ihrer Beziehungen ([D1.5](D1-datenmodell.md#d15-beziehungen)).

| Entität | Primärschlüssel | Fremdschlüssel | Zusätzliche Constraints |
|---|---|---|---|
| `profile` | `user_id` (`uuid`, referenziert Supabase-Auth-Nutzer, kein eigener Default) | — | `display_name` `NOT NULL`. |
| `sport` | `sport_id` (`uuid`) | — | `key` `UNIQUE, NOT NULL` (Referenzdaten-Katalog, D1.3). |
| `court` | `court_id` (`uuid`) | `created_by → profile.user_id` (nullable, `ON DELETE SET NULL`) | Kombiniertes `CHECK`: `(latitude IS NULL) = (longitude IS NULL)` (D2.7-Invariante). |
| `session` | `session_id` (`uuid`) | `organizer_id → profile.user_id`, `sport_id → sport.sport_id`, `court_id → court.court_id` (alle `NOT NULL`, `ON DELETE RESTRICT`) | `CHECK (duration_min >= 1)`, `CHECK (pin ~ '^[0-9]{4}$')`, `CHECK (max_participants >= 1)`. `ON DELETE RESTRICT` verhindert das Löschen referenzierter Sportarten/Courts/Profile, solange Sessions bestehen — im MVP gibt es ohnehin keine Lösch-Funktion für diese Entitäten (F1–F3 kennen keine entsprechenden Anwendungsfälle). |
| `participant` | `participant_id` (`uuid`) | `session_id → session.session_id`, `user_id → profile.user_id` (beide `NOT NULL`, `ON DELETE CASCADE` auf `session_id`) | `UNIQUE (session_id, user_id)` — technische Umsetzung der D1.4-Invariante „höchstens eine Teilnahme je (session_id, user_id)" und Grundlage der Atomarität in [N2.4](#n24-atomarität-des-beitritts-af-01). `CHECK ((status = 'checked_in') = (checked_in_at IS NOT NULL))` setzt die Check-in-Kopplung aus D1.4 technisch um. |
| `sport_preference` | zusammengesetzt: `PRIMARY KEY (user_id, sport_id)` | `user_id → profile.user_id`, `sport_id → sport.sport_id` (`ON DELETE CASCADE`) | Kein eigener `Identifier` nötig, da D1.4 die Identität bereits über `(user_id, sport_id)` definiert. |

**Zu `participant_id` vs. zusammengesetzter Schlüssel (D1.9 offener Punkt):** Es wird ein eigener `participant_id` (`uuid`) als Primärschlüssel verwendet, zusätzlich zum `UNIQUE (session_id, user_id)`-Constraint. Begründung: PostgREST (NB-03) adressiert Ressourcen einfacher über einen einzelnen Identifier (`PATCH /participants/<id>`, wie in [P2.5 Szenario 3](P2-architekturueberblick.md#p25-kritische-datenflüsse) dargestellt), während die fachliche Eindeutigkeit weiterhin über den `UNIQUE`-Constraint erzwungen wird.

### Indizes

Indizes dienen ausschließlich der Unterstützung der in [F1](F1-geschaeftsprozesse.md)/[F2](F2-anwendungsfaelle.md) beschriebenen Zugriffsmuster (Suche, Beitritt, Check-in) und führen keine neue Funktionalität ein:

| Index | Zweck |
|---|---|
| `session (court_id, sport_id, start_at)` | Unterstützt die Such-/Filterabfrage aus UC-02 (Ort, Sportart, zukünftige Sessions). |
| `participant (session_id)` | Unterstützt die Zählung `confirmed_count` ([N2.5](#n25-zählstrategie-confirmed_count)) und die Teilnehmerlisten-Abfrage (UC-03, UC-07). |
| `participant (user_id)` | Unterstützt „Meine Sessions" (UC-05, UC-11). |
| `court (city)` | Unterstützt die Ortssuche, wenn keine Koordinaten vorliegen (Graceful Degradation, D2.7). |

Die konkrete Indexwahl ist eine Performance-Optimierung ohne fachliche Auswirkung und kann im Betrieb angepasst werden, sobald Nutzungsdaten vorliegen (vgl. SC-04, P1.6).

## N2.4 Atomarität des Beitritts (AF-01)

Löst den in [F3 AF-01 Regel 6](F3-anwendungsfunktionen.md#f33-af-01--beitritts--und-kapazitätsregel) und [D1.9](D1-datenmodell.md#d19-offene-punkte) offengelassenen Punkt.

**Entscheidung:** Prüfung freier Plätze und Anlegen der Teilnahme erfolgen in **einer einzigen atomaren PostgreSQL-Funktion** (`SECURITY DEFINER`), die über PostgREST als RPC-Endpoint (`POST /rest/v1/rpc/join_session`) aufgerufen wird, anstatt über ein direktes `INSERT` auf `/rest/v1/participants`. Die Funktion bildet den Pseudocode aus F3.3 exakt ab:

```
Funktion join_session(p_session_id, p_user_id):
  innerhalb einer Transaktion (Isolationsstufe: Standard READ COMMITTED
  reicht, da die Kapazitätsprüfung durch Row-Locking auf die Session-Zeile
  serialisiert wird):
    session_zeile sperren (SELECT ... FOR UPDATE auf session_id)
    wenn status(session) nicht in {scheduled, active}: gib SESSION_NOT_JOINABLE zurück
    wenn existiert (session_id, user_id) in participant: gib ALREADY_JOINED zurück
    wenn COUNT(participant WHERE session_id AND status IN (confirmed, checked_in))
         >= session.max_participants: gib SESSION_FULL zurück
    INSERT INTO participant (session_id, user_id, status='confirmed', joined_at=now())
    gib OK zurück
```

Das `SELECT ... FOR UPDATE` auf die Session-Zeile serialisiert konkurrierende Beitritte zur selben Session (Regel 6, „wer zuerst kommt"), ohne die `UNIQUE (session_id, user_id)`-Constraint zu ersetzen — diese bleibt als zweite Sicherung gegen Regel 3 (kein Doppelbeitritt) bestehen, falls die Funktion parallel zu einem direkten Insert umgangen würde.

**Warum eine DB-Funktion statt Anwendungslogik im Frontend:** Da LocalCourt laut P2 keinen eigenen Anwendungs-Server betreibt (Frontend spricht direkt mit PostgREST), kann die Atomaritätsprüfung nicht in einer Backend-Schicht liegen. Die Alternative — Prüfung im Frontend vor einem `INSERT` — würde die Concurrency-Garantie aus AF-01 Regel 6 nicht erfüllen (Race Condition zwischen Prüfung und Insert). Die PostgreSQL-Funktion ist damit die einzige Stelle, an der Prüfung und Schreiben atomar zusammenfallen.

## N2.5 Zählstrategie `confirmed_count`

Löst den in [D1.6](D1-datenmodell.md#d16-abgeleitete-merkmale) und [D1.9](D1-datenmodell.md#d19-offene-punkte) offengelassenen Punkt.

**Entscheidung:** `confirmed_count` wird **berechnet** (`COUNT(*) FROM participant WHERE session_id = … AND status IN ('confirmed','checked_in')`), nicht als eigenständig gepflegtes Feld geführt. Begründung:

- Ein geführtes Zählfeld müsste bei jedem Beitritt/Check-in konsistent mitgepflegt werden und wäre eine zusätzliche Fehlerquelle (Inkonsistenz zwischen Zählfeld und tatsächlicher `participant`-Anzahl).
- Die erwartete Datenmenge im Free-Tier-Rahmen (CON-T-05, ~100–500 aktive Nutzer, SC-04) macht `COUNT`-Abfragen über den Index `participant (session_id)` ([N2.3](#n23-schlüssel-constraints-und-indizes)) performant genug; eine Materialisierung wäre eine verfrühte Optimierung.
- Die Zählung wird ohnehin bereits als Teil von [N2.4](#n24-atomarität-des-beitritts-af-01) innerhalb derselben Transaktion durchgeführt, sodass keine zusätzliche Konsistenzsicherung nötig ist.

Für die Anzeige (UC-02, UC-03, B1 DLG-04) wird `confirmed_count` über eine View oder eine PostgREST-Spalten-Projektion mit Subquery bereitgestellt, damit das Frontend sie wie ein normales Feld lesen kann.

## N2.6 Statuspersistenz (AF-03)

Löst den in [F3 AF-03](F3-anwendungsfunktionen.md#f35-af-03--session-lifecycle--statusübergänge), [D1.6](D1-datenmodell.md#d16-abgeleitete-merkmale) und [D1.9](D1-datenmodell.md#d19-offene-punkte) offengelassenen Punkt.

**Entscheidung:** `session.status` wird **nicht** gespeichert, sondern bei jeder Abfrage aus `start_at`, `duration_min` und der aktuellen Serverzeit berechnet (SQL-Ausdruck bzw. View, die die Ableitungstabelle aus AF-03 nachbildet: `scheduled` wenn `now() < start_at`, `active` wenn `start_at ≤ now() < start_at + duration_min * interval '1 minute'`, sonst `completed`).

**Begründung gegen einen zeitgesteuerten Mechanismus (Scheduler/Cron, in F1 A21 als Alternative genannt):** LocalCourt betreibt laut [P2.6](P2-architekturueberblick.md#p26-fehlende--zukünftige-systeme) bewusst keine Message Queue oder Background-Job-Infrastruktur, und ein Cron-gesteuertes Auto-Close würde eine zusätzliche, im Free-Tier zu betreibende Komponente erfordern (CON-T-02). Ein berechneter Status erreicht dieselbe fachliche Wirkung (monotoner, zeitbasierter Übergang, AF-03 Regel 1–3) ohne zusätzliche Infrastruktur und ohne Verzögerung zwischen Zeitablauf und sichtbarem Statuswechsel.

Das reservierte `cancelled`-Kennzeichen ([D2.3](D2-datentypen.md#d23-sessionstatus)) wird als `boolean`-Spalte `is_cancelled` (Default `false`) vorgesehen, obwohl im MVP keine Aktion sie setzt (AF-03 Regel 4) — die Spalte liegt bereit, ohne den Ableitungsausdruck zu verkomplizieren: Ist sie `true`, liefert die Ableitung `cancelled`; sonst gilt die Zeittabelle.

## N2.7 PIN-Erzeugung und -Speicherung (AF-04)

Löst den in [F3 AF-04](F3-anwendungsfunktionen.md#f36-af-04--pin--und-qr-code-erzeugung) und [D2.4](D2-datentypen.md#d24-pin) offengelassenen Punkt.

**Erzeugung:** Die PIN wird innerhalb derselben serverseitigen Funktion erzeugt, die eine Session anlegt (Erweiterung des in [P2.5 Szenario 1](P2-architekturueberblick.md#p25-kritische-datenflüsse) skizzierten `INSERT session`-Schritts), z. B. via `LPAD(FLOOR(random() * 10000)::text, 4, '0')`, damit führende Nullen erhalten bleiben (D2.4-Anforderung „Zeichenkette, kein Zahlwert"). Eine globale Eindeutigkeitsprüfung entfällt gemäß D2.4/AF-04 Regel 2.

**Speicherung:** Die PIN wird **im Klartext** gespeichert (`char(4)`, [N2.2](#n22-technische-typzuordnung)), nicht gehasht. Begründung, konsistent mit der bewussten Sicherheitsabwägung in D2.4/AF-04 Regel 5:

- Der Organisator muss die PIN als Fallback zum QR-Code anzeigen können (UC-07, F1 GP-02 A18-A19); ein gehashter Wert wäre dafür nicht direkt reproduzierbar.
- Die fachliche Auswirkung eines kompromittierten Check-ins ist gering (reine Anwesenheitsmarkierung, keine Zahlungs- oder Zugangsfolge, D2.4).
- Ein Hash würde zusätzliche Komplexität (Vergleichslogik in der Check-in-Funktion) ohne proportionalen Sicherheitsgewinn einführen.

Zugriff auf die `pin`-Spalte wird über Row-Level-Security ([N2.11](#n211-row-level-security-rls)) so eingeschränkt, dass sie nur dem Organisator und bereits `confirmed` Teilnehmern der jeweiligen Session sichtbar ist — nicht öffentlich in Listen-/Suchansichten (UC-02).

## N2.8 QR-Inhalt (AF-04)

Löst den in [D2.8](D2-datentypen.md#d28-qrcontent) offengelassenen Punkt.

**Entscheidung:** Der QR-Inhalt wird **nicht** als eigenständiges Feld materialisiert, sondern clientseitig aus `session_id` und `pin` gebildet, sobald die Session-Detailansicht (B1 DLG-04/DLG-05) geladen ist: `{FRONTEND_ORIGIN}/check-in?session=<session_id>&pin=<pin>` (konzeptionelles Format aus F3 AF-04 Regel 3). Die Bild-Erzeugung (Text → QR-Grafik) erfolgt im Frontend über eine clientseitige QR-Bibliothek (F1 GP-02 nennt eine „QR-Code-Library" als Akteur), ohne Server-Rundtrip.

**Begründung:** Da QR-Inhalt und PIN gemäß AF-04 Regel 4 über die Lebensdauer der Session stabil sind und deterministisch aus zwei bereits vorhandenen Feldern folgen, entfällt der Bedarf, sie redundant zu speichern (vermeidet Inkonsistenz-Risiko, analog zu [N2.5](#n25-zählstrategie-confirmed_count)). Die konkrete Codierung (Query-Parameter-Namen, Basis-URL) ist bewusst minimal gehalten und kann bei Bedarf ohne Datenmigration angepasst werden, da nichts davon persistiert ist.

## N2.9 Identifier-Strategie

Löst den in [D2.2](D2-datentypen.md#d22-identifier) und [D2.11](D2-datentypen.md#d211-offene-punkte) offengelassenen Punkt.

**Entscheidung:** `uuid` (Version 4, `gen_random_uuid()`) für alle system-vergebenen Primärschlüssel (`sport_id`, `court_id`, `session_id`, `participant_id`). Begründung: PostgreSQL/Supabase unterstützt `gen_random_uuid()` nativ (`pgcrypto`), UUIDs sind kollisionssicher ohne zentrale Sequenz-Koordination und passen zu PostgREST, das Ressourcen über die Primärschlüssel-Spalte adressiert.

`profile.user_id` bildet die einzige Ausnahme: Er wird **nicht** von LocalCourt vergeben, sondern 1:1 von der Supabase-Auth-Kennung übernommen (D1.4, S1 NB-02) — technisch als Fremdschlüssel-ähnliche Referenz auf `auth.users.id` (kein eigener Default).

## N2.10 Zeitfenster und Zeittoleranz beim Check-in (AF-02)

Löst den in [F3 AF-02](F3-anwendungsfunktionen.md#f34-af-02--check-in-validierung) und [F3.10](F3-anwendungsfunktionen.md#f310-offene-punkte) offengelassenen Punkt teilweise.

Die Check-in-Prüfung (AF-02 Regel 4) wird serverseitig als Teil einer weiteren atomaren Funktion (`check_in`, RPC analog zu [N2.4](#n24-atomarität-des-beitritts-af-01)) ausgeführt, die den Status **exakt** nach der Ableitungstabelle aus AF-03/[N2.6](#n26-statuspersistenz-af-03) prüft — d. h. `active` bedeutet `start_at ≤ now() < start_at + duration_min`. Eine Client-Zeit wird dabei nie als Vertrauensbasis verwendet; maßgeblich ist ausschließlich `now()` der Datenbank, um eine Manipulation über die Client-Uhr auszuschließen.

**Offen:** Ob am Rand dieses Fensters eine kleine technische Toleranz (z. B. wenige Sekunden) eingeräumt wird, um Netzwerklatenz zwischen Klick und Server-Zeitstempel abzufedern, ist eine nichtfunktionale Abwägung, die erst mit N1 sinnvoll beziffert werden kann (siehe [N2.15](#n215-offene-punkte)). Fachlich gilt bis dahin exakt die Grenze `active`, wie in F3 AF-02 festgelegt.

## N2.11 Row-Level-Security (RLS)

Konkretisiert die in [S1.4](S1-nachbarsysteme.md#s14--nb-03--supabase-postgrest-api) als „zu dokumentieren" offengelassenen RLS-Policies für NB-03, auf Basis der fachlichen Regeln aus F3 und der Sichtbarkeits-Hinweise aus D1.4/B1.

| Tabelle | Policy (fachliche Wirkung) | Bezug |
|---|---|---|
| `session` | Lesbar für alle angemeldeten Nutzer (Discovery, UC-02); kein Schreibzugriff außer über die Erstellungs-RPC. | UC-02, UC-06 |
| `session.pin` (Spalten-Ebene) | Nur für `organizer_id = auth.uid()` oder Nutzer mit `participant`-Eintrag (`status ∈ {confirmed, checked_in}`) für diese Session sichtbar. | AF-02, AF-04, [N2.7](#n27-pin-erzeugung-und-speicherung-af-04) |
| `participant` | Lesbar für `organizer_id` der zugehörigen Session (Teilnehmerliste, UC-07) und für den Nutzer selbst (`user_id = auth.uid()`, UC-05, UC-11). Schreibzugriff ausschließlich über die `join_session`/`check_in`-RPCs, nicht über direkte `INSERT`/`UPDATE`. | AF-01, AF-02, UC-04, UC-07, UC-08, UC-09 |
| `profile` | Basisfelder (`display_name`, `avatar_url`) für alle angemeldeten Nutzer lesbar (Teilnehmerliste, UC-03/UC-07); Schreibzugriff nur für `user_id = auth.uid()`. | UC-12, D1.4 „Datenschutz" |
| `court`, `sport`, `sport_preference` | `court`/`sport` lesbar für alle; `court`-Erstellung durch angemeldete Nutzer (UC-10, `created_by = auth.uid()`); `sport_preference` nur für den eigenen `user_id` schreibbar. | UC-10, UC-12 |

Diese Policies setzen die in P2.3 bereits skizzierten Fehlercodes (401/403) technisch um: Ein `403 Forbidden` aus P2.5 Szenario 2 (RLS-Verletzung) entsteht genau dann, wenn eine dieser Bedingungen nicht erfüllt ist.

## N2.12 Fehler-Mapping (Ergebniscodes → HTTP)

Bildet die fachlichen Ergebniscodes aus F3 auf die HTTP-Antworten ab, die P2.5 bereits auf Sequenzdiagramm-Ebene skizziert, und schließt sie für alle vier Anwendungsfunktionen vollständig.

| Anwendungsfunktion | Ergebniscode (F3) | HTTP-Status (RPC-Antwort) |
|---|---|---|
| AF-01 | `OK` | `200 OK` mit Participant-Datensatz |
| AF-01 | `NOT_AUTHENTICATED` | `401 Unauthorized` |
| AF-01 | `SESSION_NOT_JOINABLE` | `409 Conflict` |
| AF-01 | `ALREADY_JOINED` | `409 Conflict` |
| AF-01 | `SESSION_FULL` | `409 Conflict` (entspricht P2.5 Szenario 2, 7b) |
| AF-02 | `OK` / `ALREADY_CHECKED_IN` | `200 OK` (beide idempotent erfolgreich, AF-02 Regel 5) |
| AF-02 | `NOT_JOINED` | `403 Forbidden` |
| AF-02 | `INVALID_CREDENTIAL` | `400 Bad Request` |
| AF-02 | `OUTSIDE_WINDOW` | `409 Conflict` |

Alle `409`-Antworten sind fachliche Ablehnungen (kein Serverfehler) und werden im Frontend als Inline-Meldung dargestellt, nicht als generischer Fehlerzustand (konsistent mit S1.2, „Validation Errors: Form-Level Highlights").

## N2.13 Betrieb: Testing und Monitoring

Im Rahmen des Free-Tier-Budgets (CON-T-02, CON-T-05) und ohne eigene Backend-Schicht (P2.1) beschränkt sich N2 auf die Werkzeuge, die im Deployment-Überblick (P2.4) bereits benannt sind:

- **Testing:** Die atomaren Funktionen aus [N2.4](#n24-atomarität-des-beitritts-af-01) und [N2.10](#n210-zeitfenster-und-zeittoleranz-beim-check-in-af-02) sind die kritischsten Stellen für Concurrency-Fehler und sollten vorrangig mit gezielten Tests gegen die Entscheidungstabellen aus F3 AF-01/AF-02 abgedeckt werden (jede Tabellenzeile ein Testfall). Die konkrete Test-Toolkette (Unit/Integration, CI-Einbindung) ist Sache von N1/CI-Pipeline (SC-07) und hier nicht weiter spezifiziert.
- **Monitoring:** Supabase Logs (PostgREST, Auth, Database) und Vercel Dashboard, wie bereits in [P2.4](P2-architekturueberblick.md#p24-deployment--architektur-topologie) als Infrastruktur-Bestandteil gelistet. Eine dedizierte Monitoring-Lösung (Sentry, DataDog) ist laut P2.6 bewusst nicht integriert.

## N2.14 Konsistenz und Cross-References

| Baustein | Relevanz für N2 |
|---|---|
| [P1](P1-ziele-rahmenbedingungen.md) | Free-Tier-Constraints (CON-T-01–CON-T-05) begrenzen die technischen Optionen (kein Scheduler, kein eigener Server, PostgreSQL/Supabase). |
| [P2](P2-architekturueberblick.md) | Deployment-Topologie und Sequenzdiagramme sind die Grundlage für RPC-Endpoints und Fehler-Mapping ([N2.12](#n212-fehler-mapping-ergebniscodes--http)). |
| [F3](F3-anwendungsfunktionen.md) | Jede N2-Entscheidung setzt eine fachliche Regel aus AF-01–AF-04 technisch um; N2 fügt keine neuen Regeln hinzu. |
| [D1](D1-datenmodell.md) | Grundlage für Schema, Schlüssel und Invarianten ([N2.3](#n23-schlüssel-constraints-und-indizes)). |
| [D2](D2-datentypen.md) | Grundlage für die Typzuordnung ([N2.2](#n22-technische-typzuordnung)) und PIN-Sicherheitsabwägung ([N2.7](#n27-pin-erzeugung-und-speicherung-af-04)). |
| [S1](S1-nachbarsysteme.md) | N2.11 konkretisiert die dort als offen markierten RLS-Policies für NB-03. |
| [B1](B1-dialogspezifikation.md) | Sichtbarkeitsregeln für Felder (z. B. PIN, Profildaten) spiegeln sich in den RLS-Policies wider. |
| N1 | Liefert die nichtfunktionalen Bewertungsgrößen (Zeittoleranz, Feldlängen, Sicherheitsniveau), auf die mehrere N2-Abschnitte verweisen, sobald N1 vorliegt. |
| E2 | Glossar: einheitliche Begriffe, insbesondere für die hier eingeführten technischen Begriffe (RPC, RLS, Atomarität). |

## N2.15 Offene Punkte

| Punkt | Beschreibung | Zuständiger Baustein |
|---|---|---|
| Zeittoleranz beim Check-in | Ob und wie groß eine technische Toleranz am Rand des `active`-Fensters ist (F3.10). | N1 |
| Feldlängen | Konkrete `CHECK`-Obergrenzen für `Text`-Felder (`title`, `display_name`, `description`), sobald N1 sie definiert (D2.11). | N1 |
| Maximale Session-Dauer | Fachliche Obergrenze für `duration_min`, aktuell nur mit Untergrenze `≥ 1` abgesichert (D2.6). | N1 / UC-06 |
| Court-Dubletten | UI-/Datenverhalten bei offensichtlich doppelt erfassten Courts (UC-10), technische Erkennung nicht Teil dieses Bausteins. | N1 / B1 |
| Sichtbare Profilfelder | Feingranulare RLS-Regeln für einzelne `profile`-Attribute in Teilnehmerlisten, falls über die Basisfelder in N2.11 hinaus Bedarf entsteht (D1.9). | B1 / N1 |
| Skalierung der Suche | Ob die in N2.3 vorgeschlagenen Indizes bei wachsender Nutzerzahl (SC-04) ausreichen. | N1 / Betrieb |

## N2.16 Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | Claude (Claude Sonnet 5) |
| Verwendung | Entwurf des N2-Bausteins: Auflösung der in D1, D2 und F3 explizit an N2 verwiesenen offenen Punkte (Typzuordnung, Schlüssel/Constraints, Atomarität des Beitritts, Statuspersistenz, PIN-Speicherung, QR-Inhalt, Identifier-Strategie, RLS, Fehler-Mapping) auf Basis des bestehenden Tech-Stacks (P1 CON-T-01–CON-T-03, P2). |
| Prüfung | Inhalte wurden gegen [P1](P1-ziele-rahmenbedingungen.md), [P2](P2-architekturueberblick.md), [F3](F3-anwendungsfunktionen.md), [D1](D1-datenmodell.md), [D2](D2-datentypen.md) und [S1](S1-nachbarsysteme.md) geprüft; keine über das MVP hinausgehenden Funktionen wurden eingeführt. Mit dem Team abzustimmen, insbesondere die Entscheidungen zur PIN-Klartextspeicherung ([N2.7](#n27-pin-erzeugung-und-speicherung-af-04)) und zur berechneten Statuspersistenz ([N2.6](#n26-statuspersistenz-af-03)). |
