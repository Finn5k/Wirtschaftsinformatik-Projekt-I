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

Diese Policies erzwingen die technischen Zugriffsregeln auf Datenebene. Eine daraus resultierende Zugriffsablehnung ist von einem fachlichen Ergebniscode einer Anwendungsfunktion zu unterscheiden; ein gleicher HTTP-Status bedeutet nicht dieselbe fachliche Bedeutung. Insbesondere ist eine technische RLS-Ablehnung nicht mit `NOT_JOINED` aus [F3 AF-02](F3-anwendungsfunktionen.md#af-02--check-in-validierung) gleichzusetzen. Konkrete fachliche Ergebniscodes und deren HTTP-Abbildung stehen bei der jeweiligen Anwendungsfunktion in F3.

## N2.3 Ergebnisweitergabe und technisches Mapping

### Grundregel

Jede Anwendungsfunktion definiert ihre fachlichen Ergebnisse (Ergebniscodes) in F3. Die technische Schnittstelle bildet diese Ergebnisse konsistent auf technische Statusantworten (HTTP-Status) ab. Die konkrete Zuordnung eines Ergebniscodes zu einem HTTP-Status wird bei der jeweiligen Anwendungsfunktion in F3 festgelegt, nicht in diesem Baustein (z. B. [F3 AF-01](F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel), [F3 AF-02](F3-anwendungsfunktionen.md#af-02--check-in-validierung)).

### Fachliches Ergebnis vs. technischer Fehler

Ein **fachliches Ergebnis** liegt vor, wenn eine Anfrage technisch verarbeitet wurde und eine Fachregel dazu ein definiertes Ergebnis liefert — Erfolg oder eine fachliche Ablehnung.

Ein **technischer Fehler** liegt vor, wenn die Verarbeitung technisch nicht zuverlässig durchgeführt oder beantwortet werden konnte (z. B. Netzwerkfehler, Zeitüberschreitung, Serverfehler). Ein technischer Fehler ist kein fachlicher F3-Ergebniscode und wird nicht als einer behandelt.

### Mapping-Regel

- Fachliche Ergebniscodes werden an der technischen Schnittstelle konsistent auf HTTP-Status abgebildet.
- Derselbe fachliche Ergebnistyp wird projektweit konsistent transportiert.
- Der HTTP-Status ist die technische Transportrepräsentation eines fachlichen Ergebnisses, nicht die fachliche Bedeutung selbst; ein HTTP-Status allein bestimmt daher nicht, ob ein Fehler fachlich oder technisch ist.
- Die konkrete Zuordnung Ergebniscode → HTTP-Status steht bei der jeweiligen Anwendungsfunktion in F3.
- Technische Fehler (Transport-, Netzwerk- oder Serverfehler) werden nicht in fachliche Ergebniscodes umgedeutet; sie sind keine fachlichen F3-Ergebniscodes.

Wenn eine Anwendungsfunktion einen definierten fachlichen Ergebniscode gemäß F3 über `409 Conflict` transportiert, ist dies eine fachliche Ablehnung und kein technischer Serverfehler. Eine fachliche Ablehnung wird dem Nutzer als kontextbezogene Dialogmeldung angezeigt ([B1.5.3](B1-dialogspezifikation.md#b153-formular-validierung)); ein technischer Serverfehler bleibt davon unabhängig vom konkreten HTTP-Status stets getrennt und erscheint als allgemeiner, nicht-blockierender technischer Fehlerzustand ([S1.1](S1-nachbarsysteme.md#s11-konventionen), [B1.5.4](B1-dialogspezifikation.md#b154-fehler--und-ladezustände)).
