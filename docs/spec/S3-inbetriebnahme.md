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
| Datenbankschema und -daten | Die sieben Entitäten aus D1 samt Konten (`auth.users`), angelegt und verändert über versionierte Migrationen unter `supabase/migrations`. Der Sportarten-Katalog stammt aus der Seed-Migration; alle übrigen Daten entstehen im Betrieb. Im Free-Tier legt Supabase **keine automatischen Sicherungen** an (erst ab Pro täglich); ein eigener Export ist nicht eingerichtet. | [supabase/README.md](../../supabase/README.md), [P1.5 CON-T-02](P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) |
| Auth-Einstellungen des Supabase-Projekts | Die E-Mail-Bestätigung bei der Registrierung ist abgeschaltet, weil das MVP keinen E-Mail-Versand vorsieht ([S1.3](S1-nachbarsysteme.md#s13-nb-02--supabase-auth)). Diese Einstellung liegt im Dashboard, **nicht** in den Migrationen — ein neu aufgesetztes Projekt hätte sie nicht. | [S1.3](S1-nachbarsysteme.md#s13-nb-02--supabase-auth) |
| Konfigurationswerte | Vercel-Umgebungsvariablen und der öffentliche Supabase-Projektschlüssel; beide öffentlich, kein Geheimnis im Repository. | [`.env.example`](../../.env.example), [A07](../arch/A07-deployment-view.md) |

**Konfigurationshinweis:** Der geheime Service-Role-Key ist keine der oben genannten Flächen — er wird vom Frontend nie verwendet und gehört weder ins Repository noch in die Vercel-Client-Variablen ([A07 §7.1.1](../arch/A07-deployment-view.md#711-produktionsumgebung), [`.env.example`](../../.env.example)).

Weitere Flächen gibt es nicht: LocalCourt schreibt kein eigenes Anwendungslog und nutzt keinen Datei-Storage ([S1.4](S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest)). Die Protokolle der Plattformen (Build-Logs bei Vercel, API- und Auth-Logs im Supabase-Dashboard) sind kurzlebige Diagnosehilfen und kein Zustand, den ein Release überleben müsste.

## S3.4 Erstinbetriebnahme

Die Erstinbetriebnahme ist einmalig, in dieser Reihenfolge:

1. Supabase-Projekt anlegen, Datenbankschema per Migrationen einspielen und die E-Mail-Bestätigung abschalten (S3.3).
2. Vercel-Projekt anlegen und mit dem Git-Repository verbinden; Produktionsbranch ist `main`.
3. Konfigurationswerte `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel setzen — vor dem ersten Build, da Vite sie beim Bauen ersetzt (S3.2).
4. Ersten Build auslösen (Push auf `main`).
5. Über die Produktionsadresse prüfen: Datenzugriff (NB-03), Kartendarstellung (NB-04), Reverse-Geocoding beim Anlegen einer Session (NB-05) und das Erfolgskriterium [SC-01](P1-ziele-rahmenbedingungen.md#p16-erfolgskriterien) — eine Session anlegen, eine andere Person tritt bei.

Schritt 1 muss vor Schritt 4 abgeschlossen sein, weil das gebaute Frontend gegen das Schema spricht; Schritte 2 und 3 sind untereinander frei, aber beide Voraussetzung für Schritt 4.

**Durchführung (Stand 2026-09-19):** Alle fünf Schritte sind erfolgt.

- Supabase-Projekt `uqpjctqedenmjonkqubq` (Organisation LocalCourt, Region `eu-central-1`) mit allen Migrationen aus `supabase/migrations` ([supabase/README.md](../../supabase/README.md)); E-Mail-Bestätigung abgeschaltet.
- Vercel-Team „LocalCourt", Projekt `local-court`, Framework-Preset Vite, Git-Anbindung an `Finn5k/Wirtschaftsinformatik-Projekt-I` mit Produktionsbranch `main`; Konfigurationswerte gesetzt — das ausgelieferte Bundle enthält Projekt-URL und Publishable Key.
- **Produktionsadresse: <https://local-court.vercel.app>.** Nur diese Adresse ist öffentlich. Alle anderen Vercel-Adressen des Projekts (deploymentspezifische URLs, Branch-URLs, Vorschau-Deployments) liegen hinter der Vercel-Anmeldung und sind nur für Teammitglieder erreichbar.
- Prüfung über die Produktionsadresse: DLG-02 listet Sessions aus `v_session`, DLG-04 zeigt den Kartenausschnitt mit geladenen Kacheln, DLG-03 Marker und Kacheln, und die geschützte Route `/sessions/new` leitet unangemeldet nach [B1.5.2](B1-dialogspezifikation.md#b152-weiterleitung-nicht-angemeldeter-nutzer) zu DLG-01 um. Der angemeldete Pfad — Session anlegen mit Reverse-Geocoding, Beitritt, Check-in — ist durch die Nutzung des Teams belegt: Der Datenbestand enthält vom Team angelegte Sessions mit Beitritten und Check-ins, womit SC-01 erfüllt ist.

## S3.5 Laufende Releases

Code-Releases laufen über die Git-Integration von Vercel: Ein Push auf `main` löst automatisch Build und Veröffentlichung aus; reine Dokumentationsänderungen werden dank der `ignoreCommand`-Regel in [`vercel.json`](../../vercel.json) übersprungen und erscheinen bei Vercel als abgebrochene Deployments ([P1.6 SC-07](P1-ziele-rahmenbedingungen.md#p16-erfolgskriterien)). Jeder Push auf einen anderen Branch erzeugt ein Vorschau-Deployment mit eigener, nicht öffentlicher Adresse (S3.4); es ändert die Produktionsadresse nicht. Eine darüber hinausgehende CI-Pipeline für Lint oder Tests ist im MVP nicht eingerichtet (ebenda).

Datenbank-Änderungen laufen unabhängig vom Vercel-Deployment: Neue Migrationen werden nach dem Muster `<UTC-Zeitstempel>_<name>.sql` angelegt und, da kein lokales Supabase-CLI eingerichtet ist, über die Supabase-Verwaltungs-API eingespielt ([supabase/README.md](../../supabase/README.md)). Dieser Schritt ist weder automatisiert noch Teil des Vercel-Deployments. Bringt ein Release beides mit, wird die Migration **vor** dem Merge nach `main` eingespielt — das laufende Frontend spricht bis zum Umschalten gegen das neue Schema, die Migration muss also mit dem alten Frontend verträglich sein.

## S3.6 Rollback und Point of no Return

Frontend-Rollback und die Rücknahme einer Datenbankmigration sind zwei getrennte Fragen:

- **Frontend (Vercel):** Jedes Produktions-Deployment bleibt erhalten; die Produktionsadresse lässt sich im Vercel-Dashboard ohne neuen Build auf ein früheres Deployment umschalten (Instant Rollback, im Free-Tier auf das unmittelbar vorhergehende). Das ist umkehrbar und berührt die Datenbank nicht.
- **Datenbank (Supabase):** Migrationen sind vorwärtsgerichtet; eine Rücknahme ist eine neue, gegenläufige Migration. Weil das Free-Tier keine automatischen Sicherungen anlegt (S3.3), ist eine Migration, die Daten löscht oder umformt, der **Point of no Return** — vor einer solchen Migration ist ein manueller Export (Supabase-CLI `db dump`) die einzige Rückfallebene. Reine Schemaerweiterungen und Rechteänderungen, wie alle bisherigen Migrationen, brauchen das nicht.

## S3.7 Abgrenzung

- **Keine CI-Pipeline für Lint/Tests im MVP** eingerichtet ([P1.6 SC-07](P1-ziele-rahmenbedingungen.md#p16-erfolgskriterien)).
- **Keine Staging-Umgebung**: Architektonisch dokumentiert ist ausschließlich die Produktionsumgebung ([A07 §7.1.1](../arch/A07-deployment-view.md#711-produktionsumgebung)). Vorschau-Deployments und die lokale Entwicklung sind kein Ersatz dafür — es gibt nur ein Supabase-Projekt, gegen das jede Instanz arbeitet; Testdaten landen in der Produktionsdatenbank.
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
| [`INSTALL.md`](../../INSTALL.md) | Handgriffe zu S3: Klonen, Konfiguration, lokaler Start, Prüfschritte, eigenes Supabase-Projekt |
| [docs/spec/README.md](README.md) | B2, S2 als nicht anwendbar dokumentiert |
