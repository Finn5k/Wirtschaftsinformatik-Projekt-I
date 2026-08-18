import { mockUser } from "../data/mockUser";
import { sportTypes } from "../data/sports";
import type { SportType } from "../types/session";
import type { UserProfile } from "../types/user";

const PROFILE_STORAGE_KEY = "localcourt.mock-profile";

export interface UpdateProfileInput {
  name: string;
  city: string;
  preferredSports: SportType[];
}

function readStoredProfile(): UserProfile {
  const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!storedProfile) {
    return { ...mockUser, preferredSports: [...mockUser.preferredSports] };
  }

  try {
    const parsedProfile = JSON.parse(storedProfile) as Partial<UserProfile>;
    const preferredSports = Array.isArray(parsedProfile.preferredSports)
      ? parsedProfile.preferredSports.filter((sport): sport is SportType =>
          sportTypes.includes(sport as SportType),
        )
      : mockUser.preferredSports;

    return {
      ...mockUser,
      name:
        typeof parsedProfile.name === "string" && parsedProfile.name.trim()
          ? parsedProfile.name.trim()
          : mockUser.name,
      city:
        typeof parsedProfile.city === "string"
          ? parsedProfile.city.trim()
          : mockUser.city,
      preferredSports: [...new Set(preferredSports)],
    };
  } catch {
    return { ...mockUser, preferredSports: [...mockUser.preferredSports] };
  }
}

let currentUser = readStoredProfile();

export function getCurrentUser(): UserProfile {
  return {
    ...currentUser,
    preferredSports: [...currentUser.preferredSports],
  };
}

export function updateCurrentUser(input: UpdateProfileInput): UserProfile {
  currentUser = {
    ...currentUser,
    name: input.name.trim(),
    city: input.city.trim(),
    preferredSports: [...new Set(input.preferredSports)],
  };
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(currentUser));
  return getCurrentUser();
}
