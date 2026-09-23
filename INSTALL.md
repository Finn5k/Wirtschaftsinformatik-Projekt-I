# Installation und Inbetriebnahme

Diese Anleitung bringt LocalCourt aus einem frischen Klon zum Laufen. Sie
beschreibt die Handgriffe; was für die Inbetriebnahme fachlich gilt
(persistente Zustände, Rollback, Point of no Return), steht in
[S3 — Inbetriebnahme](docs/spec/S3-inbetriebnahme.md).

LocalCourt hat keinen eigenen Server: Das Frontend spricht direkt mit einem
Supabase-Projekt ([A07](docs/arch/A07-deployment-view.md)). Lokal wird deshalb
nur der Vite-Dev-Server gestartet.

## 1. Voraussetzungen

| Werkzeug | Version |
|---|---|
| Node.js | 22 ab 22.13 oder ab 24 (Node 23 unterstützt ESLint 10 nicht); geprüft mit 24.20.0 |
| npm | liegt Node bei; geprüft mit 11.19.0 |
| Git | aktuelle Version |

Zusätzlich wird der **Publishable Key** des Supabase-Projekts gebraucht. Er
ist nicht im Repository hinterlegt und beim Team erhältlich; alternativ lässt
sich ein eigenes Supabase-Projekt aufsetzen ([Abschnitt 6](#6-eigenes-supabase-projekt)).

## 2. Repository klonen

```bash
git clone https://github.com/Finn5k/Wirtschaftsinformatik-Projekt-I.git
cd Wirtschaftsinformatik-Projekt-I
```

## 3. Konfiguration

```bash
cp .env.example .env.local
```

In `.env.local` den Platzhalter `sb_publishable_...` durch den Publishable Key
ersetzen. `VITE_SUPABASE_URL` ist bereits auf das Projekt gesetzt.

- Projekt-URL und Publishable Key sind **öffentlich**: Beide stecken im
  ausgelieferten Browser-Bundle, die Autorisierung leistet Row-Level-Security
  ([S1.1](docs/spec/S1-nachbarsysteme.md#s11-konventionen),
  [N2.2](docs/spec/N2-querschnittskonzepte.md#n22-row-level-security-rls)).
  Deshalb steht die URL in `.env.example`.
- Der geheime **Service-Role-Key** wird nie verwendet und gehört weder in
  `.env.local` noch ins Repository.
- `.env.local` ist über `.gitignore` von Commits ausgeschlossen.

## 4. Lokal starten

```bash
npm ci        # Abhängigkeiten exakt nach package-lock.json
npm run dev   # Dev-Server unter http://localhost:5173
```

> **Achtung:** Auch der lokale Dev-Server arbeitet gegen das gemeinsame
> Supabase-Projekt. Eine Staging-Datenbank gibt es nicht — lokal angelegte
> Konten, Sessions und Check-ins landen in der Produktionsdatenbank
> ([S3.7](docs/spec/S3-inbetriebnahme.md#s37-abgrenzung)).

Weitere Befehle:

| Befehl | Zweck |
|---|---|
| `npm run build` | Typprüfung (`tsc -b`) und Produktionsbuild nach `dist/` |
| `npm run lint` | ESLint über das gesamte Projekt |
| `npm run preview` | Produktionsbuild lokal ausliefern |

## 5. Prüfen, ob es läuft

Ohne Anmeldung:

1. `http://localhost:5173` leitet auf `/discover` um; DLG-02 listet Sessions.
2. `/map` zeigt die Karte mit OpenStreetMap-Kacheln und Session-Markern.
3. `/sessions/new` leitet auf `/login` (DLG-01) um
   ([B1.5.2](docs/spec/B1-dialogspezifikation.md#b152-weiterleitung-nicht-angemeldeter-nutzer)).

Mit Anmeldung — schreibt in die Produktionsdatenbank:

4. Unter `/login` registrieren; die Anmeldung erfolgt ohne Bestätigungsmail.
5. Eine Session anlegen — bei einem neuen Court füllt Nominatim nach dem
   Setzen des Kartenpins Ort und Adresse. Danach öffnet sich die
   Detailansicht mit PIN und QR-Code.

## 6. Eigenes Supabase-Projekt

Nur nötig, wenn nicht gegen das gemeinsame Projekt gearbeitet werden soll.

1. Im Supabase-Dashboard ein neues Projekt anlegen.
2. Die Dateien aus [`supabase/migrations/`](supabase/migrations) in der
   Reihenfolge ihrer Dateinamen im SQL-Editor ausführen. Inhalt der einzelnen
   Migrationen: [`supabase/README.md`](supabase/README.md).
3. In den Auth-Einstellungen des E-Mail-Providers die E-Mail-Bestätigung
   („Confirm email") abschalten. Die Einstellung liegt nicht in den
   Migrationen ([S3.3](docs/spec/S3-inbetriebnahme.md#s33-persistente-zustände));
   ohne sie verlangt die Registrierung eine Bestätigungsmail, die das MVP
   nicht vorsieht.
4. Projekt-URL und Publishable Key des neuen Projekts (Project Settings →
   API Keys) in `.env.local` eintragen.

## 7. Produktivbetrieb

Produktiv läuft LocalCourt unter <https://local-court.vercel.app>. Aufsetzen
und Betrieb sind in S3 beschrieben:

| Thema | Quelle |
|---|---|
| Erstinbetriebnahme auf Vercel und Supabase, Reihenfolge | [S3.4](docs/spec/S3-inbetriebnahme.md#s34-erstinbetriebnahme) |
| Releases (Push auf `main`), Datenbankmigrationen | [S3.5](docs/spec/S3-inbetriebnahme.md#s35-laufende-releases) |
| Rollback | [S3.6](docs/spec/S3-inbetriebnahme.md#s36-rollback-und-point-of-no-return) |
| Knoten und Konfiguration | [A07](docs/arch/A07-deployment-view.md) |

Wichtig für Vercel: Die beiden `VITE_…`-Variablen müssen **vor** dem Build
gesetzt sein, weil Vite sie beim Bauen einsetzt.

## 8. Fehlerbehebung

| Symptom | Ursache | Abhilfe |
|---|---|---|
| Seite „LocalCourt ist nicht vollständig konfiguriert" | `.env.local` fehlt oder eine `VITE_…`-Variable ist leer | Abschnitt 3; danach den Dev-Server neu starten, da Vite die Datei nur beim Start liest |
| DLG-02 zeigt einen Ladefehler statt Sessions | Publishable Key oder URL falsch | Werte in `.env.local` prüfen, Dev-Server neu starten |
| `npm ci` meldet `EBADENGINE` | Node-Version zu alt oder Node 23 | Node 22.13+ oder 24 installieren (Abschnitt 1) |
| Karte ohne Kacheln | OpenStreetMap aus dem Netz nicht erreichbar (z. B. Firewall, Werbeblocker) | Erreichbarkeit von NB-04 sicherstellen ([S3.2](docs/spec/S3-inbetriebnahme.md#s32-voraussetzungen)) |
