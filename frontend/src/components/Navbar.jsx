import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SunDim,
  Moon,
  SignOut,
  List,
  X,
  User,
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Logo from "./Logo.jsx";

const NAV_LINKS = [
  { to: "/",          label: "Home",          end: true },
  { to: "/services",  label: "Services",      end: false },
  { to: "/materials", label: "Materials",     end: false },
  { to: "/help",      label: "Help",          end: false },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef(null);

  /* Close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Trap focus inside mobile menu */
  useEffect(() => {
    if (!mobileOpen) return;
    const el = mobileMenuRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    focusable[0]?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted transition-colors duration-200 hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <>
      {/* Skip to content */}
      <a href="#main-content" className="skip-link">Skip to content</a>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? "border-line bg-surface/95 shadow-soft backdrop-blur-md"
            : "border-transparent bg-bg/80 backdrop-blur-sm"
        }`}
      >
        <nav
          className="container mx-auto flex h-[4.25rem] items-center justify-between gap-4 px-4 md:px-6"
          aria-label="Primary navigation"
        >
          <Logo />

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex" role="list">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                role="listitem"
                className={({ isActive }) =>
                  `relative rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? "bg-ink/10 text-ink"
                      : "text-ink-muted hover:bg-ink/5 hover:text-ink"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} className={iconBtn}>
              {theme === "dark"
                ? <SunDim size={20} weight="duotone" />
                : <Moon size={20} weight="duotone" />
              }
            </button>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:bg-primary-strong hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex"
                >
                  <User size={16} weight="duotone" />
                  Dashboard
                </Link>
                <button onClick={logout} aria-label="Sign out" className={iconBtn}>
                  <SignOut size={20} weight="duotone" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-xl px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:bg-primary-strong hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Get started
                </Link>
              </>
            )}

            {/* Hamburger (mobile) */}
            <button
              className={`${iconBtn} md:hidden`}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              id="mobile-menu"
              ref={mobileMenuRef}
              className="fixed inset-x-0 top-[4.25rem] z-40 mx-4 rounded-3xl border border-line bg-surface p-5 shadow-soft-lg md:hidden"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
              role="dialog"
              aria-label="Mobile navigation"
            >
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-ink/10 text-ink"
                          : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                <div className="my-2 border-t border-line" />

                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                    >
                      <User size={16} weight="duotone" />
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
                    >
                      <SignOut size={16} weight="duotone" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="rounded-xl px-4 py-3 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
