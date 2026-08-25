# 4 Lösungsstrategie

## 4.1 Technologie

- **Browser-basierte Single-Page-Application mit React und TypeScript**; Node.js dient ausschließlich als Werkzeuglaufzeit, eine eigene Backend-Schicht ist nicht vorgesehen ([P1.5](../spec/P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) CON-T-02/CON-T-03; [A02](A02-architecture-constraints.md#21-technische-randbedingungen) TECH-02/TECH-03).
- **PostgreSQL über Supabase** als alleinige, maßgebliche Datenquelle; Zugriff ausschließlich über die PostgREST-Schnittstelle ([P1.5](../spec/P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) CON-T-01; [P2.2](../spec/P2-architekturueberblick.md#p22-nachbarsysteme) NB-03; [S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest)).
- **Supabase Auth** als Nachbarsystem für Anmeldung und Sitzungsverwaltung per E-Mail/Passwort; das ausgegebene Zugangstoken (JWT) autorisiert nachfolgende Aufrufe gegen PostgREST ([P2.2](../spec/P2-architekturueberblick.md#p22-nachbarsysteme) NB-02; [S1.3](../spec/S1-nachbarsysteme.md#s13-nb-02--supabase-auth); [A02](A02-architecture-constraints.md#21-technische-randbedingungen) TECH-05).
- **OpenStreetMap und Nominatim** als Nachbarsysteme für Kartendarstellung und Reverse-Geocoding eines Court-Pins ([P2.2](../spec/P2-architekturueberblick.md#p22-nachbarsysteme) NB-04/NB-05; [A02](A02-architecture-constraints.md#21-technische-randbedingungen) TECH-07).

## 4.2 Top-Level-Zerlegung

LocalCourt ist als browserbasierter Client ausgeprägt und integriert die in [A03](A03-context-and-scope.md) dokumentierten vier externen Nachbarsysteme; eine eigene serverseitige Zwischenschicht ist nicht vorgesehen ([P1.5](../spec/P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) CON-T-02/CON-T-03; [P2.1](../spec/P2-architekturueberblick.md#p21-systemkontext)). Jede Verbindung läuft synchron über HTTPS und wird durch genau eine Nutzeraktion ausgelöst; es gibt weder Warteschlangen noch Push-Kanäle ([A03](A03-context-and-scope.md#32-technischer-kontext); [S1.1](../spec/S1-nachbarsysteme.md#s11-konventionen)).

Eine weitergehende Zerlegung des Clients ist auf dieser Ebene nicht eindeutig belegt und bleibt der Bausteinsicht in Kapitel 5 vorbehalten.

## 4.3 Lösungsansätze je Qualitätsziel

[A01](A01-introduction-and-goals.md#12-qualitätsziele) führt drei Qualitätsziele; die folgende Tabelle ordnet ihnen den jeweils belegten Lösungsansatz zu.

| Qualitätsziel | Lösungsansatz | Beleg |
|---|---|---|
| [N1-QA-01](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-01--konsistenz-von-beitritt-und-check-in) Konsistenz von Beitritt und Check-in | Kapazitäts- und statuskritische Schreibvorgänge (Beitritt, Check-in) laufen als atomare Operationen auf der Datenbank statt im Client, sodass Prüfung und Schreibvorgang unteilbar bleiben. | [F3](../spec/F3-anwendungsfunktionen.md#af-01--beitritts--und-kapazitätsregel) AF-01/AF-02 „Atomarität statt Reihenfolgegarantie"; [S1.4](../spec/S1-nachbarsysteme.md#s14-nb-03--supabase-postgrest). |
| [N1-QA-02](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-02--mobile-nutzbarkeit) Mobile Nutzbarkeit | Eine responsive Web-UI deckt Mobile und Desktop mit einem Codebase ab; native Apps sind nicht vorgesehen. | [P1.5](../spec/P1-ziele-rahmenbedingungen.md#p15-rahmenbedingungen-constraints) CON-T-04; [A02](A02-architecture-constraints.md#21-technische-randbedingungen) TECH-04. |
| [N1-QA-03](../spec/N1-nichtfunktionale-anforderungen.md#n1-qa-03--zugriffsschutz-und-datensparsamkeit) Zugriffsschutz und Datensparsamkeit | Supabase Auth stellt die Nutzeridentität (JWT) bereit; Autorisierung erfolgt auf Datenbankebene über Row-Level-Security anhand dieser Identität, nicht über eine eigene Autorisierungsschicht im Client. | [P2.2](../spec/P2-architekturueberblick.md#p22-nachbarsysteme) NB-02; [S1.3](../spec/S1-nachbarsysteme.md#s13-nb-02--supabase-auth); [N2.2](../spec/N2-querschnittskonzepte.md#n22-row-level-security-rls). |

## 4.4 Organisatorischer Ansatz

Budget 0 EUR und Betrieb ausschließlich in Free-/Student-Tiers ([P1.2](../spec/P1-ziele-rahmenbedingungen.md#p12-geschäftsziele) G-05; [A02](A02-architecture-constraints.md#22-organisatorische-randbedingungen) ORG-01) prägen die Wahl verwalteter Cloud-Dienste und die bereits in [4.1](#41-technologie) und [4.2](#42-top-level-zerlegung) beschriebene Systemform. Das Entwicklungsteam entwickelt, deployt und betreibt LocalCourt selbst, ohne separaten Betriebsstakeholder ([A02](A02-architecture-constraints.md#22-organisatorische-randbedingungen) ORG-02).
