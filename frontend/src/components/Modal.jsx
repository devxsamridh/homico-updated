import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";

/**
 * Accessible modal dialog — focus trap, Esc close, scroll lock, animated.
 * Props:
 *   open        — boolean
 *   onClose     — () => void
 *   title       — string (rendered in <h2>)
 *   size        — "sm" | "md" | "lg" (default "md")
 *   children    — modal body content
 */
const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Modal({ open, onClose, title, size = "md", children }) {
  const dialogRef = useRef(null);
  const prevFocusRef = useRef(null);

  /* Lock body scroll and restore focus when modal closes */
  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
      // Focus first focusable element
      requestAnimationFrame(() => {
        const el = dialogRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        el?.focus();
      });
    } else {
      document.body.style.overflow = "";
      prevFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Esc key close */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* Focus trap */
  const handleKeyDown = (e) => {
    if (e.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={`relative z-10 w-full ${sizes[size]} max-h-[90vh] overflow-y-auto rounded-3xl bg-surface shadow-soft-lg`}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-muted px-6 py-4">
              {title && (
                <h2 id="modal-title" className="text-lg font-bold text-ink">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="ml-auto rounded-xl p-1.5 text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

