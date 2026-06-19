import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { CheckInPage } from "./pages/CheckInPage";
import { CreateSessionPage } from "./pages/CreateSessionPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { EventsPage } from "./pages/EventsPage";
import { MapPage } from "./pages/MapPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SessionDetailPage } from "./pages/SessionDetailPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/discover" replace />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/sessions/new" element={<CreateSessionPage />} />
        <Route path="/sessions/:sessionId" element={<SessionDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/check-in/:sessionId" element={<CheckInPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}