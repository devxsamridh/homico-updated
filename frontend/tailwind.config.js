/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Inter'", "system-ui", "-apple-system", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      /* ── Token-based colours (RGB triplets from CSS variables) ────────────── */
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          muted:   "rgb(var(--surface-muted) / <alpha-value>)",
        },
        primary: {
          DEFAULT:    "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
          strong:     "rgb(var(--primary-strong) / <alpha-value>)",
        },
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          soft:    "rgb(var(--accent-soft) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted:   "rgb(var(--ink-muted) / <alpha-value>)",
          faint:   "rgb(var(--ink-faint) / <alpha-value>)",
        },
        line: "rgb(var(--line) / <alpha-value>)",
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          muted:   "rgb(var(--border-muted) / <alpha-value>)",
        },
      },
      /* ── Typography scale ─────────────────────────────────────────────────── */
      fontSize: {
        "display-lg": ["3.5rem",  { lineHeight: "1.07", letterSpacing: "-0.025em", fontWeight: "800" }],
        "display":    ["2.75rem", { lineHeight: "1.1",  letterSpacing: "-0.02em",  fontWeight: "700" }],
        "heading-lg": ["2rem",    { lineHeight: "1.2",  letterSpacing: "-0.015em", fontWeight: "700" }],
        "heading":    ["1.5rem",  { lineHeight: "1.25", letterSpacing: "-0.01em",  fontWeight: "600" }],
        "heading-sm": ["1.125rem",{ lineHeight: "1.35",                            fontWeight: "600" }],
        "body":       ["1rem",    { lineHeight: "1.65",                            fontWeight: "400" }],
        "body-sm":    ["0.875rem",{ lineHeight: "1.6",                             fontWeight: "400" }],
        "caption":    ["0.75rem", { lineHeight: "1.5",                             fontWeight: "500" }],
      },
      /* ── Shadows ─────────────────────────────────────────────────────────── */
      boxShadow: {
        "soft-xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "soft":    "0 0 0 1px rgb(255 255 255 / 0.06), 0 4px 16px -2px rgb(0 0 0 / 0.3)",
        "soft-md": "0 0 0 1px rgb(255 255 255 / 0.08), 0 8px 24px -4px rgb(0 0 0 / 0.4)",
        "soft-lg": "0 0 0 1px rgb(255 255 255 / 0.08), 0 16px 40px -12px rgb(0 0 0 / 0.5)",
        "glow":    "0 0 0 1px rgb(255 255 255 / 0.12), 0 8px 30px -4px rgb(255 255 255 / 0.12)",
        "glow-sm": "0 0 0 1px rgb(255 255 255 / 0.10)",
        "inner-soft": "inset 0 1px 2px rgb(255 255 255 / 0.05)",
      },
      /* ── Border radius ───────────────────────────────────────────────────── */
      borderRadius: {
        "2xl":  "1rem",
        "3xl":  "1.25rem",
        "4xl":  "1.5rem",
      },
      /* ── Keyframes (CSS-based animations) ────────────────────────────────── */
      keyframes: {
        float:       { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
        shimmer:     { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        blob:        { "0%,100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }, "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" } },
        marquee:     { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "gradient-x":{ "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        "fade-in":   { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up":  { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "pulse-ring":{ "0%": { transform: "scale(1)", opacity: "0.6" }, "100%": { transform: "scale(1.6)", opacity: "0" } },
      },
      animation: {
        float:        "float 6s ease-in-out infinite",
        shimmer:      "shimmer 1.5s linear infinite",
        blob:         "blob 10s ease-in-out infinite",
        marquee:      "marquee 30s linear infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        "fade-in":    "fade-in 0.4s ease-out both",
        "slide-up":   "slide-up 0.4s ease-out both",
        "pulse-ring": "pulse-ring 1.2s ease-out infinite",
      },
      /* ── Timing ──────────────────────────────────────────────────────────── */
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      /* ── Background utilities ────────────────────────────────────────────── */
      backgroundSize: {
        "200%": "200% 200%",
      },
    },
  },
  plugins: [],
};
