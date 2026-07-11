# LocalCourt

**Sport-Sessions auf lokalen Courts finden, erstellen und organisieren.**

LocalCourt ist eine Webanwendung zur dezentralisierten Koordination lokaler
Sportaktivitäten. Nutzer finden spontane oder geplante Sport-Sessions in ihrer
Region auf einer Karte, treten ihnen bei, und Organisatoren erstellen Sessions,
verwalten Teilnehmerlimits und wickeln den Check-in per QR-Code oder PIN ab.

> **Status:** Hochschulprojekt (THM, Wirtschaftsinformatik Projekt I) —
> derzeit in der **Spezifikationsphase**. Die vollständige Spezifikation nach
> Siedersleben-Schema liegt unter [`docs/spec/`](docs/spec/README.md).

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
| Backend (geplant) | Supabase — PostgreSQL, Auth, PostgREST |
| Tooling | ESLint, npm |

> Backend/Persistenz sind spezifiziert, aber noch nicht im Code verdrahtet.
> Verbindlich festgelegt wird der Stack in der Architekturbeschreibung.

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
├── docs/
│   ├── spec/            # Spezifikation nach Siedersleben (P1, P2, F1–F3, D1, D2, S1, …)
│   └── frontend.md      # Frontend-Notizen
├── CLAUDE.md            # Projektkonventionen (Commits, Branches, Spec-Schema)
├── TEAMINFO.md          # Team, Rollen, Projektidee
└── README.md
```

## Dokumentation

Die Spezifikation folgt dem **Siedersleben-Schema**. Einstieg und Baustein-
Übersicht: [`docs/spec/README.md`](docs/spec/README.md). Fertige Bausteine:
Ziele & Rahmenbedingungen (P1), Architekturüberblick (P2), Geschäftsprozesse
(F1), Anwendungsfälle (F2), Anwendungsfunktionen (F3), Datenmodell (D1) und
Datentypenverzeichnis (D2).

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

Im Projekt werden KI-Werkzeuge zur Unterstützung eingesetzt und offengelegt:

- **ChatGPT / Codex** — Dokumentations- und Spezifikationsentwürfe, Recherche
- **Claude (Claude Code)** — Spezifikationsentwürfe, Konsistenzprüfung, Recherche
- **GitHub Copilot** — Code-Vervollständigung in der Implementierung

Alle KI-Beiträge werden manuell geprüft und überarbeitet; die einzelnen
Spec-Bausteine weisen die konkrete Nutzung im Abschnitt „Eingesetzte
KI-Werkzeuge" aus.
