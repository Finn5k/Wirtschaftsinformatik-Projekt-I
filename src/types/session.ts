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
export type SessionStatus = "scheduled" | "active" | "completed" | "cancelled";

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
  dateLabel: string;
  timeLabel: string;
  description: string;
  meetingPoint: string;
  durationMin: number;
  participantsCount: number;
  maxParticipants: number;
  status: SessionStatus;
  organizerId: string;
  organizerName: string;
  pin: string;
  imageUrl: string;
  participants: Participant[];
  latitude: number;
  longitude: number;
}

export function isSessionFull(session: SportSession): boolean {
  return session.participantsCount >= session.maxParticipants;
}

export function isSessionJoinable(session: SportSession): boolean {
  return (
    (session.status === "scheduled" || session.status === "active") &&
    !isSessionFull(session)
  );
}
