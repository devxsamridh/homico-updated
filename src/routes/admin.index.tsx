import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Users, Package, ShoppingBag, CalendarCheck, HardHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState<{ users: number; materials: number; orders: number; bookings: number; projects: number; revenue: number } | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("materials").select("id", { count: "exact", head: true }),
      supabase.from("material_orders").select("id, total", { count: "exact" }),
      supabase.from("construction_bookings").select("id", { count: "exact", head: true }),
      supabase.from("construction_projects").select("id", { count: "exact", head: true }),
    ]).then(([u, m, o, b, p]) => {
      const revenue = (o.data ?? []).reduce((s, r) => s + Number(r.total || 0), 0);
      setStats({
        users: u.count ?? 0,
        materials: m.count ?? 0,
        orders: o.count ?? 0,
        bookings: b.count ?? 0,
        projects: p.count ?? 0,
        revenue,
      });
    });
  }, []);

  if (!stats) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const cards = [
    { label: "Users", value: stats.users, icon: Users },
    { label: "Materials", value: stats.materials, icon: Package },
    { label: "Orders", value: stats.orders, icon: ShoppingBag },
    { label: "Bookings", value: stats.bookings, icon: CalendarCheck },
    { label: "Projects", value: stats.projects, icon: HardHat },
    { label: "Revenue", value: formatINR(stats.revenue), icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm">Platform summary and key metrics.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <p className="text-3xl font-bold mt-2">{c.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
