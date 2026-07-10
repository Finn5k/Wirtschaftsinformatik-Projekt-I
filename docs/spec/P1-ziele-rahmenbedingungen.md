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
| **G-01** | **Community Building ermöglichen** | Menschen aus der Region sollen sich entdecken, vernetzen und zusammen aktivieren können. |
| **G-02** | **Sportaktivitäten sichtbar machen** | Sportler müssen lokale Möglichkeiten schnell und zentral finden können, ohne externe Tools oder Gruppen zu nutzen. |
| **G-03** | **Niedrige Einstiegshürde** | Sessions sollten in unter 2 Minuten erstellt und gefunden werden können (einfache UX, keine technischen Barrieren). |
| **G-04** | **Gesundheitsförderung unterstützen** | Die Plattform soll als Katalysator für regelmäßige, lokale Sportaktivität fungieren. |
| **G-05** | **Nachhaltigkeitsimperativ: Im Free-Tier-Budget arbeiten** | Das System muss im Rahmen von Student-/Free-Services operable sein — keine Premium-Abhängigkeiten, minimale externe Kosten. |

---

## P1.3 Stakeholder und Nutzer

| Rolle | Beschreibung | Interaktion mit LocalCourt |
|-------|-------------|---------------------------|
| **Operator (Team LocalCourt)** | 4-köpfiges Entwicklungsteam der Hochschule (Spec Lead, Project Lead, QA, Frontend). | Entwicklung, Deployment, Betrieb im Free-Tier. Keine direkten Nutzer aus diesem Kreis. |
| **Primäre Nutzer** | Sportbegeisterte im Alter von 18–30 Jahren (Amateur und Profi-Level). Erwartete Primär-Demografie. | Erstellen, entdecken, beitreten Sessions. Verwalten Profil und Sport-Präferenzen. |
| **Sekundäre Nutzer** | Sportler außerhalb der 18–30-Altersgruppe (offen für alle Altersgruppen). | Gleiche Funktionen wie primäre Nutzer. |
| **Trainings-/Vereinsgruppen** | Strukturierte Sportgruppen (z.B. Hochschulsport, lokale Clubs). | Erstellen regelmäßige Sessions. Verwalten Teilnehmerlisten und Court-Reservierungen. |
| **Cloud-Provider (Free-Tier)** | Hosting und Datenbankinfrastruktur im kostenlosen Segment. | Stellt Rechenkapazität und Datenspeicher bereit. Begrenzt maximale Nutzerzahl und API-Calls. |

---

## P1.4 Scope

### In-Scope

- **Web-UI für Session-Verwaltung**: Erstellen, bearbeiten, löschen, anschauen, beitreten.
- **Court-/Sportplatz-Verzeichnis**: Erfassen, durchsuchen, filtern nach Sportart und Location.
- **Teilnehmer-Verwaltung**: Check-In und Kapazitätsverwaltung (max. X Teilnehmer pro Session). Wartelisten sind bewusst ausgeschlossen (siehe NG-10).
- **Session-Status-Management**: Status-Lifecycle (geplant, aktiv, abgeschlossen, storniert).
- **Nutzer-Profile**: Basis-Informationen (Name, Profil-Bild, Sportarten-Interessen), Sichtbarkeit regulierbar.
- **Responsive Design**: Mobile & Desktop gleichwertig unterstützt.
- **Authentifizierung**: Einfache Nutzer-Anmeldung (E-Mail + Passwort oder OAuth Third-Party).

### Out of Scope

| ID | Nicht-Ziel | Begründung |
|----|-----------|-----------|
| **NG-01** | Zahlungssystem / In-App-Purchases | Community-fokussiert, keine monetäre Transaktion. Budget-Constraint: Payment-Gateway kostet. |
| **NG-02** | Direkter Nachrichtenkanal zwischen Nutzern | Koordination läuft über Session-Kommentare oder externe Tools (Signal, WhatsApp). Reduziert Komplexität. |
| **NG-03** | Video-Chat / Live-Streaming | Out of scope für MVP. Bedarf gesamte Infrastruktur (WebRTC/HLS), nicht Free-Tier-compatible. |
| **NG-04** | Rating- / Review-System für Nutzer | Verhindert soziale Diskriminierung und Reputation-Spam in früher Phase. |
| **NG-05** | Virtuelle Charaktere / Skins / Gamification | Nicht MVP-relevant. Kann später optional hinzugefügt werden, falls Zeit bleibt. |
| **NG-06** | Professional Booking für kommerzielle Anbieter | LocalCourt ist für informelle/spontane Koordination, nicht für kommerzielles Court-Booking. |
| **NG-07** | Native Mobile Apps (iOS, Android) | Responsive Web-UI deckt Mobile vollständig ab. Native Apps → zusätzlicher Build-, Verteil-, und Support-Overhead. |
| **NG-08** | KI-Integration (z.B. Recommendation Engine) | Kein KI-Budget, keine speziellen Datenquellen verfügbar. Community-Discovery reicht. |
| **NG-09** | Daten-Migration / Legacy-Import | Greenfield-Projekt, keine Vorgänger-Daten. |
| **NG-10** | Wartelisten bei vollen Sessions | Eine Warteliste wäre nur mit einem Benachrichtigungskanal ("Platz frei") sinnvoll. Benachrichtigungen (E-Mail/SMS/Push) sind out of scope (NG-02, Free-Tier-Constraint CON-T-05) und in F1 ausgeschlossen. Ohne Rückkanal bringt eine Warteliste keinen fachlichen Nutzen. Kapazität ist daher eine harte Grenze (siehe F3, AF-01). Ursprünglich in P1 in-scope genannt; nach Abgleich mit F1/F2 bewusst zurückgezogen. |

