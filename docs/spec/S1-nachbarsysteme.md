# S1 — Nachbarsysteme-Schnittstellen (STUB)

Detaillierte API-Contracts für alle Nachbarsysteme (NB-01 bis NB-04). Dieses Dokument wird in der nächsten Phase ausführlich gefüllt.

---

## S1.1 Übersicht

| NB-ID | System | Abschnitt | Status |
|-------|--------|-----------|--------|
| NB-01 | Browser / React-Frontend | [S1.2](#s12--nb-01--browser-frontend) | 🔄 TODO |
| NB-02 | Supabase Authentication | [S1.3](#s13--nb-02--supabase-authentication) | 🔄 TODO |
| NB-03 | Supabase PostgREST API | [S1.4](#s14--nb-03--supabase-postgrest-api) | 🔄 TODO |
| NB-04 | OpenStreetMap / Leaflet | [S1.5](#s15--nb-04--openstreetmap-leaflet) | 🔄 TODO |

---

## S1.2 — NB-01 — Browser Frontend

### Beschreibung
React-Anwendung im Browser. Einziger direkter Nutzer-Kontaktpunkt.

### API-Kontakt-Punkte (Inbound)
- HTML/CSS Rendering
- Click Events, Form Submissions
- Geolocation API (optional)
- LocalStorage API

### Fehlerbehandlung
- User-Facing Errors: Toast Notifications, Modal Dialogs
- Validation Errors: Form-Level Highlights
- Network Errors: "Connection Lost" Banner mit Retry-Option

**Zu Detail:** Spezifische Komponenten, Props, State Management Pattern

---

## S1.3 — NB-02 — Supabase Authentication

### Beschreibung
Supabase Auth Service für Nutzer-Anmeldung und Token-Management.

### Endpoints (zu dokumentieren)
- `POST /auth/v1/signup`
- `POST /auth/v1/signin`
- `POST /auth/v1/logout`
- `POST /auth/v1/refresh`
- `GET /auth/v1/user` (mit JWT Header)

### Payload-Schemas (zu dokumentieren)
- Signup Request/Response
- Signin Request/Response
- Error Responses

### Fehlerbehandlung
- 400 Bad Request: Invalid Email, Weak Password
- 401 Unauthorized: Wrong Credentials
- 429 Too Many Requests: Rate Limiting

**Zu Detail:** Vollständige Request/Response Examples, Error Codes, JWT Token Structure

---

## S1.4 — NB-03 — Supabase PostgREST API

### Beschreibung
Auto-generated REST API auf PostgreSQL Datenbank (Supabase PostgREST).

### Main Resources (zu dokumentieren)
- `/rest/v1/sessions` — CRUD für Sessions
- `/rest/v1/courts` — CRUD für Courts/Sportplätze
- `/rest/v1/participants` — CRUD für Session-Participants
- `/rest/v1/profiles` — CRUD für Nutzer-Profile
- `/rest/v1/sports` — Reference: Sport-Arten

### Query Parameter Patterns (zu dokumentieren)
- Filtering: `?field=value`, `?field=gte.value`
- Ordering: `?order=created_at.desc`
- Pagination: `?limit=20&offset=0`
- Selection: `?select=id,title,datetime` (Column Projection)

### Fehlerbehandlung
- 400 Bad Request: Invalid Query, Malformed JSON
- 401 Unauthorized: Missing/Invalid JWT
- 403 Forbidden: RLS Policy Violation (Row-Level-Security)
- 404 Not Found: Resource nicht gefunden
- 409 Conflict: Duplicate Key, Business Logic Violation (z.B. Session voll)
- 500 Server Error: Database Error

### Row-Level-Security (RLS) Policies (zu dokumentieren)
- Nutzer kann nur eigene Sessions sehen (bis sie public sind)
- Nutzer kann nur eigene Profile editieren
- Nutzer kann in beliebige öffentliche Sessions beitreten

**Zu Detail:** Vollständige OpenAPI/Swagger Specification, Request/Response Beispiele für jede Operation, RLS Policy Definitions

---

## S1.5 — NB-04 — OpenStreetMap / Leaflet

### Beschreibung
OpenStreetMap-Tile-Server + Leaflet JavaScript Library für Kartendarstellung.

### Tile-Server Endpoints (zu dokumentieren)
- `https://tile.openstreetmap.org/{z}/{x}/{y}.png` — Standard OSM Tiles

### Leaflet API (zu dokumentieren)
- `L.map()` — Initialize Map
- `L.tileLayer()` — Add Tile Layer
- `L.marker()` — Add Marker (Courts, Sessions)
- `L.popup()` — Info Popup on Marker Click
- `L.control.search()` — Search/Geocoding Plugin (optional)

### Fehlerbehandlung
- Tile Load Timeout: Fallback zu Fallback-Map oder Text-View
- Geocoding Failure: Show "Location not found" Message
- No Browser Permissions: Skip Location Features

**Zu Detail:** Leaflet Configuration Options, Custom Marker Styles, Tile Layer Attribution, Geocoding API Choice (Nominatim vs. Google)

---

## Nächste Schritte

Diese Abschnitte werden in einer späteren Spezifikations-Phase (S1 Details) ausgearbeitet. Für MVP genügt diese Struktur als Referenz.

---

## Referenzen

- **P2 — Architekturüberblick**: `P2-architekturueberblick.md`
- **Supabase Docs**: https://supabase.io/docs
- **Leaflet Docs**: https://leafletjs.com/
- **OpenStreetMap Docs**: https://wiki.openstreetmap.org/
