import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Package, ShoppingBag, Wrench, CalendarCheck, MapPin, Truck, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-store";
import { formatDate, formatINR } from "@/lib/format";
import { getServiceBySlug, STATUS_LABELS } from "@/lib/home-services";

export const Route = createFileRoute("/dashboard/orders")({
  component: OrdersPage,
});

interface Order {
  id: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: { id?: string; name: string; qty: number; unit?: string; price?: number; image_url?: string | null }[];
}

const DELIVERY_STAGES = ["pending", "confirmed", "shipped", "delivered"];

function statusColor(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "delivered" || s === "paid" || s === "completed") return "default";
  if (s === "failed" || s === "cancelled") return "destructive";
  return "secondary";
}

function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const addToCart = useCart((s) => s.add);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("material_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as unknown as Order[]);
        setLoading(false);
      });
  }, [user]);

  const reorder = (o: Order) => {
    let added = 0;
    o.items.forEach((it) => {
      if (it.id && it.price != null) {
        addToCart({ id: it.id, name: it.name, unit: it.unit ?? "unit", price: it.price, image_url: it.image_url ?? null }, it.qty);
        added++;
      }
    });
    if (added === 0) {
      toast.info("Items unavailable — opening materials store");
      navigate({ to: "/services/materials" });
    } else {
      toast.success(`Added ${added} item${added > 1 ? "s" : ""} to cart`);
      navigate({ to: "/cart" });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Material Orders</h1>
        <p className="text-muted-foreground text-sm">Cement, steel, fittings and other materials you've ordered.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold">No material orders yet</p>
          <p className="text-sm text-muted-foreground mb-4">Browse cement, steel, tiles and more.</p>
          <Button asChild variant="hero"><Link to="/services/materials">Shop materials</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const stageIdx = Math.max(0, DELIVERY_STAGES.indexOf(o.status));
            const isTracking = tracking === o.id;
            return (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0"><Package className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">Order #{o.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.created_at)} · {o.items?.length ?? 0} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatINR(o.total)}</p>
                    <div className="flex gap-1.5 mt-1 justify-end">
                      <Badge variant={statusColor(o.payment_status)} className="text-[10px] capitalize">{o.payment_status}</Badge>
                      <Badge variant={statusColor(o.status)} className="text-[10px] capitalize">{o.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 divide-y divide-border">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <div className="h-9 w-9 rounded-md bg-background border border-border overflow-hidden shrink-0">
                        {it.image_url ? <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{it.name}</p>
                        <p className="text-xs text-muted-foreground">Qty {it.qty}{it.unit ? ` ${it.unit}` : ""}{it.price != null ? ` · ${formatINR(it.price)}` : ""}</p>
                      </div>
                      {it.price != null && <p className="text-sm font-semibold">{formatINR(it.price * it.qty)}</p>}
                    </div>
                  ))}
                </div>

                {isTracking && (
                  <div className="mt-4 rounded-lg border border-border bg-background p-4">
                    <p className="text-xs font-semibold mb-3 flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-accent" /> Delivery progress</p>
                    <div className="grid grid-cols-4 gap-2">
                      {DELIVERY_STAGES.map((s, i) => {
                        const done = i <= stageIdx && o.status !== "cancelled";
                        return (
                          <div key={s} className="text-center">
                            <div className={`h-1.5 rounded-full mb-1.5 ${done ? "bg-accent" : "bg-muted"}`} />
                            <p className={`text-[10px] capitalize ${done ? "text-accent font-medium" : "text-muted-foreground"}`}>{s}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => setTracking(isTracking ? null : o.id)}>
                    <Truck className="h-3.5 w-3.5" /> {isTracking ? "Hide tracking" : "Track Order"}
                  </Button>
                  <Button size="sm" variant="hero" onClick={() => reorder(o)}>
                    <RotateCcw className="h-3.5 w-3.5" /> Reorder
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

