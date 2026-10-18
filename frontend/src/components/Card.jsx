/**
 * Generic surface card. Pass `interactive` for hover/focus lift.
 * Uses CSS variable tokens — no hardcoded colours.
 */
export default function Card({ className = "", interactive = false, onClick, children, ...props }) {
  const interactiveClasses = interactive || onClick
    ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-soft-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    : "";

  return (
    <div
      className={`card-surface p-5 transition-all duration-200 ease-smooth ${interactiveClasses} ${className}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      onKeyDown={onClick ? (e) => (e.key === "Enter" || e.key === " ") && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
