import { mockSessions } from "../data/mockSessions";
import type { SportSession, SportType } from "../types/session";

export function getSessions(): SportSession[] {
  return mockSessions;
}

export function getSessionById(sessionId: string | undefined): SportSession | undefined {
  if (!sessionId) {
    return undefined;
  }

  return mockSessions.find((session) => session.id === sessionId);
}

export function getSessionsBySportType(sportType: SportType | "Alle"): SportSession[] {
  if (sportType === "Alle") {
    return mockSessions;
  }

  return mockSessions.filter((session) => session.sportType === sportType);
}