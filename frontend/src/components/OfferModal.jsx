import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkle } from "@phosphor-icons/react";
import { OFFER } from "../config/offers.js";

/**
 * Offer modal — shown once per 24 h.
 * Contains only real, honest product facts. No coupon codes.
 * Monochrome styling.
 */
export default function OfferModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(OFFER.storageKey);
      const expired = !seen || Date.now() - Number(seen) > OFFER.ttlMs;
      if (expired) {
        const timer = setTimeout(() => setOpen(true), 3500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable — skip
    }
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(OFFER.storageKey, String(Date.now()));
    } catch {}
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Card */}
          <motion.div
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-surface shadow-soft-lg"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Transparent pricing information"
          >
            {/* Top neutral accent bar */}
            <div className="h-1 w-full bg-line" />

            <div className="p-6">
              {/* Close */}
              <button
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-xl p-1.5 text-ink-faint hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X size={16} weight="bold" />
              </button>

              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-muted text-ink">
                <Sparkle size={24} weight="duotone" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-ink">{OFFER.headline}</h2>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{OFFER.body}</p>

              {/* CTA */}
              <div className="mt-6 flex items-center gap-3">
                <Link
                  to={OFFER.ctaHref}
                  onClick={close}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:bg-primary-strong hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {OFFER.cta}
                </Link>
                <button
                  onClick={close}
                  className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
