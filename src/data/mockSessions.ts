import type { Court, SportSession } from "../types/session";
import { getCourtById } from "./mockCourts";
import { mockUser } from "./mockUser";

// D1.4: Das Koordinatenpaar traegt der Court, nicht die Session. Die Mockdaten
// referenzieren deshalb den Court aus mockCourts, statt seine Felder zu
// wiederholen.
function court(courtId: string): Court {
  const entry = getCourtById(courtId);
  if (!entry) {
    throw new Error(`Unbekannter Court in den Mockdaten: ${courtId}`);
  }
  return entry;
}

function relativeStartAt({
  days = 0,
  hours = 0,
  minutes = 0,
}: {
  days?: number;
  hours?: number;
  minutes?: number;
}): string {
  const start = new Date();
  start.setSeconds(0, 0);
  start.setDate(start.getDate() + days);
  start.setHours(start.getHours() + hours);
  start.setMinutes(start.getMinutes() + minutes);
  return start.toISOString();
}

function startAtDayOffset(days: number, hours: number, minutes = 0): string {
  const start = new Date();
  start.setDate(start.getDate() + days);
  start.setHours(hours, minutes, 0, 0);
  return start.toISOString();
}

export const mockSessions: SportSession[] = [
  {
    id: "morning-run",
    title: "Morning Run",
    sportKey: "running",
    court: court("court-wieseckaue"),
    startAt: startAtDayOffset(1, 8),
    description:
      "Starte mit uns aktiv in den Abend. Lockere Laufrunde durch die Wieseckaue mit moderatem Tempo.",
    durationMin: 60,
    participantsCount: 3,
    maxParticipants: 15,
    organizerId: "current-user",
    organizerName: "Lena Aktiv",
    pin: "4821",
    participants: [
      {
        id: "current-user",
        name: "Lena Aktiv",
        status: "confirmed",
        avatarUrl: mockUser.avatarUrl,
      },
      { id: "u2", name: "Max", status: "confirmed" },
      { id: "u3", name: "Sara", status: "confirmed" },
    ],
  },
  {
    id: "afterwork-football",
    title: "Afterwork Fußball",
    sportKey: "football",
    court: court("court-giessen-west"),
    startAt: relativeStartAt({ minutes: -30 }),
    description:
      "Lockeres Kleinfeldspiel nach Uni oder Arbeit. Alle sind willkommen, Teams werden vor Ort gebildet.",
    durationMin: 90,
    participantsCount: 3,
    maxParticipants: 16,
    organizerId: "u4",
    organizerName: "Jonas",
    pin: "7302",
    participants: [
      { id: "u4", name: "Jonas", status: "checked_in" },
      { id: "u5", name: "Mira", status: "confirmed" },
      {
        id: "current-user",
        name: "Lena Aktiv",
        status: "confirmed",
        avatarUrl: mockUser.avatarUrl,
      },
    ],
  },
  {
    id: "sunset-ride",
    title: "Sunset Ride",
    sportKey: "cycling",
    court: court("court-lahnradweg"),
    startAt: startAtDayOffset(1, 19),
    description:
      "Entspannte Fahrradrunde entlang der Lahn zum Sonnenuntergang. Ideal für alle, die eine lockere Runde fahren möchten.",
    durationMin: 75,
    participantsCount: 2,
    maxParticipants: 12,
    organizerId: "u6",
    organizerName: "Amir",
    pin: "1958",
    participants: [
      { id: "u6", name: "Amir", status: "confirmed" },
      { id: "u7", name: "Noah", status: "confirmed" },
    ],
  },
  {
    id: "campus-basketball",
    title: "Campus Basketball 3v3",
    sportKey: "basketball",
    court: court("court-campus"),
    startAt: startAtDayOffset(1, 20),
    description:
      "Schnelle 3v3 Basketball-Session auf dem Campus Court. Ideal für lockere Runs nach Uni oder Arbeit.",
    durationMin: 90,
    participantsCount: 3,
    maxParticipants: 6,
    organizerId: "u8",
    organizerName: "Chris",
    pin: "6440",
    participants: [
      { id: "u8", name: "Chris", status: "confirmed" },
      { id: "u9", name: "David", status: "confirmed" },
      { id: "u10", name: "Nina", status: "confirmed" },
    ],
  },
  {
    id: "badminton-open",
    title: "Badminton Open Court",
    sportKey: "badminton",
    court: court("court-thm-halle"),
    startAt: startAtDayOffset(2, 18, 30),
    description:
      "Offene Badminton-Session für Einsteiger und Fortgeschrittene. Schläger bitte selbst mitbringen.",
    durationMin: 120,
    participantsCount: 2,
    maxParticipants: 12,
    organizerId: "u11",
    organizerName: "Maya",
    pin: "2716",
    participants: [
      { id: "u11", name: "Maya", status: "confirmed" },
      { id: "u12", name: "Felix", status: "confirmed" },
    ],
  },
  {
    id: "swim-session",
    title: "Swim Technique Basics",
    sportKey: "swimming",
    court: court("court-ringallee"),
    startAt: startAtDayOffset(3, 10),
    description:
      "Gemeinsame Schwimmeinheit mit Fokus auf Technik, ruhigem Tempo und sauberem Einstieg.",
    durationMin: 60,
    participantsCount: 2,
    maxParticipants: 10,
    organizerId: "u13",
    organizerName: "Sophie",
    pin: "8135",
    participants: [
      { id: "u13", name: "Sophie", status: "confirmed" },
      { id: "u14", name: "Ben", status: "confirmed" },
    ],
  },
  {
    id: "lahn-loop",
    title: "Lahn Loop",
    sportKey: "running",
    court: court("court-lahnradweg"),
    startAt: startAtDayOffset(-2, 9),
    description:
      "Gemeinsame Laufrunde entlang der Lahn. Diese Session ist bereits abgeschlossen.",
    durationMin: 60,
    participantsCount: 3,
    maxParticipants: 12,
    organizerId: "u6",
    organizerName: "Amir",
    pin: "5074",
    participants: [
      { id: "u6", name: "Amir", status: "checked_in" },
      {
        id: "current-user",
        name: "Lena Aktiv",
        status: "checked_in",
        avatarUrl: mockUser.avatarUrl,
      },
      { id: "u7", name: "Noah", status: "confirmed" },
    ],
  },
  {
    id: "morning-run-vol1",
    title: "Morning Run Vol. 1",
    sportKey: "running",
    court: court("court-wieseckaue"),
    startAt: startAtDayOffset(-14, 18),
    description:
      "Die erste Ausgabe des Morning Run. Diese Session ist bereits abgeschlossen.",
    durationMin: 60,
    participantsCount: 3,
    maxParticipants: 15,
    organizerId: "current-user",
    organizerName: "Lena Aktiv",
    pin: "3390",
    participants: [
      {
        id: "current-user",
        name: "Lena Aktiv",
        status: "checked_in",
        avatarUrl: mockUser.avatarUrl,
      },
      { id: "u2", name: "Max", status: "checked_in" },
      { id: "u3", name: "Sara", status: "confirmed" },
    ],
  },
];
