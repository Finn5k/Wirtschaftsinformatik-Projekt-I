import type { SportType } from "../types/session";

export const sportTypes = [
  "Laufen",
  "Radfahren",
  "Fußball",
  "Basketball",
  "Badminton",
  "Schwimmen",
  "Sonstiges",
] as const satisfies readonly SportType[];
