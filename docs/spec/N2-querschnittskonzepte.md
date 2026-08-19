# N2 — Querschnittskonzepte

## N2.1 Zweck und Einordnung

Dieser Baustein beschreibt die Querschnittskonzepte des Systems LocalCourt. Querschnittskonzepte gelten systemweit und betreffen mehrere Anwendungsfälle, Funktionen oder Datenobjekte gleichzeitig. Sie ergänzen die funktionalen Anforderungen, ohne neue fachliche Funktionen einzuführen.

Die in diesem Baustein beschriebenen Konzepte konkretisieren übergreifende Regeln, die in den übrigen Spezifikationsbausteinen vorausgesetzt oder referenziert werden. Sie dienen dazu, ein einheitliches Verhalten des Systems über mehrere Komponenten hinweg sicherzustellen.


## N2.2 Row-Level-Security (RLS)

Dieses Querschnittskonzept beschreibt die systemweit geltenden Zugriffsregeln auf Daten und Funktionen. Die Umsetzung erfolgt mithilfe der Row-Level-Security (RLS) von Supabase und orientiert sich an den fachlichen Berechtigungen des Systems.

| Tabelle | Policy (fachliche Wirkung) | Bezug |
|---|---|---|
| `session` | Lesbar für alle angemeldeten Nutzer (Discovery, UC-02); kein Schreibzugriff außer über die Erstellungs-RPC. | UC-02, UC-06 |
| `session.pin` (Spalten-Ebene) | Nur sichtbar für Nutzer mit `organizer`-Eintrag (`organizer.user_id = auth.uid()`) oder `participant`-Eintrag (`status ∈ {confirmed, checked_in}`) für diese Session. | AF-02, AF-04 |
| `organizer` | Lesbar für alle angemeldeten Nutzer (Anzeige „Organisator" in Session-Detail, UC-03); kein Schreibzugriff außer über die Erstellungs-RPC (`create_session`), die `organizer`- und `participant`-Eintrag atomar mit der Session anlegt. | UC-03, UC-06 |
| `participant` | Lesbar für den Organisator der zugehörigen Session (`organizer.user_id = auth.uid()` für diese `session_id`, Teilnehmerliste, UC-07) und für den Nutzer selbst (`user_id = auth.uid()`, UC-05, UC-11). Schreibzugriff ausschließlich über die `join_session`/`check_in`-RPCs, nicht über direkte `INSERT`/`UPDATE`. | AF-01, AF-02, UC-04, UC-07, UC-08, UC-09 |
| `profile` | Basisfelder (`display_name`, `avatar_url`) für alle angemeldeten Nutzer lesbar (Teilnehmerliste, UC-03/UC-07); `display_name` und `city` nur für `user_id = auth.uid()` schreibbar. `avatar_url` bleibt im MVP unverändert. | UC-12, D1.4 „Datenschutz" |
| `court`, `sport`, `sport_preference` | `court`/`sport` lesbar für alle; `court`-Erstellung durch angemeldete Nutzer (UC-10, `created_by = auth.uid()`); `sport_preference` nur für den eigenen `user_id` schreibbar. | UC-10, UC-12 |

Diese Policies setzen die Fehlercodes aus N2.3 technisch um: Ein `403 Forbidden` (RLS-Verletzung) entsteht genau dann, wenn eine dieser Bedingungen nicht erfüllt ist.

## N2.3 Fehler-Mapping (Ergebniscodes → HTTP)

Dieses Querschnittskonzept beschreibt die einheitliche Behandlung fachlicher Fehlerzustände und deren Abbildung auf HTTP-Antworten. Dadurch verhalten sich alle Anwendungsfunktionen gegenüber dem Frontend konsistent.

| Anwendungsfunktion | Ergebniscode (F3) | HTTP-Status (RPC-Antwort) |
|---|---|---|
| AF-01 | `OK` | `200 OK` mit Participant-Datensatz |
| AF-01 | `NOT_AUTHENTICATED` | `401 Unauthorized` |
| AF-01 | `SESSION_NOT_JOINABLE` | `409 Conflict` |
| AF-01 | `ALREADY_JOINED` | `409 Conflict` |
| AF-01 | `SESSION_FULL` | `409 Conflict` (siehe [F3 AF-01](F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel)) |
| AF-02 | `OK` / `ALREADY_CHECKED_IN` | `200 OK` (beide idempotent erfolgreich, AF-02 Regel 5) |
| AF-02 | `NOT_JOINED` | `403 Forbidden` |
| AF-02 | `INVALID_CREDENTIAL` | `400 Bad Request` |
| AF-02 | `OUTSIDE_WINDOW` | `409 Conflict` |

Alle `409`-Antworten sind fachliche Ablehnungen (kein Serverfehler) und werden im Frontend als Inline-Meldung dargestellt, nicht als generischer Fehlerzustand (konsistent mit S1.2, „Validation Errors: Form-Level Highlights").


## N2.4 Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | Claude (Claude Sonnet 5) / Codex |
| Verwendung | Unterstützung bei der Erstellung und sprachlichen Überarbeitung des Bausteins N2. RLS-Policies (N2.2) nach Einführung der `organizer`-Entität in D1 aktualisiert (`organizer_id`-Spalte auf `session` entfällt, ersetzt durch `organizer`-Tabelle). |
| Prüfung | Alle Inhalte wurden anhand der übrigen Spezifikationsbausteine geprüft und anschließend manuell überarbeitet. |
