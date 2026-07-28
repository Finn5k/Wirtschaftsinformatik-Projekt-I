# Teaminfo & Projektidee

## Projekttitel

LocalCourt – Sport-Sessions auf lokalen Courts organisieren

## Kurzbeschreibung

LocalCourt ist eine Webanwendung zur Organisation spontaner Sport-Sessions auf lokalen Sportplätzen und Courts. Nutzer können Sportorte erfassen, Sessions für bestimmte Sportarten erstellen und anderen Sessions beitreten. Das System verwaltet Teilnehmerlimits (harte Kapazitätsgrenze, keine Warteliste — siehe P1 NG-10), Check-ins und Sessionstatus, damit Freizeit- und Hochschulsport einfacher koordiniert werden können.

## Team

| Name | Studiengang | Rolle | Github-Handle |
|---|---|---|---|
| Afrem Aydin | Wirtschaftsinformatik B.Sc. | Spec / Requirements Lead | AfremAydin |
| Finn Belk | Wirtschaftsinformatik B.Sc. | Project Lead & Backend Lead | Finn5k |
| Hascher Malik | Wirtschaftsinformatik B.Sc. | QA / Test Lead | Hascher16 |
| Chevron Rustler | Wirtschaftsinformatik B.Sc. | Frontend / UI-UX Lead | iamchevyy |

**Rollen-Empfehlung (frei änderbar):** Projektleiter:in, Software Architect, Spec/Requirements Lead, Implementation Lead, QA/Test Lead, DevOps/Build Lead.

## Technologien

- **Sprache(n):** TypeScript, HTML, CSS
- **Frontend:** React, React Router, Tailwind CSS, Leaflet/react-leaflet
- **Persistenz und Backend-Dienste:** Supabase (PostgreSQL, Auth, PostgREST) — kein eigener Anwendungsserver, das Frontend spricht direkt mit der REST-Schnittstelle (siehe [P2](docs/spec/P2-architekturueberblick.md))
- **Build/Tooling:** Vite, npm, ESLint
- **Hosting:** Vercel (Frontend), Supabase (Datenbank und Auth) — jeweils Free-Tier

> Die ursprüngliche Planung nannte Node.js/Express und Docker. Mit dem
> Architekturüberblick [P2](docs/spec/P2-architekturueberblick.md) und den
> Querschnittskonzepten [N2](docs/spec/N2-querschnittskonzepte.md) ist
> entschieden, dass LocalCourt **keinen eigenen Anwendungsserver** betreibt;
> die serverseitige Logik liegt in der Datenbank. Die spätere
> Architekturdokumentation unter `docs/arch/` konkretisiert diesen festgelegten
> Stack, ohne ihn erneut fachlich festzulegen.

## Repository

- **URL:** <https://github.com/Finn5k/Wirtschaftsinformatik-Projekt-I>
- **Sichtbarkeit:** öffentlich

## Eingesetzte KI-Werkzeuge

- ChatGPT / Codex für Dokumentationsentwürfe, Architekturideen und Refactoring
- GitHub Copilot für Code-Vervollständigung in der Implementierung
- Claude (Claude Code) für Spezifikationsentwürfe, Konsistenzprüfung und Recherche
