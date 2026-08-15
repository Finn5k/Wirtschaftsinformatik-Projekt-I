import { type ReactNode, useMemo, useState } from "react";
import { AuthContext, type AuthContextValue } from "./authContext";

const AUTH_STORAGE_KEY = "localcourt.mock-authenticated";

function readStoredAuthState(): boolean {
  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readStoredAuthState);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      login: () => {
        window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
        setIsAuthenticated(true);
      },
      logout: () => {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
