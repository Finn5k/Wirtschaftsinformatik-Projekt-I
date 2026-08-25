# 3 Kontextabgrenzung

## 3.1 Fachlicher Kontext

LocalCourt ist im Systemkontext eine einzige Blackbox: Zwei menschliche Akteure — Teilnehmer und Organisator — erreichen das System über den Browser als Nutzerkanal (NB-01); vier weitere Nachbarsysteme stellen Anmeldung, Datenhaltung, Kartendarstellung und Ortsauflösung bereit ([P2.1](../spec/P2-architekturueberblick.md#p21-systemkontext), [P2.2](../spec/P2-architekturueberblick.md#p22-nachbarsysteme)).

[![Systemkontext LocalCourt](../spec/diagrams-png/P2-systemkontext.png)](../spec/diagrams-png/P2-systemkontext.png)

Quelle: [`../spec/diagrams/P2-systemkontext.puml`](../spec/diagrams/P2-systemkontext.puml) ([P2.1](../spec/P2-architekturueberblick.md#p21-systemkontext)).

| Akteur / Nachbarsystem | Rolle | Fachlich ausgetauschte Information |
|---|---|---|
| Teilnehmer | Sucht Sessions, tritt bei, checkt per QR-Code oder PIN ein | Sucheingaben (Ort, Sportart), Beitritts- und Check-in-Aktionen |
| Organisator | Erstellt Sessions und Courts, sieht Teilnehmerliste, PIN und QR-Code | Session- und Courtdaten, Einsicht in Teilnehmerliste |
| NB-01 Browser (Nutzerkanal) | Einziger Kontaktpunkt zum Menschen; leitet Nutzeraktionen an LocalCourt weiter | Dialoginteraktionen ([B1](../spec/B1-dialogspezifikation.md)) |
| NB-02 Supabase Auth | Anmeldung, Sitzungsverwaltung, Token-Ausgabe | E-Mail/Passwort bzw. Token (Anfrage); Sitzung mit JWT (Antwort) |
| NB-03 Supabase PostgREST | Lesen sowie fachlich geprüftes Anlegen/Aktualisieren von Sessions, Courts, Teilnahmen, Profilen | Filter bzw. Nutzdaten (Anfrage); Datensätze bzw. Ergebniscode (Antwort) |
| NB-04 OpenStreetMap | Kartendarstellung der Courts | Kartenausschnitt und Zoomstufe (Anfrage); Kartenkacheln (Antwort) |
| NB-05 Nominatim | Reverse-Geocoding eines gesetzten Court-Pins | Koordinatenpaar (Anfrage); Ort und optionale Adresse (Antwort) |

Details je Nachbarsystem — Operationen, Abgrenzung, Owner — stehen in [P2.2](../spec/P2-architekturueberblick.md#p22-nachbarsysteme) und [S1](../spec/S1-nachbarsysteme.md).

## 3.2 Technischer Kontext

Jede Verbindung läuft synchron über HTTPS, ausgelöst durch eine Nutzeraktion; es gibt weder Warteschlangen noch Push-Kanäle ([P2.1](../spec/P2-architekturueberblick.md#p21-systemkontext), [S1.1](../spec/S1-nachbarsysteme.md#s11-konventionen)).

| Verbindung | Übertragung | Authentifizierung |
|---|---|---|
| LocalCourt ↔ NB-02 Supabase Auth | HTTPS | E-Mail/Passwort bzw. Token (Anfrage); Antwort liefert JWT |
| LocalCourt ↔ NB-03 Supabase PostgREST | HTTPS | JWT aus NB-02 je Aufruf |
| LocalCourt → NB-04 OpenStreetMap | HTTPS | keine |
| LocalCourt ↔ NB-05 Nominatim | HTTPS | keine |

NB-01 Browser hat keinen eigenen Protokoll-Contract; die Schnittstelle ist die Dialogfläche aus B1 ([S1.2](../spec/S1-nachbarsysteme.md#s12-nb-01--browser-nutzerkanal)).
