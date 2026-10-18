/** Animated skeleton placeholder for loading states. */
export default function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`skeleton rounded-xl ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Compound: a card-shaped skeleton block. */
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`card-surface p-5 ${className}`} aria-hidden="true">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