---

## P1.5 Rahmenbedingungen (Constraints)

### Technische Constraints

| ID | Constraint | Rationale |
|----|-----------|-----------|
| **CON-T-01** | **Datenbank: PostgreSQL nur** | Etabliertes, Free-Tier-fähiges Relationensystem (z.B. Render, Railway, Supabase free tier). Verteilte NoSQL-Systeme nicht im Budget. |
| **CON-T-02** | **Hosting im Free/Student-Tier** | Budget = 0 EUR. Deployment nur auf kostenlosen Plattformen (Vercel, Render, Railway, Firebase, etc.). Impliziert: Keine Dedicated Server, keine Custom Infra. |
| **CON-T-03** | **Tech Stack: React, Node.js, TypeScript** | Team hat TypeScript-Kenntnis. Stack ist Free-Tier-compatible und hat breite Verfügbarkeit in Student Services. |
| **CON-T-04** | **Responsive Web-UI, kein Native App** | Spart Bundle-Size, Build-Time, App-Store-Approval-Overhead. Ein Codebase für alle Geräte (Desktop, Tablet, Smartphone). |
| **CON-T-05** | **Maximale Nutzerzahl durch Free-Tier limitiert** | Konkrete Limit je nach Provider (z.B. Supabase: ~500 aktive Nutzer im free plan, Render: ~100 Dyno-Stunden/Monat). System muss diese Grenzen achten und transparent kommunizieren. |

### Organisatorische Constraints

| ID | Constraint | Rationale |
|----|-----------|-----------|
| **CON-O-01** | **4-köpfiges Team** | Feste Resourcenverfügbarkeit. Keine unbegrenzten Personaloptionen. |
| **CON-O-02** | **Hochschul-Projekt, impliziter Zeitrahmen (~6 Monate)** | Semester-basierte Lieferrhythmen. Nach Projektende Support/Wartung unklar. |
| **CON-O-03** | **Dokumentation nach Siedersleben-Schema** | Verpflichtend für Hochschul-Projekt: P1 (Ziele), M1/M2 (Architektur), N1/N2 (Nichtfunktional), A1/A2 (Funktionale Architektur), etc. |

### Datenschutz & Sicherheit

| ID | Constraint | Rationale |
|----|-----------|-----------|
| **CON-D-01** | **DSGVO-Compliance** | EU-Projekt mit potenziell EU-Bürgern als Nutzer. Datenschutzerklärung, Consent-Banner, Right-to-Delete-Implementierung erforderlich. |
| **CON-D-02** | **Keine Speicherung von Zahlungsdaten** | Out-of-Scope (NG-01). Vereinfacht Compliance (PCI-DSS nicht nötig). |
| **CON-D-03** | **Authentifizierung ohne SMS** | SMS-Gateway = kostenpflichtig. Alternative: E-Mail oder OAuth. |

---

## P1.6 Erfolgskriterien

| ID | Kriterium | Zielwert / Definition |
|----|-----------|---------------------|
| **SC-01** | **MVP Go-Live** | System ist deploybar und funktionsfähig; Mind. 1 Session kann erstellt und anderen beigetreten werden. |
| **SC-02** | **Session-Creation Workflow UX** | Neue Session wird in < 2 Minuten aus dem Nichts erstellt (inklusive Court-Auswahl, Teilnehmerlimit, Uhrzeit). |
| **SC-03** | **Session-Discovery Speed** | Nutzer findet 3+ passende Sessions in seiner Region in < 3 Minuten (via Filter/Suche). |
| **SC-04** | **System Stability** | System läuft ohne ungeplante Ausfälle im Free-Tier-Budget und hält Last von ~100–500 aktiven Nutzern aus (je nach Provider-Plan). |
| **SC-05** | **Mobile Usability** | Viewport ≤ 768px: Alle Core-Workflows (Session finden, beitreten, Profile sehen) sind intuitive und ungebrochen. |
| **SC-06** | **Team-Acceptance** | Spec, Implementation, QA, und Frontend signalisieren Zufriedenheit mit Feature-Vollständigkeit und Code-Quality. |
| **SC-07** | **Deployment Automation** | Deployment auf Production erfolgt automatisiert via GitHub Actions / CI-Pipeline. Manuelle SSH-Steps nicht erforderlich. |

---

## Zusammenfassung

LocalCourt ist eine **webbasierte Plattform zur dezentralisierten Koordination lokaler Sportaktivitäten**. Das System richtet sich primär an Sportbegeisterte im Alter von 18–30 Jahren und adressiert das Problem unzentralisierter Kommunikation. Erfolg wird am Erreichen von UX-Zielen, System-Stabilität, und Team-Acceptance gemessen.

Die Mission wird unter klaren Budget-, Technologie-, und zeitlichen Constraints realisiert: Free-Tier-only, PostgreSQL, React/Node.js, und impliziter 6-Monatiger Hochschul-Rahmen. Explizit außer Scope bleiben Zahlungssysteme, User-Messaging, AI-Features, und Commercial-Booking — diese hätten den MVP verzögert ohne strategischen Mehrwert.

---

## Referenzen

- **Siedersleben-Schema**: Strukturierte Softwarespezifikation in Bausteine (P1, M1–M2, N1–N2, A1–A2, usw.)
- **Team & Rollen**: Siehe `TEAMINFO.md` im Repository-Root
- **Technologie-Details**: Siehe zukünftige M1/M2 (Architektur)
- **Beispiel**: [Herold P1 — Goals and Constraints](https://github.com/carstenlucke/herold/blob/main/docs/spec/P1-ziele-rahmenbedingungen.md) (English reference)
