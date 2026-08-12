# P1 — Ziele und Rahmenbedingungen

Grundstein der LocalCourt-Spezifikation nach Siedersleben-Schema. Antwortet auf folgende Fragen: Warum wird das System gebaut, für wen, und welche Constraints rahmen den Lösungsraum?

---

## P1.1 Mission

LocalCourt verbindet Menschen aus der Region, um gemeinsam Sport zu treiben. Die Plattform bietet einen zentralen Überblick über lokale Sportaktivitäten und ermöglicht es Nutzern, spontane oder geplante Sport-Sessions auf Courts und Sportplätzen zu finden, zu erstellen und daran teilzunehmen.

LocalCourt löst das Problem der dezentralisierten Koordination: Heute brauchen Sportgruppen WhatsApp-Gruppen, Facebook-Events oder direkte Anrufe, um sich zu organisieren. LocalCourt schafft einen einzigen Ort, an dem Organisatoren Sessions ankündigen und Teilnehmer Möglichkeiten entdecken können — ob spontan (heute noch spielen) oder geplant (nächste Woche).

---

## P1.2 Geschäftsziele

| ID | Ziel | Begründung |
|----|------|-----------|
| **G-01** | **Community Building ermöglichen** | Menschen aus der Region sollen sich entdecken, vernetzen und gemeinsam sportlich aktiv werden können. |
| **G-02** | **Sportaktivitäten sichtbar machen** | Sportler müssen lokale Möglichkeiten schnell und zentral finden können, ohne externe Tools oder Gruppen zu nutzen. |
| **G-03** | **Niedrige Einstiegshürde** | Sessions sollten in unter 2 Minuten erstellt und gefunden werden können (einfache UX, keine technischen Barrieren). |
| **G-04** | **Gesundheitsförderung unterstützen** | Die Plattform soll als Katalysator für regelmäßige, lokale Sportaktivität fungieren. |
| **G-05** | **Nachhaltigkeitsimperativ: Im Free-Tier-Budget arbeiten** | Das System muss im Rahmen von Student-/Free-Services betreibbar sein — keine Premium-Abhängigkeiten, minimale externe Kosten. |

---

## P1.3 Stakeholder und Nutzer

| Rolle | Beschreibung | Interaktion mit LocalCourt |
|-------|-------------|---------------------------|
| **Operator (Team LocalCourt)** | 4-köpfiges Entwicklungsteam der Hochschule (Spec Lead, Project Lead, QA, Frontend). | Entwicklung, Deployment und Betrieb; nicht Teil der fachlichen Primärnutzergruppen. |
| **Nutzer** | Sportinteressierte Personen, die LocalCourt zur Suche und Teilnahme an lokalen Sport-Sessions nutzen. | Sessions entdecken und beitreten, Profil und Sportpräferenzen verwalten. |
| **Organisator** | Nutzer, die eigene Sport-Sessions erstellen und organisieren. | Sessions erstellen und verwalten; Teilnehmer und Check-ins einsehen. |
| **Trainings-/Vereinsgruppen** | Strukturierte Sportgruppen (z.B. Hochschulsport, lokale Clubs). | Organisieren regelmäßige Sessions und verwalten Teilnehmerlisten. |
| **Cloud-Provider (Free-Tier)** | Hosting und Datenbankinfrastruktur im kostenlosen Segment. | Stellt Rechenkapazität und Datenspeicher bereit. Begrenzt maximale Nutzerzahl und API-Calls. |
| **External APIs** | Externe Dienste, die LocalCourt zur Bereitstellung bestimmter Funktionen nutzt. | Bereitstellung bzw. Austausch von Daten über definierte Schnittstellen. |

---

## P1.4 Scope

### In-Scope

