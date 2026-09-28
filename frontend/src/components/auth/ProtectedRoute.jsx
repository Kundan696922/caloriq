import { Navigate, Outlet, useLocation } from "react-router-dom";
import BackendLoader from "../common/Backendloader";

import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <BackendLoader
          status="checking"
          message="Checking your session"
          fullScreen={false}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
