import { Link } from "react-router-dom";
import { Heart } from "@phosphor-icons/react";
import { SUPPORT_EMAIL } from "../config/site.js";
import Logo from "./Logo.jsx";

const NAV = [
  { label: "Home",     to: "/" },
  { label: "Services", to: "/services" },
  { label: "Materials",to: "/materials" },
  { label: "Help",     to: "/help" },
];

const LEGAL = [
  { label: "Login",    to: "/login" },
  { label: "Register", to: "/register" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink-muted leading-relaxed">
              Book home services, source raw materials, and manage full construction — all from one platform.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-faint">
              Navigate
            </h3>
            <ul className="space-y-2.5">
              {NAV.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-faint">
              Contact
            </h3>
            <p className="text-sm text-ink-muted">
              Questions or issues? Email us at{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-ink underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Homico. Student portfolio project.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={13} weight="fill" className="text-ink" /> for the interview
          </p>
        </div>
      </div>
    </footer>
  );
}
