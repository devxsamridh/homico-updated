/**
 * Badge — inline status chip with semantic tone variants.
 * Non-semantic tones collapsed to monochrome zinc/neutral greys.
 * Semantic status tones (success, warning, danger, info) kept low-saturation for meaning.
 */

const tones = {
  default: "bg-surface-muted text-ink border border-line",
  neutral: "bg-ink/10 text-ink border border-line",
  success: "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40",
  warning: "bg-amber-950/40 text-amber-400 border border-amber-900/40",
  danger:  "bg-red-950/40 text-red-400 border border-red-900/40",
  info:    "bg-zinc-800 text-zinc-300 border border-zinc-700",
  accent:  "bg-ink/10 text-ink border border-line",
};

export default function Badge({ tone = "default", className = "", children, ...props }) {
  return (
    <span
      className={`badge ${tones[tone] ?? tones.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
