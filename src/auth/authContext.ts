import { createContext, useContext } from "react";
import type { SignInResult, SignUpResult } from "../types/result";
import type { UserProfile } from "../types/user";

/**
 * `loading` ist ein eigener Zustand und kein Sonderfall von `anonymous`:
 * Beim Seitenaufruf stellt Supabase die gespeicherte Sitzung asynchron wieder
 * her. Ohne diesen Zustand würde `ProtectedRoute` jeden Reload kurzzeitig als
 * „nicht angemeldet" werten und zu DLG-01 umleiten.
 */
export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface AuthContextValue {
  status: AuthStatus;
  /** Profil des angemeldeten Nutzers, sonst `null`. */
  user: UserProfile | null;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  /** Lädt das Profil neu, etwa nach einer Änderung in DLG-08. */
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
