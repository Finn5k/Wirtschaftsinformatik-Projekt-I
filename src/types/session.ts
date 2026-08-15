export type SportType =
  | "Laufen"
  | "Radfahren"
  | "Fußball"
  | "Basketball"
  | "Badminton"
  | "Schwimmen"
  | "Sonstiges";

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

// Sportort gemäß Spezifikation D1 (court).
export interface Court {
  id: string;
  name: string;
  city: string;
  address?: string;
  latitude: number;
  longitude: number;
}

export interface SportSession {
  id: string;
  title: string;
  sportType: SportType;
  courtId: string;
  locationName: string;
  city: string;
  startAt: string;
  description: string;
  durationMin: number;
  participantsCount: number;
  maxParticipants: number;
  organizerId: string;
  organizerName: string;
  pin: string;
  participants: Participant[];
  latitude: number;
  longitude: number;
}

export function isSessionFull(session: SportSession): boolean {
  return session.participantsCount >= session.maxParticipants;
}
