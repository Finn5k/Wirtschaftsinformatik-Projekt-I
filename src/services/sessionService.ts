import { mockSessions } from "../data/mockSessions";
import { mockUser } from "../data/mockUser";
import type { SportSession, SportType } from "../types/session";
import { getSessionStatus } from "../utils/sessionTime";

let sessions = mockSessions.map((session) => ({
  ...session,
  participants: session.participants.map((participant) => ({
    ...participant,
  })),
}));

export function getSessions(): SportSession[] {
  return sessions;
}

export function getSessionById(
  sessionId: string | undefined,
): SportSession | undefined {
  if (!sessionId) {
    return undefined;
  }

  return sessions.find((session) => session.id === sessionId);
}

// Entdecken/Karte zeigen nur zukünftige oder laufende Sessions (B1 DLG-02/DLG-03);
// abgeschlossene Sessions erscheinen ausschließlich unter "Meine Sessions" (UC-11).
export function getDiscoverableSessions(): SportSession[] {
  return sessions
    .filter(
      (session) => getSessionStatus(session) !== "completed",
    )
    .sort((left, right) => {
      const statusOrder = { active: 0, scheduled: 1, completed: 2 };
      const statusDifference =
        statusOrder[getSessionStatus(left)] - statusOrder[getSessionStatus(right)];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      const startDifference =
        Date.parse(left.startAt) - Date.parse(right.startAt);

      return startDifference || left.title.localeCompare(right.title, "de");
    });
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
  return sessions
    .filter(
      (session) =>
        isMySession(session) &&
        getSessionStatus(session) !== "completed",
    )
    .sort(
      (left, right) =>
        Date.parse(left.startAt) - Date.parse(right.startAt) ||
        left.title.localeCompare(right.title, "de"),
    );
}

// "Meine Sessions", Tab Vergangen (B1 DLG-07): read-only Historie (UC-11).
export function getMyPastSessions(): SportSession[] {
  return sessions
    .filter(
      (session) => isMySession(session) && getSessionStatus(session) === "completed",
    )
    .sort((left, right) => {
      const leftEnd =
        Date.parse(left.startAt) + left.durationMin * 60 * 1000;
      const rightEnd =
        Date.parse(right.startAt) + right.durationMin * 60 * 1000;

      return (
        rightEnd - leftEnd || left.title.localeCompare(right.title, "de")
      );
    });
}

export function joinSession(sessionId: string): SportSession | undefined {
  const session = getSessionById(sessionId);

  if (
    !session ||
    getSessionStatus(session) === "completed" ||
    session.participants.some((participant) => participant.id === mockUser.id) ||
    session.participantsCount >= session.maxParticipants
  ) {
    return session;
  }

  const updatedSession: SportSession = {
    ...session,
    participantsCount: session.participantsCount + 1,
    participants: [
      ...session.participants,
      {
        id: mockUser.id,
        name: mockUser.name,
        avatarUrl: mockUser.avatarUrl,
        status: "confirmed",
      },
    ],
  };

  sessions = sessions.map((entry) =>
    entry.id === updatedSession.id ? updatedSession : entry,
  );

  return updatedSession;
}

export function checkIn(sessionId: string): SportSession | undefined {
  const session = getSessionById(sessionId);
  const participation = session?.participants.find(
    (participant) => participant.id === mockUser.id,
  );

  if (!session || getSessionStatus(session) !== "active" || !participation) {
    return session;
  }

  const updatedSession: SportSession = {
    ...session,
    participants: session.participants.map((participant) =>
      participant.id === mockUser.id
        ? { ...participant, status: "checked_in" }
        : participant,
    ),
  };

  sessions = sessions.map((entry) =>
    entry.id === updatedSession.id ? updatedSession : entry,
  );

  return updatedSession;
}
