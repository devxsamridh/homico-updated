import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, IndianRupee, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useVendor } from "@/lib/vendor-context";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/vendor/")({
  component: VendorOverview,
});

function VendorOverview() {
  const { user } = useAuth();
  const { vendor } = useVendor();
  const [stats, setStats] = useState<{ products: number; orders: number; revenue: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ count: products }, { data: orders }] = await Promise.all([
        supabase.from("materials").select("id", { count: "exact", head: true }).eq("vendor_id", user.id),
        supabase.from("material_orders").select("id, total, items"),
      ]);
      const revenue = (orders ?? []).reduce((s, o) => s + Number(o.total || 0), 0);
      setStats({ products: products ?? 0, orders: orders?.length ?? 0, revenue });
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {vendor?.business_name}</h1>
        <p className="text-muted-foreground text-sm">Your vendor overview.</p>
      </div>
      {!stats ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card label="Products" value={String(stats.products)} icon={Package} />
          <Card label="Orders" value={String(stats.orders)} icon={ShoppingBag} />
          <Card label="Revenue" value={formatINR(stats.revenue)} icon={IndianRupee} />
        </div>
      )}
    </div>
  );
}

function Card({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
