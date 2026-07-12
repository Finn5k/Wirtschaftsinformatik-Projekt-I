import type { Court } from "../types/session";

// Court-Verzeichnis gemäß Spezifikation D1 (court) und B1 DLG-05 (UC-10).
export const mockCourts: Court[] = [
  {
    id: "court-wieseckaue",
    name: "Stadtpark Wieseckaue",
    city: "Gießen",
    address: "Eingang Stadtpark",
    latitude: 50.5926,
    longitude: 8.6909,
  },
  {
    id: "court-giessen-west",
    name: "Sportplatz Gießen West",
    city: "Gießen",
    address: "Kunstrasenplatz am Sportgelände",
    latitude: 50.5847,
    longitude: 8.6598,
  },
  {
    id: "court-lahnradweg",
    name: "Lahnradweg",
    city: "Gießen",
    address: "Startpunkt Lahnbrücke",
    latitude: 50.5764,
    longitude: 8.6847,
  },
  {
    id: "court-campus",
    name: "Campus Court",
    city: "Friedberg",
    address: "Basketballplatz neben Gebäude A",
    latitude: 50.3372,
    longitude: 8.7558,
  },
  {
    id: "court-thm-halle",
    name: "THM Sporthalle",
    city: "Gießen",
    latitude: 50.5878,
    longitude: 8.6833,
  },
  {
    id: "court-ringallee",
    name: "Hallenbad Ringallee",
    city: "Gießen",
    latitude: 50.5967,
    longitude: 8.6849,
  },
];

export function getCourtById(courtId: string): Court | undefined {
  return mockCourts.find((court) => court.id === courtId);
}
