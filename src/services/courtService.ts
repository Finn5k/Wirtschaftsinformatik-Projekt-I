import { mockCourts } from "../data/mockCourts";
import type { Court } from "../types/session";

const CREATED_COURTS_STORAGE_KEY = "localcourt.mock-created-courts";

function readCreatedCourts(): Court[] {
  const storedCourts = window.localStorage.getItem(CREATED_COURTS_STORAGE_KEY);

  if (!storedCourts) {
    return [];
  }

  try {
    const parsedCourts: unknown = JSON.parse(storedCourts);
    return Array.isArray(parsedCourts) ? (parsedCourts as Court[]) : [];
  } catch {
    return [];
  }
}

let createdCourts = readCreatedCourts();

export function getCourts(): Court[] {
  return [...mockCourts, ...createdCourts];
}

export function createCourt(court: Court): Court {
  createdCourts = [...createdCourts, court];
  window.localStorage.setItem(
    CREATED_COURTS_STORAGE_KEY,
    JSON.stringify(createdCourts),
  );
  return court;
}
