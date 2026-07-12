import { mockSessions } from "../data/mockSessions";
import { mockUser } from "../data/mockUser";
import type { SportSession, SportType } from "../types/session";

export function getSessions(): SportSession[] {
  return mockSessions;
}

export function getSessionById(
  sessionId: string | undefined,
): SportSession | undefined {
  if (!sessionId) {
    return undefined;
  }

  return mockSessions.find((session) => session.id === sessionId);
}

// Entdecken/Karte zeigen nur zukünftige oder laufende Sessions (B1 DLG-02/DLG-03);
// abgeschlossene Sessions erscheinen ausschließlich unter "Meine Sessions" (UC-11).
export function getDiscoverableSessions(): SportSession[] {
  return mockSessions.filter(
    (session) => session.status === "scheduled" || session.status === "active",
  );
}

export function getSessionsBySportType(
  sportType: SportType | "Alle",
): SportSession[] {
  const discoverable = getDiscoverableSessions();

  if (sportType === "Alle") {
    return discoverable;
  }

  return discoverable.filter((session) => session.sportType === sportType);
}

function isMySession(session: SportSession): boolean {
  return (
    session.organizerId === mockUser.id ||
    session.participants.some((participant) => participant.id === mockUser.id)
  );
}

// "Meine Sessions" (B1 DLG-07): bevorstehende Sessions mit eigener Beteiligung (UC-05).
export function getMyUpcomingSessions(): SportSession[] {
  return mockSessions.filter(
    (session) =>
      isMySession(session) &&
      (session.status === "scheduled" || session.status === "active"),
  );
}

// "Meine Sessions", Tab Vergangen (B1 DLG-07): read-only Historie (UC-11).
export function getMyPastSessions(): SportSession[] {
  return mockSessions.filter(
    (session) => isMySession(session) && session.status === "completed",
  );
}
