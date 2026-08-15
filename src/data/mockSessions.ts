import type { SportSession } from "../types/session";
import { mockUser } from "./mockUser";

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
    sportType: "Laufen",
    courtId: "court-wieseckaue",
    locationName: "Stadtpark Wieseckaue",
    city: "Gießen",
    startAt: startAtDayOffset(1, 8),
    latitude: 50.5926,
    longitude: 8.6909,
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
    sportType: "Fußball",
    courtId: "court-giessen-west",
    locationName: "Sportplatz Gießen West",
    city: "Gießen",
    startAt: relativeStartAt({ minutes: -30 }),
    latitude: 50.5847,
    longitude: 8.6598,
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
    sportType: "Radfahren",
    courtId: "court-lahnradweg",
    locationName: "Lahnradweg",
    city: "Gießen",
    startAt: startAtDayOffset(1, 19),
    latitude: 50.5764,
    longitude: 8.6847,
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
    sportType: "Basketball",
    courtId: "court-campus",
    locationName: "Campus Court",
    city: "Friedberg",
    startAt: startAtDayOffset(1, 20),
    latitude: 50.3372,
    longitude: 8.7558,
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
    sportType: "Badminton",
    courtId: "court-thm-halle",
    locationName: "THM Sporthalle",
    city: "Gießen",
    startAt: startAtDayOffset(2, 18, 30),
    latitude: 50.5878,
    longitude: 8.6833,
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
    sportType: "Schwimmen",
    courtId: "court-ringallee",
    locationName: "Hallenbad Ringallee",
    city: "Gießen",
    startAt: startAtDayOffset(3, 10),
    latitude: 50.5967,
    longitude: 8.6849,
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
    sportType: "Laufen",
    courtId: "court-lahnradweg",
    locationName: "Lahnradweg",
    city: "Gießen",
    startAt: startAtDayOffset(-2, 9),
    latitude: 50.5764,
    longitude: 8.6847,
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
    sportType: "Laufen",
    courtId: "court-wieseckaue",
    locationName: "Stadtpark Wieseckaue",
    city: "Gießen",
    startAt: startAtDayOffset(-14, 18),
    latitude: 50.5926,
    longitude: 8.6909,
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
