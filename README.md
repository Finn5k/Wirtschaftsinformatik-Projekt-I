# LocalCourt

**Sport-Sessions auf lokalen Courts finden, erstellen und organisieren.**

LocalCourt ist eine Webanwendung zur dezentralisierten Koordination lokaler
Sportaktivitäten. Nutzer finden spontane oder geplante Sport-Sessions in ihrer
Region auf einer Karte, treten ihnen bei, und Organisatoren erstellen Sessions,
verwalten Teilnehmerlimits und wickeln den Check-in per QR-Code oder PIN ab.

> **Status:** Hochschulprojekt (THM, Wirtschaftsinformatik Projekt I) —
> Spezifikation, Architektur und **MVP-Implementierung** stehen: Alle zwölf
> Anwendungsfälle aus F2 laufen gegen Supabase. Die Spezifikation nach
> Siedersleben-Schema liegt unter [`docs/spec/`](docs/spec/README.md), die
> Architektur nach arc42 unter [`docs/arch/`](docs/arch/README.md); die
> verbliebenen Abweichungen stehen in
> [B1.6](docs/spec/B1-dialogspezifikation.md#b16-abweichungen-der-umsetzung).

## Kernfunktionen (MVP)

- **Session-Discovery:** Sessions nach Ort und Sportart suchen; Anzeige als
  Liste und auf einer OpenStreetMap-Karte.
- **Session-Erstellung:** Sportart, Sportort, Zeit, Dauer und Teilnehmerlimit
  festlegen (Ziel: < 2 Minuten).
- **Beitritt mit harter Kapazitätsgrenze:** kein Überbuchen, keine Warteliste.
- **Check-in vor Ort:** per QR-Code oder 4-stelliger PIN (gleichwertig).
- **Eigene Sessions & Historie:** Überblick über beigetretene und organisierte
  Sessions; abgeschlossene Sessions read-only.
- **Profil & Sportpräferenzen** für gezieltere Suche.

Bewusst **außer Scope** (MVP): Benachrichtigungen, Direktnachrichten,
Wartelisten, Ratings, Zahlungen, native Apps. Details in
[`docs/spec/P1`](docs/spec/P1-ziele-rahmenbedingungen.md).

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS 4 |
| Karte | Leaflet / react-leaflet (OpenStreetMap) |
| Routing | react-router |
| Icons | lucide-react |
| Backend | Supabase — PostgreSQL, Auth, PostgREST ([Schema](supabase/README.md)) |
| Tooling | ESLint, npm |

> Das Datenbankschema mit RLS-Policies und den atomaren RPCs liegt unter
> [`supabase/migrations/`](supabase/migrations); das Frontend spricht
> ausschließlich über die Service-Schicht (`src/services/`) dagegen. Für den
> lokalen Start werden `VITE_SUPABASE_URL` und `VITE_SUPABASE_PUBLISHABLE_KEY`
> in `.env.local` gebraucht (Vorlage: [`.env.example`](.env.example)). Der
> verbindliche Stack ist in
> [P2 — Architekturüberblick](docs/spec/P2-architekturueberblick.md) beschrieben.

## Schnellstart

Voraussetzungen: Node.js (LTS) und npm.

```bash
npm install      # Abhängigkeiten installieren
npm run dev      # Dev-Server (Vite) starten
npm run build    # Produktionsbuild (tsc + vite build)
npm run lint     # ESLint
npm run preview  # Produktionsbuild lokal ansehen
```

## Projektstruktur

```
.
├── src/                 # React-Frontend (TypeScript)
├── supabase/
│   └── migrations/      # Datenbankschema, RLS-Policies, atomare RPCs
├── docs/
│   ├── spec/            # Spezifikation nach Siedersleben (P1, P2, F1–F3, D1, D2, S1, …)
│   ├── arch/            # Architektur nach arc42 (A01–A09, A12) mit ADRs
│   └── frontend.md      # Umsetzungsstand je Dialog
├── CLAUDE.md            # Projektkonventionen (Commits, Branches, Spec-Schema)
├── AGENTS.md            # Verweis auf CLAUDE.md für weitere KI-Werkzeuge
├── TEAMINFO.md          # Team, Rollen, Projektidee
└── README.md
```

## Dokumentation

Die Spezifikation folgt dem **Siedersleben-Schema**. Der
[`Spezifikationsindex`](docs/spec/README.md) ist die zentrale Übersicht über
alle Bausteine und deren aktuellen Bearbeitungsstand.

## Konventionen

- **Commits:** [Conventional Commits 1.0.0](https://www.conventionalcommits.org/de/v1.0.0/)
- **Branches:** `<type>/<kurzbeschreibung>`, Merge nach `main` per Pull Request
- Details in [`CLAUDE.md`](CLAUDE.md).

## Team

| Name | Rolle | GitHub |
|---|---|---|
| Afrem Aydin | Spec / Requirements Lead | [@AfremAydin](https://github.com/AfremAydin) |
| Finn Belk | Project & Backend Lead | [@Finn5k](https://github.com/Finn5k) |
| Hascher Malik | QA / Test Lead | [@Hascher16](https://github.com/Hascher16) |
| Chevron Rustler | Frontend / UI-UX Lead | [@iamchevyy](https://github.com/iamchevyy) |

## Eingesetzte KI-Werkzeuge

Der Einsatz von KI-/Assistenzwerkzeugen ist zentral und projektweit in
[docs/README.md, Abschnitt „Deklaration von Hilfsmitteln"](docs/README.md#deklaration-von-hilfsmitteln)
dokumentiert (Werkzeuge, Einsatzbereiche, Prüfung/Verantwortung). Alle
KI-Beiträge werden manuell geprüft und überarbeitet; die fachliche
Verantwortung bleibt beim Team.
