# Supabase — Datenbankschema

Migrationen für das LocalCourt-Backend. Sie setzen das Datenmodell aus
[D1](../docs/spec/D1-datenmodell.md)/[D2](../docs/spec/D2-datentypen.md), die
Zugriffsregeln aus [N2.2](../docs/spec/N2-querschnittskonzepte.md#n22-row-level-security-rls)
und die atomaren Fachoperationen aus
[ADR-001](../docs/arch/A09-architecture-decisions.md) um.

| Migration | Inhalt |
|---|---|
| `…171811_schema` | Die sieben Entitäten aus D1.4 mit Constraints und Invarianten; Trigger für Profilanlage bei Registrierung und für die Löschregel aus D1.4. |
| `…171822_seed_sport` | Sportarten-Katalog (D1.4, sieben Einträge). |
| `…171838_views` | `session_status()` (AF-03), `confirmed_count()` (D1.6) und die Lesesicht `v_session`. |
| `…171924_rpc` | `create_session`, `join_session`, `check_in` (F3 AF-01/AF-02/AF-04). |
| `…171948_rls` | RLS-Policies und Spalten-GRANTs nach N2.2; `session_pin()`. |
| `…172141_hardening` | Nachschärfung nach dem Security-Advisor. |
| `…172434_policy_cleanup` | Zusammengefasste `participant`-Policy, Fremdschlüssel-Indizes. |

## Ergebniscodes

Die RPCs werfen fachliche Ergebniscodes als SQLSTATE `PTxyz`; PostgREST
übersetzt das in den HTTP-Status `xyz` und liefert den Ergebniscode als
`message`. Damit gilt genau das Mapping, das F3 je Anwendungsfunktion festlegt:

| Ergebniscode | HTTP | Quelle |
|---|---|---|
| `OK`, `ALREADY_CHECKED_IN` | 200 | Rückgabewert, kein Fehler |
| `INVALID_CREDENTIAL` | 400 | AF-02 |
| `NOT_AUTHENTICATED` | 401 | AF-01, AF-02 |
| `NOT_JOINED` | 403 | AF-02 |
| `SESSION_NOT_JOINABLE`, `ALREADY_JOINED`, `SESSION_FULL`, `OUTSIDE_WINDOW` | 409 | AF-01, AF-02 |

`START_IN_PAST`, `COURT_INCOMPLETE` (400) und `SESSION_NOT_FOUND` (404) sind
Eingabe- bzw. Existenzfehler ohne F3-Entsprechung — F3 definiert für
`create_session` bewusst kein eigenes Ergebniscode-Set.

## Anwenden

Die Migrationen sind bereits auf das Projekt `uqpjctqedenmjonkqubq`
(Organisation LocalCourt, Region `eu-central-1`) angewendet. Die Dateinamen
entsprechen den Versionen in der Migrationshistorie des Projekts.

Für neue Migrationen: Datei nach dem Muster `<UTC-Zeitstempel>_<name>.sql`
anlegen und anwenden. Ein lokales Supabase-CLI ist im Projekt nicht
eingerichtet; bisher wurden die Migrationen über die Supabase-Verwaltungs-API
eingespielt.

## Abweichung von N2.2

N2.2 formuliert die Leserechte auf `session`, `organizer`, `court` und `sport`
als „lesbar für alle **angemeldeten** Nutzer". Das widerspricht drei anderen
Stellen der Spezifikation:

- [UC-02](../docs/spec/F2-anwendungsfaelle.md#uc-02--session-suchen) Vorbedingung: „Anmeldung ist für die Suche nicht zwingend erforderlich"
- [B1.2](../docs/spec/B1-dialogspezifikation.md#b12-dialoglandkarte): Suche und Detailansicht sind ohne Anmeldung nutzbar
- [B1.5.2](../docs/spec/B1-dialogspezifikation.md#b152-weiterleitung-nicht-angemeldeter-nutzer): geschützt sind nur Beitreten, Erstellen, Check-in, Meine Sessions, Profil

Umgesetzt ist die Lesart von UC-02/B1: Sessions, Courts und Sportarten sind
auch unangemeldet lesbar. Personenbezogene Daten sind davon nicht betroffen —
`profile` und `participant` bleiben angemeldeten Nutzern vorbehalten. Die
Formulierung in N2.2 sollte nachgezogen werden.
