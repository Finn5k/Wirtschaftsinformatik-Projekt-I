# S3 — Inbetriebnahme

S3 hält fest, was für die Inbetriebnahme von LocalCourt an Voraussetzungen, persistenten Zuständen und Abläufen gilt — auf Spezifikationsebene, nicht als Betriebs-Runbook. Die konkrete technische Umsetzung (Knoten, Konfigurationswerte, Kommunikationsbeziehungen) steht in [A07 — Verteilungssicht](../arch/A07-deployment-view.md) und wird hier nicht wiederholt. S3 ist kompakt gehalten, weil LocalCourt auf zwei verwalteten Plattformen (Vercel, Supabase) betrieben wird und keinen eigenen Server, keine eigene Build- oder Deployment-Pipeline und keine Staging-Umgebung vorsieht.

## S3.1 Rahmen und Konventionen

- **Greenfield, keine Migration.** LocalCourt hat kein Vorgängersystem und keine Altdaten; S2 ist deshalb nicht anwendbar ([docs/spec/README.md](README.md), NG-09).
- **Managed-Plattformen statt eigener Infrastruktur.** Frontend und Backend laufen im Free-/Student-Tier von Vercel bzw. Supabase; ein eigener Server oder eine eigene Infrastruktur sind nicht vorgesehen ([P1.5 CON-T-02](P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints)).
- **Kein Scheduler im Betrieb.** Der Session-Status wird bei jeder Abfrage berechnet statt per Cron/Batch gepflegt; B2 ist deshalb nicht anwendbar ([docs/spec/README.md](README.md)).
- **Nur eine Umgebung dokumentiert.** Architektonisch relevant dokumentiert ist ausschließlich die Produktionsumgebung; eine gesonderte Staging- oder Entwicklungsverteilung ist nicht Teil der Dokumentation ([A07 §7.1.1](../arch/A07-deployment-view.md#711-produktionsumgebung)).

## S3.2 Voraussetzungen

| Aspekt | Inhalt | Quelle |
|---|---|---|
| Supabase-Projekt | Stellt Datenbank (PostgreSQL), Auth (NB-02) und PostgREST (NB-03) bereit. | [A07](../arch/A07-deployment-view.md), [S1.3](S1-nachbarsysteme.md#s13-nb-02--supabase-auth)/[S1.4](S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest) |
| Vercel-Projekt mit Git-Anbindung | Baut und veröffentlicht die statische SPA bei Push auf `main`. | [P1.6 SC-07](P1-ziele-rahmenbedingungen.md#p16-erfolgskriterien), [`vercel.json`](../../vercel.json) |
| Konfigurationswerte `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Müssen vor dem Build gesetzt sein; Vite ersetzt sie beim Bauen, nicht zur Laufzeit. | [A07 §7.1.1 „Konfiguration"](../arch/A07-deployment-view.md#711-produktionsumgebung), [`.env.example`](../../.env.example) |
| Erreichbarkeit von NB-04/NB-05 | OpenStreetMap-Tiles und Nominatim müssen aus dem Browser erreichbar sein. | [S1.5](S1-nachbarsysteme.md#s15-nb-04--openstreetmap-tiles)/[S1.6](S1-nachbarsysteme.md#s16-nb-05--nominatim-reverse-geocoding) |

## S3.3 Persistente Zustände

| Fläche | Inhalt | Quelle |
|---|---|---|
| Datenbankschema und -daten | Die sieben Entitäten aus D1, angelegt und verändert über versionierte Migrationen unter `supabase/migrations`. | [supabase/README.md](../../supabase/README.md) |
| Konfigurationswerte | Vercel-Umgebungsvariablen und der öffentliche Supabase-Projektschlüssel; beide öffentlich, kein Geheimnis im Repository. | [`.env.example`](../../.env.example), [A07](../arch/A07-deployment-view.md) |

**Konfigurationshinweis:** Der geheime Service-Role-Key ist keine der oben genannten Flächen — er wird vom Frontend nie verwendet und gehört weder ins Repository noch in die Vercel-Client-Variablen ([A07 §7.1.1](../arch/A07-deployment-view.md#711-produktionsumgebung), [`.env.example`](../../.env.example)).

Eine eigene Fläche für Anwendungs-Logs oder Datei-Storage ist nicht dokumentiert; Storage wird von LocalCourt ohnehin nicht genutzt ([S1.4](S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest)). Ob und wie Logs persistiert werden, ist **offen**.

## S3.4 Erstinbetriebnahme

**Geplanter Ablauf** (aus den Voraussetzungen in S3.2 abgeleitet, nicht als bereits vollständig durchgeführt bestätigt):

1. Supabase-Projekt anlegen und Datenbankschema per Migrationen einspielen.
2. Vercel-Projekt anlegen und mit dem Git-Repository verbinden.
3. Konfigurationswerte `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel setzen — vor dem ersten Build, da Vite sie beim Bauen ersetzt (S3.2).
4. Ersten Build/Deploy auslösen.
5. Gegen die Voraussetzungen aus S3.2 (Datenzugriff, Kartendarstellung, Reverse-Geocoding) prüfen.

**Nachgewiesene Durchführung:** Laut [supabase/README.md](../../supabase/README.md) sind die Migrationen bereits auf das Supabase-Produktionsprojekt (`uqpjctqedenmjonkqubq`, Region `eu-central-1`) angewendet. Belegt ist damit Schritt 1 für die Datenbankseite — nicht mehr.

**Offene Verifikation:** Die Existenz eines produktiven Vercel-Projekts lässt sich nicht aus der Supabase-Migrationshistorie ableiten; beide Plattformen werden unabhängig voneinander provisioniert (S3.2). Ob ein Vercel-Projekt bereits angelegt und mit dem Repository verbunden ist, ob die Konfigurationswerte gesetzt sind, ob ein erster Build/Deploy erfolgt ist und ob der Ende-zu-Ende-Pfad geprüft wurde (Schritte 2–5), ist in der vorhandenen Dokumentation nicht belegt und damit **offen**.

## S3.5 Laufende Releases

Code-Releases laufen über die Git-Integration von Vercel: Ein Push auf `main` löst automatisch Build und Veröffentlichung aus; reine Dokumentationsänderungen werden dank der `ignoreCommand`-Regel in [`vercel.json`](../../vercel.json) übersprungen ([P1.6 SC-07](P1-ziele-rahmenbedingungen.md#p16-erfolgskriterien)). Eine darüber hinausgehende CI-Pipeline für Lint oder Tests ist im MVP nicht eingerichtet (ebenda).

Datenbank-Änderungen laufen unabhängig vom Vercel-Deployment: Neue Migrationen werden nach dem Muster `<UTC-Zeitstempel>_<name>.sql` angelegt und, da kein lokales Supabase-CLI eingerichtet ist, über die Supabase-Verwaltungs-API eingespielt ([supabase/README.md](../../supabase/README.md)). Dieser Schritt ist weder automatisiert noch Teil des Vercel-Deployments.

## S3.6 Rollback

Frontend-Rollback und die Rücknahme einer Datenbankmigration sind zwei getrennte Fragen; für keine der beiden ist ein Verfahren dokumentiert:

- **Frontend-Rollback (Vercel):** Ob und wie ein fehlerhafter Code-Release zurückgenommen wird, ist nicht dokumentiert. Er würde, wenn überhaupt, unabhängig von der Datenbank erfolgen, da S3.5 Code-Release und Migration bereits als getrennte Abläufe beschreibt.
- **Rücknahme einer Datenbankmigration:** [supabase/README.md](../../supabase/README.md) beschreibt nur das Einspielen neuer Migrationen über die Supabase-Verwaltungs-API, kein Zurücksetzen bereits angewendeter Migrationen.

Beide Punkte sind **offen**; ein konkretes Verfahren wird an dieser Stelle nicht festgelegt.

## S3.7 Abgrenzung

- **Keine CI-Pipeline für Lint/Tests im MVP** eingerichtet ([P1.6 SC-07](P1-ziele-rahmenbedingungen.md#p16-erfolgskriterien)).
- **Keine Staging- oder Multi-Environment-Sicht**: Architektonisch dokumentiert ist ausschließlich die Produktionsumgebung ([A07 §7.1.1](../arch/A07-deployment-view.md#711-produktionsumgebung)).
- **Keine Datenmigration von einem Vorgängersystem** (Greenfield, [NG-09](P1-ziele-rahmenbedingungen.md#p14-scope); S2 nicht anwendbar).
- **Konkrete Deployment-Konfiguration** (Rewrite-Regeln, Build-Steuerung) liegt in [`vercel.json`](../../vercel.json) und [A07](../arch/A07-deployment-view.md) und wird hier nicht wiederholt.
- **Kein eigenes Operator-Bootstrap.** LocalCourt kennt keine gesonderte Administrator-Rolle; Nutzer registrieren sich selbstständig über NB-02 ([S1.3](S1-nachbarsysteme.md#s13-nb-02--supabase-auth)).

## S3.8 Querverweise

| Baustein/Dokument | Bezug zu S3 |
|---|---|
| [P1](P1-ziele-rahmenbedingungen.md) | Constraints CON-T-01 bis -05 (Free-Tier, Managed-Plattformen), NG-09 (Greenfield), SC-07 (Deployment-Automatisierung) |
| [P2](P2-architekturueberblick.md) | Systemkontext und Nachbarsysteme (NB-01 bis NB-05) |
| [A07](../arch/A07-deployment-view.md) | Vollständige Verteilungssicht: Knoten, Konfiguration, Kommunikationsbeziehungen |
| [S1](S1-nachbarsysteme.md) | Abgrenzungen NB-02/NB-03, Erreichbarkeit NB-04/NB-05 |
| [N2.2](N2-querschnittskonzepte.md#n22-row-level-security-rls) | Row-Level-Security als Zugriffsschutz im laufenden Betrieb |
| [supabase/README.md](../../supabase/README.md) | Migrationen, Ergebniscodes, Anwenden neuer Migrationen |
| [`.env.example`](../../.env.example) | Konfigurationswerte |
| [docs/spec/README.md](README.md) | B2, S2 als nicht anwendbar dokumentiert |
