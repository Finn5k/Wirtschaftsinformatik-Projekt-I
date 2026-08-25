# 2 Randbedingungen

## 2.1 Technische Randbedingungen

| ID | Randbedingung | Quelle |
|---|---|---|
| TECH-01 | PostgreSQL über Supabase als Datenbank | [P1.5](../spec/P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) CON-T-01 |
| TECH-02 | Hosting im Free-/Student-Tier: Vercel (Frontend), Supabase (Backend-Dienste); keine dedizierten Server | [P1.5](../spec/P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) CON-T-02 |
| TECH-03 | React und TypeScript; Node.js ausschließlich als Werkzeuglaufzeit, keine eigene Node.js-Backend-Schicht | [P1.5](../spec/P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) CON-T-03 |
| TECH-04 | Responsive Web-UI statt native Apps | [P1.5](../spec/P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) CON-T-04 |
| TECH-05 | Supabase Auth (E-Mail/Passwort) als Nachbarsystem für die Authentifizierung | [P2.2](../spec/P2-architekturueberblick.md#p22-nachbarsysteme) NB-02, [S1.3](../spec/S1-nachbarsysteme.md#s13-nb-02--supabase-auth) |
| TECH-06 | Supabase PostgREST als Nachbarsystem für den fachlichen Datenzugriff | [P2.2](../spec/P2-architekturueberblick.md#p22-nachbarsysteme) NB-03, [S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest) |
| TECH-07 | OpenStreetMap und Nominatim als Nachbarsysteme für Karten und Reverse-Geocoding | [P2.2](../spec/P2-architekturueberblick.md#p22-nachbarsysteme) NB-04/NB-05, [S1.5](../spec/S1-nachbarsysteme.md#s15-nb-04--openstreetmap-tiles), [S1.6](../spec/S1-nachbarsysteme.md#s16-nb-05--nominatim-reverse-geocoding) |

## 2.2 Organisatorische Randbedingungen

| ID | Randbedingung | Quelle |
|---|---|---|
| ORG-01 | Budget 0 EUR; Betrieb ausschließlich in Free-/Student-Tiers | [P1.2](../spec/P1-ziele-rahmenbedingungen.md#p12-geschäftsziele) G-05, [P1.5](../spec/P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) CON-T-02 |
| ORG-02 | Operator ist das Entwicklungsteam selbst; es entwickelt, deployt und betreibt LocalCourt in einer Hand | [P1.3](../spec/P1-ziele-rahmenbedingungen.md#p13-stakeholder-und-nutzer) |
| ORG-03 | Greenfield-Projekt ohne Altdaten oder Legacy-Integration | [P1.4](../spec/P1-ziele-rahmenbedingungen.md#p14-scope) NG-09 |

## 2.3 Konventionen

| ID | Konvention | Quelle |
|---|---|---|
| CONV-01 | Spezifikation nach Siedersleben-Schema unter `docs/spec/` mit stabilen IDs als durchgängige Referenz (`GP-nn`, `UC-nn`, `AF-nn`, `G-nn`, `NG-nn`, `DLG-nn`, `NB-nn`, `N1-QA-nn`) | [CLAUDE.md](../../CLAUDE.md), Abschnitt „Spezifikation nach Siedersleben"; [E1](../spec/E1-leseanleitung.md) |
| CONV-02 | Dokumentationssprache Deutsch; Tabellen/Listen vor Prosa; Querverweise zwischen Bausteinen als explizite Markdown-Links | [CLAUDE.md](../../CLAUDE.md); [docs/spec/README.md](../spec/README.md#hinweise), Abschnitt „Hinweise" |
| CONV-03 | Architekturdokumentation in Anlehnung an arc42; ein Kapitel referenziert die Spezifikation, statt sie zu wiederholen | [docs/arch/README.md](README.md), Abschnitt 1 „Zweck und Abgrenzung"; vorgelebt in [A01](A01-introduction-and-goals.md) |
