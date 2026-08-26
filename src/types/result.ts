// Ergebnistypen und Fehlerklassen gemäß A08 §8.5.
//
// A08 8.5.2 unterscheidet drei Fehlerklassen: Validierungsfehler, fachliche
// Ablehnung und technischer Fehler. Diese Datei bildet sie als Typ ab, damit
//   - die Service-Schicht fachliche Ergebniscodes unverändert an die
//     Dialogseiten weiterreicht, statt sie zu verwerfen (A08 8.5.4), und
//   - ein technischer Fehler nicht in einen fachlichen Ergebniscode umgedeutet
//     werden kann (A08 8.5.4, N2.3).
//
// Die Ergebniscodes selbst sind nicht hier definiert, sondern in F3 je
// Anwendungsfunktion; diese Datei übernimmt sie wortgleich.

/** Fachlich erfolgreiches Ergebnis. */
export interface Ok<TData, TCode extends string = "OK"> {
  kind: "ok";
  code: TCode;
  data: TData;
}

/**
 * Fachliche Ablehnung (A08 8.5.2): Die Anfrage wurde technisch vollständig
 * verarbeitet, eine Geschäftsregel lehnt das Ergebnis ab. Die Ablehnung ist
 * das gültige, definierte Ergebnis — kein Fehler im technischen Sinn.
 */
export interface Rejected<TCode extends string> {
  kind: "rejected";
  code: TCode;
}

/**
 * Validierungsfehler (A08 8.5.2): Eine Eingabe verletzt eine Format-,
 * Pflichtfeld- oder Wertebereichsregel, bevor eine fachliche Prüfung
 * stattfindet. Die Anzeige erfolgt feldbezogen (A08 8.2.4, B1.5.3).
 */
export interface Invalid<TCode extends string> {
  kind: "invalid";
  code: TCode;
}

/**
 * Technischer Fehler (A08 8.5.2): Die Anfrage konnte nicht zuverlässig
 * durchgeführt oder beantwortet werden — es kam gar keine fachliche
 * Entscheidung zustande.
 *
 * `cause` ist ausschließlich für Diagnose gedacht und darf nach A08 8.5.6
 * nicht in einer Nutzermeldung erscheinen (keine Rohantworten, Stacktraces
 * oder internen URL-/HTTP-/DB-Details).
 */
export interface Failed {
  kind: "failed";
  cause?: unknown;
}

// --------------------------------------------------------------- AF-01
// F3 AF-01 — Beitritts- und Kapazitätsregel.
// Ergebniscodes und HTTP-Zuordnung stehen in F3; die Datenbank transportiert
// sie als SQLSTATE PTxyz (siehe supabase/migrations/, ADR-001).

/** Ablehnungen aus F3 AF-01 (401 bzw. 409). */
export type JoinSessionRejection =
  | "NOT_AUTHENTICATED"
  | "SESSION_NOT_JOINABLE"
  | "ALREADY_JOINED"
  | "SESSION_FULL"
  // Kein F3-Ergebniscode: Die RPC meldet damit eine unbekannte Session-Kennung
  // (404). Fachlich dennoch eine Ablehnung, weil die Anfrage verarbeitet und
  // beantwortet wurde (A08 8.5.2, Abgrenzungsregel).
  | "SESSION_NOT_FOUND";

export interface JoinSessionData {
  participantId: string;
  status: "confirmed";
  joinedAt: string;
}

export type JoinSessionResult =
  | Ok<JoinSessionData>
  | Rejected<JoinSessionRejection>
  | Failed;

// --------------------------------------------------------------- AF-02
// F3 AF-02 — Check-in-Validierung.

/**
 * Erfolgscodes aus F3 AF-02. `ALREADY_CHECKED_IN` ist dort ausdrücklich
 * ebenfalls `200 OK` und damit idempotenter Erfolg, keine Ablehnung
 * (Zusicherung „Keine Statusrücknahme").
 */
export type CheckInSuccess = "OK" | "ALREADY_CHECKED_IN";

/** Ablehnungen aus F3 AF-02 (403, 400, 409). */
export type CheckInRejection =
  | "NOT_JOINED"
  | "INVALID_CREDENTIAL"
  | "OUTSIDE_WINDOW"
  | "SESSION_NOT_FOUND";

export interface CheckInData {
  checkedInAt: string;
}

export type CheckInResult =
  | Ok<CheckInData, CheckInSuccess>
  | Rejected<CheckInRejection>
  | Failed;

// --------------------------------------------------------- create_session
// UC-06/UC-10. F3 legt für create_session bewusst kein eigenes
// Ergebniscode-Set fest (A09 ADR-001); die RPC meldet neben der fehlenden
// Anmeldung nur Eingabefehler.

export type CreateSessionInvalid = "START_IN_PAST" | "COURT_INCOMPLETE";

export interface CreateSessionData {
  sessionId: string;
  pin: string;
}

export type CreateSessionResult =
  | Ok<CreateSessionData>
  | Rejected<"NOT_AUTHENTICATED">
  | Invalid<CreateSessionInvalid>
  | Failed;

// ------------------------------------------------------------------ NB-05
// A08 8.5.5 führt Nominatim als Referenzfall mit allen drei Ausgängen:
// verwertbarer Ort (Erfolg), technisch erfolgreiche Antwort ohne verwertbaren
// Ort (fachliche Ablehnung) und technischer Fehler.

export interface ReverseGeocodingData {
  city: string;
  address?: string;
}

export type ReverseGeocodeResult =
  | Ok<ReverseGeocodingData>
  | Rejected<"GEOCODING_NO_CITY">
  | Failed;

// ----------------------------------------------------------------- Helfer

/** Verengt ein Ergebnis auf den Erfolgsfall. */
export function isOk<TData, TCode extends string>(
  result: Ok<TData, TCode> | Rejected<string> | Invalid<string> | Failed,
): result is Ok<TData, TCode> {
  return result.kind === "ok";
}

/**
 * Trennt fachliche Ablehnung von technischem Fehler — die Unterscheidung, an
 * der die UI ihre Reaktion ausrichtet (A08 8.5.6): kontextbezogene
 * Dialogmeldung gegenüber allgemeiner Wiederholen-Meldung.
 */
export function isTechnicalFailure(
  result: Ok<unknown, string> | Rejected<string> | Invalid<string> | Failed,
): result is Failed {
  return result.kind === "failed";
}
