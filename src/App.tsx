import { Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { CheckInPage } from "./pages/CheckInPage";
import { CreateSessionPage } from "./pages/CreateSessionPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { LoginPage } from "./pages/LoginPage";
import { MapPage } from "./pages/MapPage";
import { MySessionsPage } from "./pages/MySessionsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SessionDetailPage } from "./pages/SessionDetailPage";

export default function App() {
  return (
    <Routes>
      {/* DLG-01: eigener Dialog ohne Hauptnavigation (B1) */}
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        {/*
          Ohne Anmeldung nutzbar: B1.5.2 zählt Suche und Detailansicht nicht zu
          den geschützten Aktionen, UC-02 setzt für die Suche ausdrücklich keine
          Anmeldung voraus. Die RLS-Policies geben genau diese Daten auch
          unangemeldet frei (N2.2).
        */}
        <Route path="/" element={<Navigate to="/discover" replace />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/sessions/:sessionId" element={<SessionDetailPage />} />

        {/* Geschützte Aktionen nach B1.5.2 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/sessions/new" element={<CreateSessionPage />} />
          <Route path="/my-sessions" element={<MySessionsPage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/discover" replace />} />
      </Route>
    </Routes>
  );
}
