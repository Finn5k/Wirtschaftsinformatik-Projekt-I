# D2 — Datentypen (Datentypenverzeichnis)

## D2.1 Zweck und Geltungsbereich

Dieser Baustein ist das **Datentypenverzeichnis** von LocalCourt. Er definiert die fachlichen Datentypen, mit denen die Attribute aus [D1](D1-datenmodell.md) belegt sind: ihre Wertform, ihre Wertebereiche, Aufzählungswerte, Gleichheits-/Ordnungssemantik und die fachlichen Validierungsregeln.

Nach Siedersleben beschreibt D2 die Datentypen **fachlich**, nicht technisch. Die Zuordnung zu konkreten PostgreSQL-Spaltentypen (`uuid`, `timestamptz`, `text`, `smallint`, …), zu Constraints, Indizes oder Speicherformaten (z. B. ob eine PIN gehasht abgelegt wird) ist Sache von [N2](#) und der Architektur. D2 legt fest, *welche Werte fachlich gültig sind* und *wie mit ihnen umzugehen ist*; die technische Erzwingung dieser Regeln erfolgt später.

**Triviale Typen** werden ohne eigene Detailsektion direkt verwendet:

| Typ | Bedeutung | Fachliche Form |
|---|---|---|
| `Text` | Zeichenkette | Nicht-leerer, UTF-8-Text mit fachlich begrenzter Länge (Grenzen je Feld in N1/B1). |
| `Integer` | Ganzzahl | Vorzeichenbehaftete Ganzzahl; feldspezifische Wertebereiche siehe unten. |
| `Boolean` | Wahrheitswert | `true` / `false`. |
| `Timestamp` | Zeitpunkt | Datum + Uhrzeit mit Zeitzonenbezug (UTC-normalisiert). Grundlage von Zeitvergleichen (AF-03). |
| `Url` | Web-Adresse | Syntaktisch gültige URL (Schema + Host), z. B. für `avatar_url`. |

Die folgenden Sektionen [D2.2–D2.8](#d22-identifier) definieren die **nicht-trivialen fachlichen Typen**.

### Katalogübersicht

| Typ | Kategorie | Basis | Kurzbeschreibung | Verwendet in (D1) |
|---|---|---|---|---|
| [`Identifier`](#d22-identifier) | Kennung | opak | Eindeutige, stabile Objektkennung. | alle Primär-/Fremdschlüssel |
| [`SessionStatus`](#d23-sessionstatus) | Aufzählung | Enum | Fachlicher Lebenszyklus-Status einer Session. | abgeleitet auf `session` |
| [`Pin`](#d24-pin) | Format | Text (numerisch) | 4-stelliges Check-in-Geheimnis. | `session.pin` |
| [`ParticipantStatus`](#d25-participantstatus) | Aufzählung | Enum | Teilnahmezustand (beigetreten / eingecheckt). | `participant.status` |
| [`Duration`](#d26-duration) | Maß | Integer | Zeitspanne in Minuten. | `session.duration_min` |
| [`GeoCoordinate`](#d27-geocoordinate) | Maß | Dezimalzahl | Geografische Koordinate (Breite/Länge). | `court.latitude`, `court.longitude` |
| [`QrContent`](#d28-qrcontent) | Abgeleitet | Url/Text | Check-in-Verweis mit Session-Bezug und PIN. | abgeleitet auf `session` |

## D2.2 Identifier

**Wertform:** Eine opake, systemweit eindeutige und über die Lebensdauer eines Objekts **stabile** Kennung. Fachlich wird der Identifier als undurchsichtiger Wert behandelt: Er trägt keine fachliche Bedeutung, wird nicht interpretiert und nicht aus anderen Attributen abgeleitet.

**Erzeugung:** Wird bei der Anlage eines Objekts vergeben und danach nicht mehr verändert. Die konkrete Erzeugungsstrategie (z. B. UUID, datenbankseitige Sequenz) ist eine N2-Entscheidung.

**Sonderfall `profile.user_id`:** Diese Kennung entspricht der **externen Auth-Kennung** aus Supabase Auth ([S1](S1-nachbarsysteme.md), NB-02). Sie wird nicht von LocalCourt vergeben, sondern übernommen; fachlich gelten dieselben Regeln (opak, stabil, eindeutig).

**Gleichheit & Ordnung:** Zwei Identifier sind gleich, wenn sie zeichenweise übereinstimmen. Eine fachliche Ordnung ist nicht definiert; Identifier werden nicht zum Sortieren fachlicher Listen verwendet.

**Validierung:** Ein Identifier ist gültig, wenn er nicht leer ist und auf ein existierendes Objekt verweist (bei Fremdschlüsseln: referenzielle Integrität, technisch in N2 erzwungen).

## D2.3 SessionStatus

Fachlicher Status einer Session. Der Wert wird **abgeleitet** (siehe [D1.6](D1-datenmodell.md#d16-abgeleitete-merkmale) und [F3 AF-03](F3-anwendungsfunktionen.md#f35-af-03--session-lifecycle--statusübergänge)), nicht frei gesetzt.

| Wert | Bedeutung |
|---|---|
| `scheduled` | Angelegt, aber noch nicht gestartet (`jetzt < start_at`). Beitritt möglich, Check-in nicht. |
| `active` | Läuft (`start_at ≤ jetzt < start_at + duration_min`). Beitritt und Check-in möglich. |
| `completed` | Beendet (`jetzt ≥ start_at + duration_min`). Read-only, nur Historie. |
| `cancelled` | Abgesagt. Im MVP definiert, aber **nicht** durch Nutzeraktion auslösbar; für spätere Ausbaustufen reserviert. |

**Ableitung & Ordnung:** Solange `cancelled` nicht gilt, ergibt sich der Status allein aus der Zeit (Ableitungstabelle in AF-03). Die fachliche Reihenfolge ist **monoton vorwärts**: `scheduled → active → completed`. Rücksprünge sind unzulässig; ein Endzustand (`completed`, `cancelled`) wird nicht verlassen.

**Handhabung:** Konsumenten (UI, Prüfungen in AF-01/AF-02) müssen den Status aus der aktuellen Zeit bestimmen bzw. den bereitgestellten abgeleiteten Wert verwenden. Ob der Status bei jeder Abfrage berechnet oder zeitgesteuert materialisiert wird, ist eine N2-Frage.

**Validierung:** Nur die vier genannten Werte sind gültig. Ein direkter, fachlich unzulässiger Übergang (z. B. `completed → active`) ist ungültig und darf nicht auftreten.

## D2.4 Pin

**Wertform:** Eine **4-stellige, rein numerische** Zeichenfolge (`0000`–`9999`). Führende Nullen sind bedeutungstragend; die PIN ist daher fachlich eine **Zeichenkette** fester Länge 4, kein Zahlwert.

**Erzeugung:** Wird bei der Session-Erstellung **zufällig** erzeugt (AF-04) und bleibt über die Lebensdauer der Session unverändert.

**Eindeutigkeit:** Nur **je Session** eindeutig zuordenbar, **nicht global**. Die Prüfung erfolgt immer im Kontext einer konkreten Session (QR-Inhalt trägt `session_id`, manuelle Eingabe erfolgt in der Check-in-Ansicht einer Session), daher ist ein PIN-Zusammenfall verschiedener Sessions fachlich unkritisch (AF-04 R2).

**Gleichheit:** Zeichenweiser Vergleich der vierstelligen Zeichenkette (inkl. führender Nullen).

**Validierung:** Eine Eingabe ist formal gültig, wenn sie aus genau vier Ziffern besteht; sie ist fachlich gültig, wenn sie mit der PIN der betreffenden Session übereinstimmt (AF-02). Formfehler (z. B. Buchstaben, falsche Länge) werden vor dem fachlichen Vergleich abgewiesen.

**Sicherheitsniveau (bewusst):** 4 Stellen = 10 000 Möglichkeiten, geringe Entropie. Akzeptabel, weil Check-in zusätzlich Anmeldung und vorherigen Beitritt voraussetzt und die Auswirkung gering ist (reine Anwesenheitsmarkierung). Ob die PIN im Klartext oder gehasht gespeichert wird, ist eine N2-/Sicherheitsentscheidung.

## D2.5 ParticipantStatus

Teilnahmezustand eines `participant`.

| Wert | Bedeutung |
|---|---|
| `confirmed` | Nutzer ist der Session beigetreten und belegt einen Kapazitätsplatz (AF-01). |
| `checked_in` | Nutzer hat sich vor Ort eingecheckt (AF-02); `checked_in_at` ist gesetzt. |

**Ordnung & Übergänge:** Der Zustand bewegt sich **monoton** `confirmed → checked_in`. Eine Rücknahme (`checked_in → confirmed`) ist fachlich unzulässig (AF-02 R6). Es gibt **keinen** Wert `waiting` — Wartelisten sind out of scope (P1 NG-10).

**Kopplung an Zeitstempel:** `status = checked_in` ⇔ `checked_in_at` ist gesetzt (Invariante aus [D1.4](D1-datenmodell.md#participant--teilnahme)).

**Validierung:** Nur die beiden genannten Werte sind gültig. Der Übergang nach `checked_in` ist nur zulässig, wenn AF-02 erfüllt ist (Teilnahme besteht, Merkmal gültig, Session `active`).

## D2.6 Duration

**Wertform:** Eine Zeitspanne als **positive Ganzzahl in Minuten** (`Integer`, Einheit Minuten). Die Einheit ist fachlich fixiert (Minuten), damit `start_at + duration_min` das Session-Ende eindeutig bestimmt (AF-03).

**Wertebereich:** ≥ 1 Minute. Eine fachliche Obergrenze (z. B. maximale Session-Dauer) wird in N1/UC-06 präzisiert und hier nicht festgelegt.

**Gleichheit & Ordnung:** Numerischer Vergleich; kleinere Werte bedeuten kürzere Sessions.

**Validierung:** Bei Session-Erstellung (UC-06) muss `duration_min` eine positive Ganzzahl sein. Zusammen mit `start_at` (muss in der Zukunft liegen) ergibt sich das Zeitfenster der Session.

## D2.7 GeoCoordinate

**Wertform:** Eine geografische Koordinate als **Dezimalzahl** im WGS84-Bezugssystem. `latitude` liegt im Bereich **−90 bis +90**, `longitude` im Bereich **−180 bis +180**.

**Optionalität & Paarbildung:** Koordinaten sind je `court` optional (`[0..1]`) und treten **paarweise** auf: entweder sind `latitude` und `longitude` beide gesetzt oder beide leer (Invariante aus [D1.4](D1-datenmodell.md#court--sportort)). Ein einzelner Koordinatenwert ohne Partner ist fachlich ungültig.

**Verwendung:** Dient ausschließlich der Kartendarstellung über OpenStreetMap/Leaflet ([NB-04](P2-architekturueberblick.md#p22-nachbarsysteme)). Fehlen die Koordinaten, bleibt die Session über `court.city`/`name` weiterhin auffindbar (Graceful Degradation, UC-02).

**Validierung:** Werte außerhalb der genannten Bereiche sind ungültig. Genauigkeit und Geocoding-Verfahren (Adresse → Koordinaten) sind in S1/N2 zu präzisieren.

## D2.8 QrContent

**Wertform:** Ein **abgeleiteter** Verweis (`Url`/`Text`), der auf die Check-in-Ansicht einer Session zeigt und `session_id` sowie `pin` kodiert (konzeptionell `…/check-in?session=<session_id>&pin=<pin>`, AF-04 R3).

**Erzeugung & Stabilität:** Wird aus `session_id` und `pin` abgeleitet (nicht unabhängig gepflegt) und ist über die Lebensdauer der Session stabil, da beide Bestandteile unverändert bleiben (AF-04 R4). Ob der QR-Inhalt materialisiert (als Feld/Bild abgelegt) oder bei Bedarf erzeugt wird, ist eine N2/S1-Entscheidung ([D1.6](D1-datenmodell.md#d16-abgeleitete-merkmale)).

**Fachliche Gleichwertigkeit zu Pin:** Der QR-Inhalt trägt dieselbe PIN, die AF-02 prüft; QR-Scan (UC-08) und manuelle PIN-Eingabe (UC-09) sind daher fachlich gleichwertig.

**Validierung:** Ein QR-Inhalt ist gültig, wenn die enthaltene `session_id` auf eine existierende Session verweist und die enthaltene PIN zu dieser Session passt (Prüfung durch AF-02).

## D2.9 Notations- und Multiplizitätskonventionen

In [D1](D1-datenmodell.md) und D2 gelten folgende Konventionen:

| Notation | Bedeutung |
|---|---|
| `T` | Genau ein Wert vom Typ `T` (Pflicht, `1`). |
| `T [0..1]` | Optionaler Wert (höchstens einer). |
| `T [n..m]` | Zwischen `n` und `m` Werten. |
| `List<T>` | Geordnete Liste von `T`. |
| `Set<T>` | Ungeordnete, duplikatfreie Menge von `T`. |
| `PK` / `FK` | Primärschlüssel (fachliche Identität) / Fremdschlüssel (Verweis). |
| Enum-Werte | In Codeschrift, klein (`scheduled`, `confirmed`). |

Attribut- und Entitätsnamen sind in **englischem `snake_case`** gehalten (konsistent mit F3/P2), die Beschreibungen in deutscher Prosa.

## D2.10 Konsistenz und Cross-References

| Baustein | Relevanz für D2 |
|---|---|
| [D1](D1-datenmodell.md) | Verwendet die hier definierten Typen für alle Attribute; jede Typreferenz in D1 wird hier aufgelöst. |
| [F3](F3-anwendungsfunktionen.md) | Definiert die Regeln über den Werten: `SessionStatus` (AF-03), `Pin`/`QrContent` (AF-02, AF-04), `ParticipantStatus` (AF-01, AF-02). |
| [P1](P1-ziele-rahmenbedingungen.md) | Scope-Grenzen prägen die Wertebereiche (kein `waiting`, NG-10; DSGVO CON-D-01). |
| [S1](S1-nachbarsysteme.md) | `Identifier` (`user_id`) und Geocoding stammen aus Nachbarsystemen. |
| N1 / N2 | Feldlängen, Obergrenzen, technische Typzuordnung, Constraints, PIN-Speicherung, Zeittoleranz beim Check-in. |
| B1 | Ein-/Ausgabeformate und Feldvalidierung in den Dialogen. |
| E2 | Glossar: konsistente Begriffe zu den Typwerten. |

## D2.11 Offene Punkte

| Punkt | Beschreibung | Zuständiger Baustein |
|---|---|---|
| Feldlängen | Konkrete Längen-/Formatgrenzen für `Text`-Felder (`title`, `display_name`, `description`). | N1 / B1 |
| Maximale Session-Dauer | Fachliche Obergrenze für `Duration`. | N1 / UC-06 |
| PIN-Speicherung | Klartext vs. gehasht; Zeittoleranz beim Check-in-Fenster. | N2 |
| QR-Kodierung | Konkretes URL-Format und Ablage des QR-Bilds. | S1 / N2 |
| Identifier-Strategie | UUID vs. Sequenz; referenzielle Integrität. | N2 |

## D2.12 Eingesetzte KI-Werkzeuge

| Aspekt | Inhalt |
|---|---|
| Werkzeug | Claude Code (Opus 4.8) |
| Verwendung | Entwurf des D2-Datentypenverzeichnisses: Katalogisierung der trivialen und nicht-trivialen Typen, Definition von Wertebereichen, Aufzählungen und Validierungsregeln aus F3/D1. |
| Prüfung | Inhalte wurden gegen [D1](D1-datenmodell.md), [F3](F3-anwendungsfunktionen.md), [P1](P1-ziele-rahmenbedingungen.md) und die Herold-Referenz geprüft und mit dem Team abzustimmen. |
