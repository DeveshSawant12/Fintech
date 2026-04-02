import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "./AuthContext";

interface Props {
  children: ReactNode;
  /** Override redirect target (default: /login) */
  redirectTo?: string;
}

/**
 * Wrap any route element with <ProtectedRoute> to require authentication.
 * Unauthenticated users are redirected to /login with the intended path
 * stored in location state so Login can redirect back after success.
 */
export function ProtectedRoute({ children, redirectTo = "/login" }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While rehydrating session from storage, show nothing (avoids flash)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] flex items-center justify-center">
            <span className="text-white font-bold text-xl">SF</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#1A5F3D] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  return <>{children}</>;
}

/**
 * Redirect authenticated users away from auth pages (login/signup).
 * Prevents going back to login after being logged in.
 */
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}