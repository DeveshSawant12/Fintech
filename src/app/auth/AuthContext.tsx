import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type AuthUser,
  type AuthSession,
  getStoredSession,
  logout as serviceLogout,
  storeSession,
} from "./authService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Call after a successful login / OTP verification to set the session */
  setSession: (session: AuthSession, remember: boolean) => void;
  logout: () => void;
  /** Refresh user fields in-place (e.g. after profile update) */
  updateUser: (patch: Partial<AuthUser>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading]  = useState(true);

  // Rehydrate from storage on mount
  useEffect(() => {
    const stored = getStoredSession();
    if (stored) setSessionState(stored);
    setIsLoading(false);
  }, []);

  const setSession = useCallback(
    (newSession: AuthSession, remember: boolean) => {
      storeSession(newSession, remember);
      setSessionState(newSession);
    },
    []
  );

  const logout = useCallback(() => {
    serviceLogout();
    setSessionState(null);
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setSessionState((prev) => {
      if (!prev) return prev;
      const updated: AuthSession = {
        ...prev,
        user: { ...prev.user, ...patch },
      };
      // Persist the update
      const inLocal = !!localStorage.getItem("sf_session");
      storeSession(updated, inLocal);
      return updated;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: !!session,
      isLoading,
      setSession,
      logout,
      updateUser,
    }),
    [session, isLoading, setSession, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}