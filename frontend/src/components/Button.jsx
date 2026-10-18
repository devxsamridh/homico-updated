/**
 * Token-based Button with variant and size support.
 * Monochrome Black/White theme.
 * Variants: primary | outline | ghost | secondary | danger
 * Sizes: sm | md | lg
 */

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const sizes = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:bg-primary-strong hover:shadow-glow focus-visible:ring-primary",
  outline:
    "border border-line bg-transparent text-ink hover:bg-surface-muted focus-visible:ring-primary",
  ghost:
    "text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:ring-primary",
  secondary:
    "bg-surface border border-line text-ink shadow-soft-xs hover:border-primary/40 hover:bg-surface-muted focus-visible:ring-primary",
  danger:
    "bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5 focus-visible:ring-red-500",
};

export default function Button({ variant = "primary", size = "md", className = "", ...props }) {
  return (
    <button
      {...props}
      className={`${base} ${sizes[size] ?? sizes.md} ${variants[variant] ?? variants.primary} ${className}`}
    />
  );
}
