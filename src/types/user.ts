import type { Rank, SportType } from "./session";

export interface UserProfile {
  id: string;
  name: string;
  city: string;
  rank: Rank;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  preferredSports: SportType[];
  avatarUrl: string;
}