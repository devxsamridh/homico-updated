import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireAuth } from "@/components/RequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useBlockStaff } from "@/lib/use-block-staff";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/checkout/materials")({
  component: () => <RequireAuth><CheckoutPage /></RequireAuth>,
  head: () => ({ meta: [{ title: "Checkout — Homico" }] }),
});

function CheckoutPage() {
  const { user } = useAuth();
  const blocked = useBlockStaff();
  const cart = useCart();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setFullName(data.full_name ?? ""); setPhone(data.phone ?? ""); }
    });
  }, [user]);

  const total = cart.total();

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.items.length === 0) return;
    if (!fullName || !phone || !address) { toast.error("Please fill required fields"); return; }
    setSubmitting(true);

    const items = cart.items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, unit: i.unit }));
    const { data: order, error } = await supabase.from("material_orders").insert({
      user_id: user.id, full_name: fullName, phone, delivery_address: address,
      city, pincode, notes, items, total, status: "pending", payment_status: "unpaid",
    }).select().single();

    if (error || !order) { setSubmitting(false); toast.error(error?.message || "Failed"); return; }

    // Simulate payment
    const success = Math.random() > 0.15;
    const { data: payment } = await supabase.from("payments").insert({
      user_id: user.id, kind: "material_order", reference_id: order.id,
      amount: total, status: success ? "succeeded" : "failed",
    }).select().single();

    await supabase.from("material_orders").update({
      payment_id: payment?.id,
      payment_status: success ? "paid" : "failed",
      status: success ? "confirmed" : "pending",
    }).eq("id", order.id);

    setSubmitting(false);
    if (success) {
      cart.clear();
      cart.clearServices();
      toast.success("Payment successful");
      navigate({ to: "/checkout/success", search: { ref: order.id } });
    } else {
      toast.error("Payment failed");
      navigate({ to: "/checkout/failed", search: { ref: order.id } });
    }
  };

  if (blocked) return null;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar />
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold mb-2">Your cart is empty</p>
            <Button asChild variant="hero"><Link to="/services/materials">Browse materials</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <Link to="/services/materials" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"><ArrowLeft className="h-3.5 w-3.5" /> Continue shopping</Link>
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <form onSubmit={placeOrder} className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Delivery details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Full name *</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
              <div><Label>Phone *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
            </div>
            <div><Label>Address *</Label><Textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={2} /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
              <div><Label>Pincode</Label><Input value={pincode} onChange={(e) => setPincode(e.target.value)} /></div>
            </div>
            <div><Label>Delivery notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>

            <div className="rounded-lg bg-muted/50 p-3 flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <span>This is a mock payment flow for demo purposes. No real charge will be made.</span>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Pay {formatINR(total)}
            </Button>
          </form>

          <aside className="rounded-2xl border border-border bg-card p-6 h-fit lg:sticky lg:top-20">
            <h2 className="font-semibold mb-4">Order summary</h2>
            <div className="space-y-3 mb-4">
              {cart.items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="min-w-0 truncate pr-2">{i.name} <span className="text-muted-foreground">× {i.qty}</span></span>
                  <span className="font-medium">{formatINR(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(total)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-success">Free</span></div>
              <div className="flex justify-between font-bold text-base pt-2"><span>Total</span><span>{formatINR(total)}</span></div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
