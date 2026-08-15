import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./authContext";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
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
