import { Link } from "react-router-dom";

/**
 * Homico Brand Logo
 * Geometry: Rounded-square tile with roof chevron over an "H" (a house that is also the letter H).
 * Props:
 *   variant: "full" | "mark"
 *   size: "sm" | "md" | "lg"
 *   className: string
 */
export default function Logo({
  variant = "full",
  size = "md",
  className = "",
}) {
  const pixelSizes = {
    sm: 28,
    md: 36,
    lg: 44,
  };

  const dim = pixelSizes[size] || 36;

  const markSvg = (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      className="shrink-0 transition-transform duration-200 group-hover:scale-[1.03]"
      role={variant === "mark" ? "img" : undefined}
      aria-label={variant === "mark" ? "Homico" : undefined}
      aria-hidden={variant === "full" ? "true" : undefined}
    >
      {/* Theme-aware tile: bg-primary / fill-primary */}
      <rect
        width="48"
        height="48"
        rx="14"
        className="fill-primary"
      />
      {/* Inner subtle stroke */}
      <rect
        width="48"
        height="48"
        rx="14"
        fill="none"
        className="stroke-line"
        strokeWidth="1"
      />
      {/* Glyph: stroke-primary-foreground */}
      <g
        fill="none"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-foreground"
      >
        <path d="M10.5 22.5 24 11l13.5 11.5" />
        <path d="M17 26v11M31 26v11M17 31.5h14" />
      </g>
    </svg>
  );

  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-xl ${className}`}
      aria-label="Homico – return to homepage"
    >
      {markSvg}
      {variant === "full" && (
        <span className="font-display text-xl font-extrabold leading-none tracking-[-0.04em] text-ink">
          Homico
        </span>
      )}
    </Link>
  );
}
