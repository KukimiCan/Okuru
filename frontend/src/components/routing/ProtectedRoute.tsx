import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../../features/auth/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isConfigured, isLoading, user } = useAuth();

  if (!isConfigured) {
    return children;
  }

  if (isLoading) {
    return (
      <section className="detail-page">
        <div>
          <h1>認証状態を確認しています</h1>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
