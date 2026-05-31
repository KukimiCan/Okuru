import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
};

const authEnabled = false;

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  if (authEnabled) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
