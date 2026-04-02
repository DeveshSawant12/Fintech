import {
  createBrowserRouter,
  Outlet,
  useLocation,
} from "react-router";
import { useEffect } from "react";
import { Home }              from "./pages/Home";
import { Login }             from "./pages/Login";
import { Signup }            from "./pages/Signup";
import { Dashboard }         from "./pages/Dashboard";
import { Services }          from "./pages/Services";
import { SIPCalculator }     from "./pages/SIPCalculator";
import { LumpsumCalculator } from "./pages/LumpsumCalculator";
import { FinancialPlanner }  from "./pages/FinancialPlanner";
import { Webinars }          from "./pages/Webinars";
import { Admin }             from "./pages/Admin";
import { Insurance }         from "./pages/Insurance";
import { NotFound }          from "./pages/NotFound";
import { ProtectedRoute, GuestOnlyRoute } from "./auth/ProtectedRoute";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // ── Public routes ──────────────────────────────────────────────────────
      { path: "/",        Component: Home },
      { path: "/services", Component: Services },
      { path: "/webinars", Component: Webinars },
      { path: "/insurance", Component: Insurance },

      // ── Auth routes (redirect to dashboard if already logged in) ───────────
      {
        path: "/login",
        element: (
          <GuestOnlyRoute>
            <Login />
          </GuestOnlyRoute>
        ),
      },
      {
        path: "/signup",
        element: (
          <GuestOnlyRoute>
            <Signup />
          </GuestOnlyRoute>
        ),
      },

      // ── Protected routes (require authentication) ──────────────────────────
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/calculator/sip",
        element: (
          <ProtectedRoute>
            <SIPCalculator />
          </ProtectedRoute>
        ),
      },
      {
        path: "/calculator/lumpsum",
        element: (
          <ProtectedRoute>
            <LumpsumCalculator />
          </ProtectedRoute>
        ),
      },
      {
        path: "/planner",
        element: (
          <ProtectedRoute>
            <FinancialPlanner />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        ),
      },

      // ── 404 ───────────────────────────────────────────────────────────────
      { path: "*", Component: NotFound },
    ],
  },
]);