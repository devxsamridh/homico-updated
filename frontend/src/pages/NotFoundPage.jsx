import Reveal from "../components/Reveal.jsx";
import { HouseLine } from "@phosphor-icons/react";
import { Button } from "../components/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-3 text-center lg:py-4">
      <Reveal className="max-w-md mx-auto">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary dark:bg-primary/20">
          <HouseLine size={32} weight="duotone" />
        </div>
        <h1 className="mt-6 text-6xl font-black text-ink">404</h1>
        <p className="mt-2 text-lg font-semibold text-ink">Page Not Found</p>
        <p className="mt-2 text-sm text-ink-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button to="/" size="md" className="mt-6">
          Return Home
        </Button>
      </Reveal>
    </div>
  );
}
