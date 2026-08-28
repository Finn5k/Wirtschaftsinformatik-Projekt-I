import type { Session } from "@supabase/supabase-js";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  clearCurrentProfile,
  loadCurrentProfile,
} from "../services/userService";
import type { SignInResult, SignUpResult } from "../types/result";
import type { UserProfile } from "../types/user";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./authContext";

// Anmeldesitzung über NB-02 Supabase Auth (S1.3, UC-01).
//
// ADR-002 ordnet die Auth-Sitzung ausdrücklich dem Baustein App-Shell &
// Navigation zu, nicht der Service-Schicht — deshalb liegt sie hier und nicht
// unter src/services/. Der fachliche Profilzugriff (my_profile,
// sport_preference) bleibt dagegen im userService.

/**
 * Supabase meldet Fehler mit stabilen `code`-Werten. Nur die fachlich
 * unterscheidbaren Ausgänge werden auf einen Ergebniscode abgebildet; alles
 * Übrige bleibt ein technischer Fehler und wird nicht umgedeutet (A08 8.5.4).
 */
function signInRejection(code: string | undefined) {
  if (code === "invalid_credentials") {
    return "INVALID_CREDENTIALS" as const;
  }

  if (code === "email_not_confirmed") {
    return "EMAIL_NOT_CONFIRMED" as const;
  }

  return null;
}

function signUpRejection(code: string | undefined) {
  if (code === "user_already_exists" || code === "email_exists") {
    return "EMAIL_ALREADY_REGISTERED" as const;
  }

  if (code === "weak_password") {
    return "WEAK_PASSWORD" as const;
  }

  if (code === "email_address_invalid" || code === "validation_failed") {
    return "INVALID_EMAIL" as const;
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);

  const adoptSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      clearCurrentProfile();
      setUser(null);
      setStatus("anonymous");
      return;
    }

    const result = await loadCurrentProfile(session.user.email ?? "");

    if (result.kind === "ok") {
      setUser(result.data);
      setStatus("authenticated");
      return;
    }

    // Die Sitzung besteht, das Profil ist aber nicht ladbar. Den Nutzer
    // trotzdem als angemeldet zu führen, würde jede profilabhängige Anzeige
    // brechen; die Sitzung wird deshalb verworfen.
    await supabase.auth.signOut();
    clearCurrentProfile();
    setUser(null);
    setStatus("anonymous");
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        void adoptSession(data.session);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) {
          void adoptSession(session);
        }
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [adoptSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,

      signIn: async (email, password): Promise<SignInResult> => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          const rejection = signInRejection(error.code);
          return rejection
            ? { kind: "rejected", code: rejection }
            : { kind: "failed", cause: error };
        }

        await adoptSession(data.session);
        return { kind: "ok", code: "OK", data: null };
      },

      signUp: async (email, password, displayName): Promise<SignUpResult> => {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          // Der Anzeigename landet in raw_user_meta_data; der Trigger
          // handle_new_auth_user legt daraus das Profil an (D1.4, UC-01).
          options: { data: { display_name: displayName.trim() } },
        });

        if (error) {
          const rejection = signUpRejection(error.code);
          return rejection
            ? { kind: "rejected", code: rejection }
            : { kind: "failed", cause: error };
        }

        // Ist im Projekt die E-Mail-Bestätigung aktiv, entsteht zwar ein
        // Konto, aber keine Sitzung. UC-01 sieht diesen Zwischenschritt nicht
        // vor; der Nutzer erhält deshalb eine erklärende Meldung statt einer
        // stillen Weiterleitung.
        if (!data.session) {
          return { kind: "rejected", code: "EMAIL_NOT_CONFIRMED" };
        }

        await adoptSession(data.session);
        return { kind: "ok", code: "OK", data: null };
      },

      signOut: async () => {
        await supabase.auth.signOut();
        clearCurrentProfile();
        setUser(null);
        setStatus("anonymous");
      },

      refreshProfile: async () => {
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          const result = await loadCurrentProfile(data.session.user.email ?? "");

          if (result.kind === "ok") {
            setUser(result.data);
          }
        }
      },
    }),
    [adoptSession, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
