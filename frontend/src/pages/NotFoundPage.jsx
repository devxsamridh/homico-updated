import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";
import { HouseLine } from "@phosphor-icons/react";

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <Reveal className="max-w-md mx-auto">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary dark:bg-primary/20">
          <HouseLine size={32} weight="duotone" />
        </div>
        <h1 className="mt-6 text-6xl font-black text-ink">404</h1>
        <p className="mt-2 text-lg font-semibold text-ink">Page Not Found</p>
        <p className="mt-2 text-sm text-ink-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-strong hover:shadow-glow"
        >
          Return Home
        </Link>
      </Reveal>
    </div>
  );
}
