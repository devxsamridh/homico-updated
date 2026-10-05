import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBlockStaff } from "@/lib/use-block-staff";

export const Route = createFileRoute("/checkout/failed")({
  validateSearch: z.object({ ref: z.string().optional() }),
  component: FailedPage,
  head: () => ({ meta: [{ title: "Payment failed — Homico" }] }),
});

function FailedPage() {
  const { ref } = Route.useSearch();
  const blocked = useBlockStaff();
  if (blocked) return null;
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md text-center rounded-2xl border border-border bg-card p-10 shadow-elegant">
          <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Payment failed</h1>
          <p className="text-muted-foreground mt-2">Your order was saved but the payment didn't go through. You can retry from the cart.</p>
          {ref && <p className="text-xs font-mono text-muted-foreground mt-3">Ref: {ref.slice(0, 8)}</p>}
          <div className="flex gap-2 justify-center mt-6">
            <Button asChild variant="outline"><Link to="/dashboard/orders">View orders</Link></Button>
            <Button asChild variant="hero"><Link to="/services/materials">Try again</Link></Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
