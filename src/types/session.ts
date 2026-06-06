export type SportType =
  | "Laufen"
  | "Radfahren"
  | "Fußball"
  | "Basketball"
  | "Badminton"
  | "Schwimmen"
  | "Sonstiges";

export type SessionStatus = "OPEN" | "FULL" | "CANCELLED" | "COMPLETED";

export type Rank =
  | "Beginner 1"
  | "Beginner 2"
  | "Beginner 3"
  | "Amateur 1"
  | "Amateur 2"
  | "Pro 1";

export interface Participant {
  id: string;
  name: string;
  checkedIn: boolean;
  avatarUrl?: string;
}

export interface SportSession {
  id: string;
  title: string;
  sportType: SportType;
  locationName: string;
  city: string;
  dateLabel: string;
  timeLabel: string;
  description: string;
  meetingPoint: string;
  durationLabel: string;
  distanceLabel?: string;
  participantsCount: number;
  maxParticipants: number;
  recommendedRank: Rank;
  status: SessionStatus;
  organizerName: string;
  xpReward: number;
  imageUrl: string;
  participants: Participant[];
  latitude: number;
  longitude: number;
}