- **Web-UI für Session-Verwaltung**: Erstellen, anschauen, beitreten (Bearbeiten, Absagen und Löschen bestehender Sessions sind im MVP bewusst nicht vorgesehen, siehe [F2](F2-anwendungsfaelle.md#uc-06--session-erstellen)/[F3](F3-anwendungsfunktionen.md)).
- **Court-/Sportplatz-Verzeichnis**: Erfassen über Kartenpin und Reverse-Geocoding, durchsuchen und nach Sportart und Ort filtern.
- **Teilnehmer-Verwaltung**: Check-In und Kapazitätsverwaltung (vom Organisator festgelegte maximale Teilnehmerzahl pro Session). Wartelisten sind bewusst ausgeschlossen (siehe NG-10).
- **Session-Status-Management**: Status-Lifecycle (geplant, aktiv, abgeschlossen), automatisch aus Startzeitpunkt und Dauer berechnet.
- **Nutzer-Profile**: Basisinformationen (Name, Heimatort, Sportarten-Interessen) bearbeiten und ein vorhandenes Profilbild anzeigen. Upload und Bearbeitung des Profilbilds sind nicht Teil des MVP (siehe [B1 DLG-08](B1-dialogspezifikation.md#b148-dlg-08--profil)).
- **Responsive Design**: Mobile & Desktop gleichwertig unterstützt.
- **Authentifizierung**: Einfache Nutzer-Anmeldung mit E-Mail und Passwort. OAuth/Social-Login ist nicht Teil des MVP (siehe [S1.3](S1-nachbarsysteme.md#s13-nb-02--supabase-auth)).

### Out of Scope

| ID | Nicht-Ziel | Begründung |
|----|-----------|-----------|
| **NG-01** | Zahlungssystem / In-App-Purchases | Community-fokussiert, keine monetäre Transaktion. Budget-Constraint: Payment-Gateway kostet. |
| **NG-02** | Direkter Nachrichtenkanal zwischen Nutzern | Koordination außerhalb der Session-Informationen erfolgt über externe Tools (Signal, WhatsApp). Reduziert Komplexität. |
| **NG-03** | Video-Chat / Live-Streaming | Out of scope für MVP. Bedarf gesamte Infrastruktur (WebRTC/HLS), nicht Free-Tier-kompatibel. |
| **NG-04** | Rating- / Review-System für Nutzer | Verhindert soziale Diskriminierung und Reputation-Spam in früher Phase. |
| **NG-05** | Virtuelle Charaktere / Skins / Gamification | Nicht MVP-relevant. Kann später optional hinzugefügt werden, falls Zeit bleibt. |
| **NG-06** | Professional Booking für kommerzielle Anbieter | LocalCourt ist für informelle/spontane Koordination, nicht für kommerzielles Court-Booking. |
| **NG-07** | Native Mobile Apps (iOS, Android) | Responsive Web-UI deckt Mobile vollständig ab. Native Apps → zusätzlicher Build-, Verteil-, und Support-Overhead. |
| **NG-08** | KI-Integration (z.B. Recommendation Engine) | Kein KI-Budget, keine speziellen Datenquellen verfügbar. Community-Discovery reicht. |
| **NG-09** | Daten-Migration / Legacy-Import | Greenfield-Projekt, keine Vorgänger-Daten. |
| **NG-10** | Wartelisten bei vollen Sessions | Eine Warteliste wäre nur mit einem Benachrichtigungskanal ("Platz frei") sinnvoll. Benachrichtigungen (E-Mail/SMS/Push) sind out of scope (NG-02, Free-Tier-Constraint CON-T-05) und in F1 ausgeschlossen. Ohne Rückkanal bringt eine Warteliste keinen fachlichen Nutzen. Kapazität ist daher eine harte Grenze (siehe F3, AF-01). Ursprünglich in P1 in-scope genannt; nach Abgleich mit F1/F2 bewusst zurückgezogen. |
| **NG-11** | Bearbeiten, Absagen oder Löschen bestehender Sessions | Diese Aktionen würden zusätzliche Anwendungsfälle und Regeln für bereits beigetretene Teilnehmer erfordern. Im MVP bleiben erstellte Sessions unverändert und enden ausschließlich zeitbasiert. |

---

## P1.5 Rahmenbedingungen (Constraints)

### Technische Constraints

| ID | Constraint | Rationale |
|----|-----------|-----------|
| **CON-T-01** | **Datenbank: PostgreSQL über Supabase** | Etabliertes, Free-Tier-fähiges Relationensystem; verteilte NoSQL-Systeme liegen außerhalb des Budgets. |
| **CON-T-02** | **Hosting im Free/Student-Tier** | Budget = 0 EUR. Frontend-Deployment über Vercel und Backend-Dienste über Supabase im jeweiligen Free-Tier. Impliziert: keine dedizierten Server und keine eigene Infrastruktur. |
| **CON-T-03** | **Tech Stack: React und TypeScript; Node.js als Werkzeuglaufzeit** | Das Team verfügt über TypeScript-Kenntnisse. Node.js wird für Build- und Entwicklungswerkzeuge verwendet; eine eigene Node.js-Backend-Schicht ist nicht vorgesehen ([P2](P2-architekturueberblick.md)). |
| **CON-T-04** | **Responsive Web-UI, kein Native App** | Spart Bundle-Size, Build-Time, App-Store-Approval-Overhead. Ein Codebase für alle Geräte (Desktop, Tablet, Smartphone). |
| **CON-T-05** | **Maximale Nutzerzahl durch Free-Tier limitiert** | Konkrete Grenzen richten sich nach den Free-Tier-Kontingenten von Supabase und Vercel. Das System muss diese Grenzen beachten und transparent kommunizieren. |

---

## P1.6 Erfolgskriterien

| ID | Kriterium | Zielwert / Definition |
|----|-----------|---------------------|
| **SC-01** | **MVP Go-Live** | System ist deploybar und funktionsfähig; Mind. 1 Session kann erstellt und anderen beigetreten werden. |
| **SC-02** | **Session-Creation Workflow UX** | Neue Session wird in < 2 Minuten aus dem Nichts erstellt (inklusive Court-Auswahl, Teilnehmerlimit, Uhrzeit). |
| **SC-03** | **Session-Discovery Speed** | Nutzer findet 3+ passende Sessions in seiner Region in < 3 Minuten (via Filter/Suche). |
| **SC-04** | **System Stability** | System läuft ohne ungeplante Ausfälle im Free-Tier-Budget und hält Last von ~100–500 aktiven Nutzern aus (je nach Provider-Plan). |
| **SC-05** | **Mobile Usability** | Viewport ≤ 768px: Alle Kernworkflows (Session finden, beitreten, Profile sehen) sind intuitiv und ohne Brüche nutzbar. |
| **SC-06** | **Team-Acceptance** | Spec, Implementation, QA, und Frontend signalisieren Zufriedenheit mit Feature-Vollständigkeit und Codequalität. |
| **SC-07** | **Deployment Automation** | Deployment auf Production erfolgt automatisiert über die Git-Integration von Vercel: Ein Push auf `main` löst Build und Veröffentlichung aus, reine Dokumentationsänderungen werden übersprungen. Keine manuellen Deployment-Schritte. Eine darüber hinausgehende CI-Pipeline für Lint und Tests ist im MVP nicht eingerichtet. |

---

## Zusammenfassung

LocalCourt ist eine **webbasierte Plattform zur dezentralisierten Koordination lokaler Sportaktivitäten**. Das System richtet sich primär an Sportbegeisterte im Alter von 18–30 Jahren und adressiert das Problem unzentralisierter Kommunikation. Erfolg wird am Erreichen von UX-Zielen, System-Stabilität, und Team-Acceptance gemessen.

Die Mission wird unter klaren Budget-, Technologie-, und zeitlichen Constraints realisiert: Free-Tier-only, PostgreSQL, React/Node.js, und impliziter 6-monatiger Hochschul-Rahmen. Explizit außer Scope bleiben Zahlungssysteme, Nutzer-Messaging, AI-Features, und kommerzielles Booking — diese hätten den MVP verzögert ohne strategischen Mehrwert.

---

## Referenzen

- **Siedersleben-Schema**: strukturierte Softwarespezifikation in Bausteine wie P1/P2, F1–F3, D1/D2, B1–B3, S1–S3, N1/N2 und E1/E2.
- **Team & Rollen**: Siehe [`TEAMINFO.md`](../../TEAMINFO.md) im Repository-Root
- **Architekturdetails**: siehe Architekturdokumentation nach arc42 unter `docs/arch/`
- **Beispiel**: [Herold P1 — Goals and Constraints](https://github.com/carstenlucke/herold/blob/main/docs/spec/P1-ziele-rahmenbedingungen.md) (English reference)

---

## P1.7 Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | GitHub Copilot / Claude Code / Codex |
| Verwendung | Entwurf des P1-Bausteins: Mission, Geschäftsziele, Stakeholder, Scope, Rahmenbedingungen und Erfolgskriterien. Claude Code (Claude Sonnet 5) zudem für zwei Konsistenz-Durchgänge (2026-07-26): Scope-Widersprüche zu F2/F3/D1/B1 in P1.4 (Bearbeiten/Löschen, Teilnehmerlimit-Platzhalter, Profil-Sichtbarkeit) aufgelöst; Authentifizierung auf E-Mail und Passwort festgelegt. Codex grenzte am 2026-07-29 Bearbeiten, Absagen, Löschen und Profilbildbearbeitung als Nicht-MVP ab und nahm Reverse-Geocoding in den Scope auf. |
| Prüfung | Inhalte wurden gegen die Projektidee, [TEAMINFO](../../TEAMINFO.md), bestehende Spezifikationsbausteine, Repository-Vorgaben und Teamentscheidungen geprüft und manuell überarbeitet. Die Stack-Angaben wurden insbesondere mit P2 und der Root-README abgeglichen. Die fachliche Verantwortung für Inhalt und Freigabe verbleibt beim Team. |
