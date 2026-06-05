import type { SportSession } from "../types/session";

export const mockSessions: SportSession[] = [
  {
    id: "morning-run",
    title: "Morning Run",
    sportType: "Laufen",
    locationName: "Treptower Park",
    city: "Berlin",
    dateLabel: "Heute",
    timeLabel: "18:00",
    description:
      "Starte mit uns aktiv in den Abend. Lockere Laufrunde durch den Park mit moderatem Tempo.",
    meetingPoint: "Parkeingang Treptower Park",
    durationLabel: "ca. 60 Min.",
    distanceLabel: "5 km",
    participantsCount: 8,
    maxParticipants: 15,
    recommendedRank: "Beginner 2",
    status: "OPEN",
    organizerName: "Lena Aktiv",
    xpReward: 80,
    imageUrl:
      "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=900&q=80",
    participants: [
      { id: "u1", name: "Lena", checkedIn: true },
      { id: "u2", name: "Max", checkedIn: false },
      { id: "u3", name: "Sara", checkedIn: false },
    ],
  },
  {
    id: "afterwork-football",
    title: "Afterwork Fußball",
    sportType: "Fußball",
    locationName: "Volkspark",
    city: "Berlin",
    dateLabel: "Heute",
    timeLabel: "19:30",
    description:
      "Lockeres Kleinfeldspiel nach der Arbeit. Alle sind willkommen, Teams werden vor Ort gebildet.",
    meetingPoint: "Kunstrasenplatz am Volkspark",
    durationLabel: "ca. 90 Min.",
    participantsCount: 10,
    maxParticipants: 16,
    recommendedRank: "Beginner 1",
    status: "OPEN",
    organizerName: "Jonas",
    xpReward: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
    participants: [
      { id: "u4", name: "Jonas", checkedIn: false },
      { id: "u5", name: "Mira", checkedIn: false },
    ],
  },
  {
    id: "sunset-ride",
    title: "Sunset Ride",
    sportType: "Radfahren",
    locationName: "Tempelhofer Feld",
    city: "Berlin",
    dateLabel: "Morgen",
    timeLabel: "17:00",
    description:
      "Entspannte Fahrradrunde zum Sonnenuntergang. Ideal für alle, die eine lockere Runde fahren möchten.",
    meetingPoint: "Eingang Tempelhofer Feld",
    durationLabel: "ca. 75 Min.",
    distanceLabel: "18 km",
    participantsCount: 6,
    maxParticipants: 12,
    recommendedRank: "Beginner 2",
    status: "OPEN",
    organizerName: "Amir",
    xpReward: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80",
    participants: [
      { id: "u6", name: "Amir", checkedIn: false },
      { id: "u7", name: "Noah", checkedIn: false },
    ],
  },
];