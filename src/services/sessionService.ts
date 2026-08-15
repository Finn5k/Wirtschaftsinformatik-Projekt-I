import { mockSessions } from "../data/mockSessions";
import { mockUser } from "../data/mockUser";
import type { Court, SportSession, SportType } from "../types/session";
import { getSessionStatus } from "../utils/sessionTime";

const CREATED_SESSIONS_STORAGE_KEY = "localcourt.mock-created-sessions";

function cloneSession(session: SportSession): SportSession {
  return {
    ...session,
    participants: session.participants.map((participant) => ({
      ...participant,
    })),
  };
}

function readCreatedSessions(): SportSession[] {
  const storedSessions = window.localStorage.getItem(CREATED_SESSIONS_STORAGE_KEY);

  if (!storedSessions) {
    return [];
  }

  try {
    const parsedSessions: unknown = JSON.parse(storedSessions);
    return Array.isArray(parsedSessions)
      ? (parsedSessions as SportSession[]).map(cloneSession)
      : [];
  } catch {
    return [];
  }
}

// Ausgangs-Mockdaten bleiben dynamisch; nur im Formular angelegte Sessions
// werden für Seiten-Reloads lokal persistiert.
let createdSessions = readCreatedSessions();
let sessions = [...mockSessions.map(cloneSession), ...createdSessions];

function persistCreatedSessions() {
  window.localStorage.setItem(
    CREATED_SESSIONS_STORAGE_KEY,
    JSON.stringify(createdSessions),
  );
}

function updateCreatedSession(updatedSession: SportSession) {
  if (!createdSessions.some((session) => session.id === updatedSession.id)) {
    return;
  }

  createdSessions = createdSessions.map((session) =>
    session.id === updatedSession.id ? updatedSession : session,
  );
  persistCreatedSessions();
}

export interface CreateSessionInput {
  sportType: SportType;
  title: string;
  description: string;
  startAt: string;
  durationMin: number;
  maxParticipants: number;
  court: Court;
}

function generatePin(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

export function createSession(input: CreateSessionInput): SportSession {
  const session: SportSession = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    sportType: input.sportType,
    courtId: input.court.id,
    locationName: input.court.name,
    city: input.court.city,
    startAt: input.startAt,
    description: input.description.trim(),
    durationMin: input.durationMin,
    participantsCount: 1,
    maxParticipants: input.maxParticipants,
    organizerId: mockUser.id,
    organizerName: mockUser.name,
    pin: generatePin(),
    participants: [
      {
        id: mockUser.id,
        name: mockUser.name,
        avatarUrl: mockUser.avatarUrl,
        status: "confirmed",
      },
    ],
    latitude: input.court.latitude,
    longitude: input.court.longitude,
  };

  createdSessions = [...createdSessions, session];
  sessions = [...sessions, session];
  persistCreatedSessions();
  return session;
}

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
  updateCreatedSession(updatedSession);

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
  updateCreatedSession(updatedSession);

  return updatedSession;
}
