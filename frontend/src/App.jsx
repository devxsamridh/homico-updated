import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import OfferModal from "./components/OfferModal.jsx";

/* ── Lazy-loaded pages ──────────────────────────────────────────────────── */
const HomePage      = lazy(() => import("./pages/HomePage.jsx"));
const ServicesPage  = lazy(() => import("./pages/ServicesPage.jsx"));
const MaterialsPage = lazy(() => import("./pages/MaterialsPage.jsx"));
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const LoginPage     = lazy(() => import("./pages/LoginPage.jsx"));
const RegisterPage  = lazy(() => import("./pages/RegisterPage.jsx"));
const HelpDeskPage  = lazy(() => import("./pages/HelpDeskPage.jsx"));
const NotFoundPage  = lazy(() => import("./pages/NotFoundPage.jsx"));

/* ── Page-level loading fallback ──────────────────────────────────────── */
function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="text-sm text-ink-faint">Loading…</p>
      </div>
    </div>
  );
}

/**
 * Top-level route table.
 * Auth-only routes are wrapped with <ProtectedRoute />.
 */
export default function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />

      <main id="main-content" className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/"          element={<HomePage />} />
              <Route path="/services"  element={<ServicesPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/login"     element={<LoginPage />} />
              <Route path="/register"  element={<RegisterPage />} />
              <Route path="/help"      element={<HelpDeskPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />

      {/* Offer modal — shown 3.5s after first visit, gated 24h */}
      <OfferModal />
    </div>
  );
}
