import type { UserProfile } from "../types/user";

export const mockUser: UserProfile = {
  id: "current-user",
  name: "Lena Aktiv",
  city: "Berlin, Deutschland",
  rank: "Beginner 2",
  level: 12,
  currentXp: 2450,
  nextLevelXp: 3500,
  streakDays: 14,
  preferredSports: ["Laufen", "Radfahren", "Fußball"],
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
};