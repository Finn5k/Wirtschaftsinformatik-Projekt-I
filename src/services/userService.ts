import { mockUser } from "../data/mockUser";
import { isSportKey, sports } from "../data/sports";
import type { SportKey } from "../types/session";
import type { UserProfile } from "../types/user";

const PROFILE_STORAGE_KEY = "localcourt.mock-profile";

export interface UpdateProfileInput {
  name: string;
  city: string;
  preferredSports: SportKey[];
}

// Vor der Umstellung auf die Schluessel aus D1.4 speicherte der Prototyp die
// deutschen Anzeigenamen ("Fußball"). Bereits abgelegte Profile wuerden sonst
// wortlos ihre Sportarten verlieren. Der Umweg entfaellt mit der serverseitigen
// Profilpersistenz, die localStorage ohnehin abloest (A08 8.1.5).
function toSportKey(value: unknown): unknown {
  if (typeof value !== "string" || isSportKey(value)) {
    return value;
  }

  return sports.find((sport) => sport.displayName === value)?.key ?? value;
}

function readStoredProfile(): UserProfile {
  const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!storedProfile) {
    return { ...mockUser, preferredSports: [...mockUser.preferredSports] };
  }

  try {
    const parsedProfile = JSON.parse(storedProfile) as Partial<UserProfile>;
    const preferredSports = Array.isArray(parsedProfile.preferredSports)
      ? parsedProfile.preferredSports.map(toSportKey).filter(isSportKey)
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
