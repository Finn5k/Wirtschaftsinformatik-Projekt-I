import { Navigate, Route, Routes } from "react-router";
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
        <Route path="/" element={<Navigate to="/discover" replace />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/sessions/new" element={<CreateSessionPage />} />
        <Route path="/sessions/:sessionId" element={<SessionDetailPage />} />
        <Route path="/my-sessions" element={<MySessionsPage />} />
        <Route path="/check-in/:sessionId" element={<CheckInPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/discover" replace />} />
      </Route>
    </Routes>
  );
}
