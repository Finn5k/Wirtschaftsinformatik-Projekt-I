# Projektkonventionen — LocalCourt

Dieses Dokument hält verbindliche Konventionen für das LocalCourt-Projekt fest.
Es gilt für alle Mitwirkenden (Team und KI-Werkzeuge).

## Commit-Konventionen — Conventional Commits (verpflichtend)

**Vorgabe des Professors:** Alle Commits müssen der Spezifikation
[Conventional Commits 1.0.0](https://www.conventionalcommits.org/de/v1.0.0/)
entsprechen. Diese Vorgabe ist nicht optional.

Format:

```
<type>(<scope>): <beschreibung>

[optionaler body]

[optionaler footer]
```

**Erlaubte `type`-Werte:**

| Type | Verwendung |
|---|---|
| `feat` | Neue fachliche Funktion (Code) |
| `fix` | Fehlerbehebung |
| `docs` | Dokumentation (inkl. Spezifikation unter `docs/spec/`) |
| `refactor` | Umbau ohne Verhaltensänderung |
| `test` | Tests hinzufügen/ändern |
| `chore` | Build, Tooling, Abhängigkeiten, Sonstiges |
| `style` | Formatierung ohne Logikänderung |
| `perf` | Performance-Verbesserung |

**Konventionen für `scope`:**
- Spezifikationsbausteine: `spec` (z. B. `docs(spec): add F3 application functions`).
- Frontend-Bereiche: `sessions`, `discover`, `map`, `profile`, `frontend` (siehe Historie).
- Meta/Projektweit: kein Scope oder `meta`.

**Regeln:**
- Beschreibung im Imperativ, klein geschrieben, ohne Punkt am Ende.
- Ein Commit = eine logische Änderung.
- Breaking Changes mit `!` markieren (`feat!: ...`) oder `BREAKING CHANGE:` im Footer.

**Workflow (verbindlich):**
- **Vor jedem Commit** die vollständige Commit-Nachricht dem Nutzer zur Freigabe zeigen und dessen Bestätigung abwarten.
- Commits und Pushes **immer lokal über `git` / `gh`** ausführen, **nicht** über den GitHub-MCP-Server (`push_files`).

Beispiele aus der Projekt-Historie: `docs(spec): add F2 use cases`,
`feat(sessions): add create session form validation`, `fix(map): replace broken leaflet marker icons`.

## Spezifikation nach Siedersleben

- Die Spezifikation liegt unter `docs/spec/` und folgt dem Siedersleben-Schema.
- Baustein-Dateien werden nach dem Muster `<Baustein>-<thema>.md` benannt
  (z. B. `F1-geschaeftsprozesse.md`, `F2-anwendungsfaelle.md`, `F3-anwendungsfunktionen.md`).
- IDs bleiben **stabil** und dienen als durchgängige Referenz
  (Geschäftsprozess `GP-nn`, Use Case `UC-nn`, Anwendungsfunktion `AF-nn`, Ziel `G-nn`, Nicht-Ziel `NG-nn`).
- Alle Dokumente sind auf **Deutsch** verfasst; Tabellen/Listen werden Prosa vorgezogen.
- Querverweise zwischen Bausteinen werden explizit als Markdown-Links gesetzt.
- **KI-Werkzeug-Offenlegung (verpflichtend):** Jeder Spezifikationsbaustein dokumentiert die eingesetzten KI-Werkzeuge **persistent** in einem eigenen Abschnitt „Eingesetzte KI-Werkzeuge" (Tabelle mit Werkzeug, Verwendung, Prüfung). Der Abschnitt ist Teil des Bausteins und wird bei Überarbeitungen aktuell gehalten.

## Referenzprojekte (Vorgaben des Professors)

- **Dokumentations-Beispiel (Herold):** https://github.com/carstenlucke/herold
- **Leistungsbewertung der Phasen:** https://github.com/carstenlucke/thm_wkb_wk-1106

## Git-Branches

- Entwicklung erfolgt auf Feature-Branches, nicht direkt auf `main`.
- Zusammenführung nach `main` per Pull Request.
- **Branch-Namen beschreiben direkt den Inhalt/die Aufgabe** im Format `<type>/<kurzbeschreibung>`
  (z. B. `docs/spec-f3-anwendungsfunktionen`, `feat/session-check-in`, `fix/map-marker-icons`).
- **Kein Werkzeug-Präfix** (`Codex/…`) und **kein Projektname** (`localcourt`) im Branch-Namen.
