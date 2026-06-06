import { mockUser } from "../data/mockUser";
import type { UserProfile } from "../types/user";

export function getCurrentUser(): UserProfile {
  return mockUser;
}