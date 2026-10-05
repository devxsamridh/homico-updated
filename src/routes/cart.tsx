import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ShoppingCart, Trash2, Wrench, Package, CalendarCheck, MapPin,
  Loader2, ArrowLeft, Plus, Minus,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Your Cart — Homico" },
      { name: "description", content: "Review your selected materials and home service bookings before confirming." },
    ],
  }),
});

function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const matTotal = cart.total();
  const svcTotal = cart.servicesTotal();
  const grandTotal = matTotal + svcTotal;
  const isEmpty = cart.items.length === 0 && cart.services.length === 0;

  const confirmServices = async () => {
    if (!user) {
      toast.info("Please sign in to confirm your bookings");
      navigate({ to: "/auth" });
      return;
    }
    if (cart.services.length === 0) return;
    setSubmitting(true);
    const rows = cart.services.map((s) => ({
      user_id: user.id,
      category: s.slug,
      full_name: s.fullName,
      phone: s.phone,
      address: s.address,
      city: s.city ?? null,
      pincode: s.pincode ?? null,
      scheduled_date: s.scheduledDate,
      time_slot: s.timeSlot,
      problem: [
        s.problem,
        s.designStyle ? `Style: ${s.designStyle}` : null,
        s.roomImages && s.roomImages.length ? `Room photos:\n${s.roomImages.join("\n")}` : null,
      ].filter(Boolean).join("\n\n") || null,
      estimated_price: s.price,
      status: "pending",
    }));
    const { error } = await supabase.from("service_bookings").insert(rows);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    cart.clearServices();
    toast.success(`${rows.length} booking${rows.length > 1 ? "s" : ""} confirmed!`);
    navigate({ to: "/dashboard/bookings" });
  };

  if (isEmpty) {
    return (
      <PublicLayout>
        <section className="container mx-auto px-4 py-20 max-w-xl text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-5">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2">Browse home services or order raw materials to get started.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild variant="hero"><Link to="/services/home-services">Book a service</Link></Button>
            <Button asChild variant="outline"><Link to="/services/materials">Shop materials</Link></Button>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="container mx-auto px-4 py-10 max-w-6xl">
        <Link to="/services/home-services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2"><ShoppingCart className="h-7 w-7" /> Your cart</h1>
        <p className="text-sm text-muted-foreground mt-1">Review everything before confirming.</p>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 mt-8">
          <div className="space-y-8">
            {/* Services */}
            {cart.services.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-3">
                  <Wrench className="h-5 w-5 text-accent" /> Service bookings
                  <Badge variant="secondary">{cart.services.length}</Badge>
                </h2>
                <div className="space-y-3">
                  {cart.services.map((s) => (
                    <div key={s.id} className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{s.name}</h3>
                            <Badge variant="outline" className="capitalize text-[10px]">{s.slug.replace("-", " ")}</Badge>
                          </div>
                          <div className="mt-2 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarCheck className="h-3.5 w-3.5 text-accent" />
                              <span className="text-foreground">{s.scheduledDate}</span> · {s.timeSlot}
                            </div>
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                              <span className="text-foreground line-clamp-2">
                                {s.address}{s.city ? `, ${s.city}` : ""}{s.pincode ? ` - ${s.pincode}` : ""}
                              </span>
                            </div>
                          </div>
                          {s.problem && (
                            <p className="text-xs text-muted-foreground mt-2 italic">"{s.problem}"</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">For {s.fullName} · {s.phone}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold">
                            {s.price === 0 ? (s.priceLabel ?? "Free") : `${formatINR(s.price)}${s.priceLabel ?? ""}`}
                          </div>
                          <button
                            onClick={() => cart.removeService(s.id)}
                            className="mt-2 text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {cart.items.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-3">
                  <Package className="h-5 w-5 text-accent" /> Raw materials
                  <Badge variant="secondary">{cart.items.length}</Badge>
                </h2>
                <div className="space-y-3">
                  {cart.items.map((i) => (
                    <div key={i.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        {i.image_url && <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{i.name}</div>
                        <div className="text-xs text-muted-foreground">{formatINR(i.price)} / {i.unit}</div>
                        <div className="mt-2 inline-flex items-center gap-1 border border-border rounded-md">
                          <button onClick={() => cart.setQty(i.id, i.qty - 1)} className="h-7 w-7 inline-flex items-center justify-center hover:bg-muted"><Minus className="h-3 w-3" /></button>
                          <input
                            type="number"
                            min={1}
                            value={i.qty}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10);
                              if (!Number.isNaN(v)) cart.setQty(i.id, Math.max(1, v));
                            }}
                            className="w-12 h-7 text-sm font-medium text-center bg-transparent outline-none border-x border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            aria-label="Quantity"
                          />
                          <button onClick={() => cart.setQty(i.id, i.qty + 1)} className="h-7 w-7 inline-flex items-center justify-center hover:bg-muted"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold">{formatINR(i.price * i.qty)}</div>
                        <button
                          onClick={() => cart.remove(i.id)}
                          className="mt-2 text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Order summary</h3>
            <div className="text-sm space-y-2">
              {cart.services.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service fees ({cart.services.length})</span>
                  <span className="font-medium">{formatINR(svcTotal)}</span>
                </div>
              )}
              {cart.items.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Materials ({cart.items.reduce((s, i) => s + i.qty, 0)})</span>
                  <span className="font-medium">{formatINR(matTotal)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-border pt-4 flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Total due now</span>
              <span className="text-2xl font-bold">{formatINR(grandTotal)}</span>
            </div>

            {cart.services.length > 0 && (
              <div className="rounded-lg bg-accent/10 border border-accent/30 p-3 text-[11px] text-muted-foreground">
                Service fees cover the on-site inspection. Final cost is shared after the visit — accept or reject the quote.
              </div>
            )}

            <div className="space-y-2 pt-2">
              {cart.services.length > 0 && (
                <Button onClick={confirmServices} variant="hero" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</> : <>Confirm {cart.services.length} booking{cart.services.length > 1 ? "s" : ""}</>}
                </Button>
              )}
              {cart.items.length > 0 && (
                <Button asChild variant={cart.services.length > 0 ? "outline" : "hero"} size="lg" className="w-full">
                  <Link to="/checkout/materials">Checkout materials</Link>
                </Button>
              )}
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
