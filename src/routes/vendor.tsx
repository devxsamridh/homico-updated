import { createFileRoute, Outlet, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Store, Package, ShoppingBag, Home, LogOut, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { RequireAuth } from "@/components/RequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { useVendor } from "@/lib/vendor-context";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vendor")({
  component: () => (
    <RequireAuth>
      <VendorShell />
    </RequireAuth>
  ),
  head: () => ({ meta: [{ title: "Vendor — Homico" }] }),
});

const links = [
  { to: "/vendor", label: "Overview", icon: Store, exact: true },
  { to: "/vendor/materials", label: "My Products", icon: Package },
  { to: "/vendor/orders", label: "Orders", icon: ShoppingBag },
];

function VendorShell() {
  const { vendor, loading, refresh } = useVendor();
  const { signOut } = useAuth();
  const router = useRouter();
  const path = router.state.location.pathname;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!vendor) return <VendorSignupForm onDone={refresh} />;
  if (vendor.status === "pending") return <PendingScreen />;
  if (vendor.status === "rejected") return <RejectedScreen note={vendor.notes} />;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1 grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="lg:sticky lg:top-20 h-fit rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <Store className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-wide truncate">{vendor.business_name}</span>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto">
            {links.map((l) => {
              const Icon = l.icon;
              const active = l.exact ? path === l.to : path.startsWith(l.to);
              return (
                <Link key={l.to} to={l.to} className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-base",
                  active ? "bg-accent/10 text-accent" : "text-foreground/70 hover:bg-muted",
                )}>
                  <Icon className="h-4 w-4" /> {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border my-3" />
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link to="/"><Home className="h-4 w-4" /> Back to site</Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </aside>
        <main className="min-w-0"><Outlet /></main>
      </div>
    </div>
  );
}

const schema = z.object({
  business_name: z.string().trim().min(2).max(120),
  contact_name: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(80).optional(),
  pincode: z.string().trim().max(10).optional(),
});

function VendorSignupForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ business_name: "", contact_name: "", phone: "", address: "", city: "", pincode: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) { toast.error(r.error.errors[0].message); return; }
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("vendors" as never).insert({ id: user.id, ...form, status: "pending" } as never);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Application submitted!");
    onDone();
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-7 shadow-elegant">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground"><Store className="h-6 w-6" /></span>
            <div>
              <h1 className="text-2xl font-bold">Become a vendor</h1>
              <p className="text-sm text-muted-foreground">Sell raw materials on Homico. Admin approval required.</p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Business name *</Label><Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contact name</Label><Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div><Label>Address</Label><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>Pincode</Label><Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></div>
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Submit application
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PendingScreen() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="rounded-2xl border border-border bg-card p-10 shadow-elegant">
          <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Application under review</h1>
          <p className="text-muted-foreground mt-2 text-sm">Our team is reviewing your vendor application. You'll get access to your dashboard once approved.</p>
          <Button asChild variant="outline" className="mt-6"><Link to="/">Back to home</Link></Button>
        </div>
      </div>
    </div>
  );
}

function RejectedScreen({ note }: { note: string | null }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="rounded-2xl border border-destructive/40 bg-card p-10 shadow-elegant">
          <ShieldAlert className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Application rejected</h1>
          {note && <p className="text-muted-foreground mt-2 text-sm">{note}</p>}
          <Button asChild variant="outline" className="mt-6"><Link to="/">Back to home</Link></Button>
        </div>
      </div>
    </div>
  );
}
