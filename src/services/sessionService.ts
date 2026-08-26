import { mockSessions } from "../data/mockSessions";
import type { Court, SportSession, SportKey } from "../types/session";
import { getSessionStatus } from "../utils/sessionTime";
import { getCurrentUser } from "./userService";

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

function synchronizeCurrentUserDisplay() {
  const currentUser = getCurrentUser();
  let hasChanges = false;

  sessions = sessions.map((session) => {
    const organizerName =
      session.organizerId === currentUser.id
        ? currentUser.name
        : session.organizerName;
    const participants = session.participants.map((participant) => {
      if (participant.id !== currentUser.id) {
        return participant;
      }

      if (
        participant.name === currentUser.name &&
        participant.avatarUrl === currentUser.avatarUrl
      ) {
        return participant;
      }

      hasChanges = true;
      return {
        ...participant,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      };
    });

    if (organizerName !== session.organizerName) {
      hasChanges = true;
    }

    return organizerName === session.organizerName &&
      participants.every(
        (participant, index) => participant === session.participants[index],
      )
      ? session
      : { ...session, organizerName, participants };
  });

  if (hasChanges) {
    const createdSessionIds = new Set(createdSessions.map((session) => session.id));
    createdSessions = sessions.filter((session) => createdSessionIds.has(session.id));
    persistCreatedSessions();
  }
}

export interface CreateSessionInput {
  sportKey: SportKey;
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
  const currentUser = getCurrentUser();
  const session: SportSession = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    sportKey: input.sportKey,
    court: input.court,
    startAt: input.startAt,
    description: input.description.trim(),
    durationMin: input.durationMin,
    participantsCount: 1,
    maxParticipants: input.maxParticipants,
    organizerId: currentUser.id,
    organizerName: currentUser.name,
    pin: generatePin(),
    participants: [
      {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
        status: "confirmed",
      },
    ],
  };

  createdSessions = [...createdSessions, session];
  sessions = [...sessions, session];
  persistCreatedSessions();
  return session;
}

export function getSessions(): SportSession[] {
  synchronizeCurrentUserDisplay();
  return sessions;
}

export function getSessionById(
  sessionId: string | undefined,
): SportSession | undefined {
  if (!sessionId) {
    return undefined;
  }

  synchronizeCurrentUserDisplay();
  return sessions.find((session) => session.id === sessionId);
}

// Entdecken/Karte zeigen nur zukünftige oder laufende Sessions (B1 DLG-02/DLG-03);
// abgeschlossene Sessions erscheinen ausschließlich unter "Meine Sessions" (UC-11).
export function getDiscoverableSessions(): SportSession[] {
  synchronizeCurrentUserDisplay();
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

export function getSessionsBySportKey(
  sportKey: SportKey | "Alle",
): SportSession[] {
  const discoverable = getDiscoverableSessions();

  if (sportKey === "Alle") {
    return discoverable;
  }

  return discoverable.filter((session) => session.sportKey === sportKey);
}

function isMySession(session: SportSession): boolean {
  const currentUser = getCurrentUser();
  return (
    session.organizerId === currentUser.id ||
    session.participants.some((participant) => participant.id === currentUser.id)
  );
}

// "Meine Sessions" (B1 DLG-07): bevorstehende Sessions mit eigener Beteiligung (UC-05).
export function getMyUpcomingSessions(): SportSession[] {
  synchronizeCurrentUserDisplay();
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
  synchronizeCurrentUserDisplay();
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
  const currentUser = getCurrentUser();
  const session = getSessionById(sessionId);

  if (
    !session ||
    getSessionStatus(session) === "completed" ||
    session.participants.some((participant) => participant.id === currentUser.id) ||
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
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
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
  const currentUser = getCurrentUser();
  const session = getSessionById(sessionId);
  const participation = session?.participants.find(
    (participant) => participant.id === currentUser.id,
  );

  if (!session || getSessionStatus(session) !== "active" || !participation) {
    return session;
  }

  const updatedSession: SportSession = {
    ...session,
    participants: session.participants.map((participant) =>
      participant.id === currentUser.id
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
