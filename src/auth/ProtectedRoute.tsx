import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./authContext";

// Weiterleitung nicht angemeldeter Nutzer gemäß B1.5.2. Geschützt sind laut
// B1.5.2 nur Beitreten, Erstellen, Check-in, Meine Sessions und Profil —
// Suche und Detailansicht bleiben ohne Anmeldung nutzbar (UC-02, B1.2).
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  // Solange die gespeicherte Sitzung wiederhergestellt wird, ist noch nicht
  // entschieden, ob der Nutzer angemeldet ist. Eine Weiterleitung an dieser
  // Stelle würde jeden Reload fälschlich abweisen (B1.5.4, Ladezustand).
  if (status === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[50vh] items-center justify-center"
      >
        <p className="text-sm font-bold text-slate-500">Anmeldung wird geprüft …</p>
      </div>
    );
  }

  if (status === "anonymous") {
    const requestedPath = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(requestedPath)}`}
        replace
      />
    );
  }

  return <Outlet />;
}
