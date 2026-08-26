// Schlüssel des Referenzkatalogs `sport` (D1.4). Wortgleich mit `sport.key` in
// der Datenbank; die Anzeigebezeichnung steht nicht im Typ, sondern im Katalog
// `src/data/sports.ts` (D1.4 `display_name`).
//
// Zuvor war dies eine Union deutscher Anzeigenamen ("Fußball"). Das
// widersprach D1.4, wo `key` der stabile technische Schlüssel und
// `display_name` die Anzeige ist, und hätte an der PostgREST-Grenze gebrochen.
export type SportKey =
  | "running"
  | "cycling"
  | "football"
  | "basketball"
  | "badminton"
  | "swimming"
  | "other";

// Katalogeintrag aus D1.4 `sport`.
export interface Sport {
  key: SportKey;
  displayName: string;
}

// Statuswerte gemäß Spezifikation D2.3 (SessionStatus).
// "Voll" ist kein Status, sondern wird aus der Belegung abgeleitet (AF-01).
export type SessionStatus = "scheduled" | "active" | "completed";

// Teilnahmestatus gemäß Spezifikation D2.5 (ParticipantStatus).
export type ParticipantStatus = "confirmed" | "checked_in";

export interface Participant {
  id: string;
  name: string;
  status: ParticipantStatus;
  avatarUrl?: string;
}

// Sportort gemäß Spezifikation D1.4 (court). Trägt als einzige Entität das
// Koordinatenpaar (D2.7).
export interface Court {
  id: string;
  name: string;
  city: string;
  address?: string;
  latitude: number;
  longitude: number;
}

// Lesesicht auf eine Sport-Session, entspricht der View `v_session`.
//
// `court` ist eingebettet statt über eine Kennung referenziert, weil die View
// die Court-Felder mitliefert und die Dialogseiten sie ohne Folgeabfrage
// brauchen (UC-02, UC-03). Zuvor lagen `courtId`, `locationName`, `city`,
// `latitude` und `longitude` flach auf der Session — die Koordinaten damit auf
// einer Entität, die sie laut D1.4 gar nicht trägt.
//
// `status` und `confirmedCount` sind abgeleitete Merkmale (D1.6) und werden
// nicht gespeichert; `status` berechnet `utils/sessionTime.ts` (AF-03).
export interface SportSession {
  id: string;
  title: string;
  sportKey: SportKey;
  court: Court;
  startAt: string;
  description: string;
  durationMin: number;
  participantsCount: number;
  maxParticipants: number;
  organizerId: string;
  organizerName: string;
  pin: string;
  participants: Participant[];
}

export function isSessionFull(session: SportSession): boolean {
  return session.participantsCount >= session.maxParticipants;
}
