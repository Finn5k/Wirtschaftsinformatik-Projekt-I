import {
  mockActivities,
  type Activity,
} from "../data/mockActivities";

export function getRecentActivities(): Activity[] {
  return mockActivities;
}