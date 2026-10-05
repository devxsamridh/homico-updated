import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CalendarCheck, HardHat, ClipboardList, Wrench, FileText, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatINR } from "@/lib/format";
import { getServiceBySlug, STATUS_LABELS, QUOTATION_STATUS } from "@/lib/home-services";

export const Route = createFileRoute("/dashboard/bookings")({
  component: BookingsPage,
});

interface Consult { id: string; created_at: string; budget: string | null; location: string | null; style: string | null; }
interface Booking { id: string; created_at: string; style: string | null; budget_range: string | null; bedrooms: number | null; }
interface ServiceBooking {
  id: string; created_at: string; category: string; scheduled_date: string;
  time_slot: string; status: string; estimated_price: number; address: string;
}
interface Quotation {
  id: string; booking_id: string; labor_cost: number; material_cost: number;
  total: number; notes: string | null; status: string;
}

function BookingsPage() {
  const { user } = useAuth();
  const [consults, setConsults] = useState<Consult[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceBooking[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quotation>>({});
  const [loading, setLoading] = useState(true);
  const [decideLoading, setDecideLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("consultation_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("construction_bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("service_bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("service_quotations").select("*").eq("user_id", user.id),
    ]).then(([c, b, s, q]) => {
      setConsults((c.data ?? []) as Consult[]);
      setBookings((b.data ?? []) as Booking[]);
      setServices((s.data ?? []) as ServiceBooking[]);
      const map: Record<string, Quotation> = {};
      ((q.data ?? []) as Quotation[]).forEach((qu) => { map[qu.booking_id] = qu; });
      setQuotes(map);
      setLoading(false);
    });
  }, [user]);

  const decide = async (q: Quotation, decision: "accepted" | "rejected") => {
    setDecideLoading(q.id);
    const { error } = await supabase
      .from("service_quotations")
      .update({ status: decision, decided_at: new Date().toISOString() })
      .eq("id", q.id);
    if (!error && decision === "accepted") {
      await supabase.from("service_bookings").update({ status: "in_progress" }).eq("id", q.booking_id);
    }
    if (!error && decision === "rejected") {
      await supabase.from("service_bookings").update({ status: "cancelled" }).eq("id", q.booking_id);
    }
    setDecideLoading(null);
    if (error) { toast.error(error.message); return; }
    setQuotes((prev) => ({ ...prev, [q.booking_id]: { ...q, status: decision } }));
    setServices((prev) => prev.map((s) => s.id === q.booking_id ? { ...s, status: decision === "accepted" ? "in_progress" : "cancelled" } : s));
    toast.success(decision === "accepted" ? "Quote accepted — work will begin" : "Quote rejected");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const empty = consults.length === 0 && bookings.length === 0 && services.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Service Bookings</h1>
        <p className="text-muted-foreground text-sm">Plumbing, electrical, AC and other home service bookings.</p>
      </div>

      {empty ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <CalendarCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold">No bookings yet</p>
          <p className="text-sm text-muted-foreground mb-4">Book a service or start a project to get going.</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button asChild variant="outline"><Link to="/services/home-services">Home services</Link></Button>
            <Button asChild variant="outline"><Link to="/services/planning">Plan & design</Link></Button>
            <Button asChild variant="hero"><Link to="/services/construction">Build my home</Link></Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {services.length > 0 && (
            <section>
              <h2 className="font-semibold mb-3 flex items-center gap-2"><Wrench className="h-4 w-4 text-accent" /> Home services</h2>
              <div className="space-y-3">
                {services.map((s) => {
                  const cat = getServiceBySlug(s.category);
                  const status = STATUS_LABELS[s.status] ?? { label: s.status, tone: "secondary" as const };
                  const q = quotes[s.id];
                  return (
                    <div key={s.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex flex-wrap gap-3 justify-between">
                        <div>
                          <p className="font-semibold text-sm">{cat?.name ?? s.category}</p>
                          <p className="text-xs text-muted-foreground">{s.scheduled_date} · {s.time_slot}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{s.address}</p>
                          <p className="text-xs text-muted-foreground mt-1">Inspection fee: <span className="font-medium text-foreground">{formatINR(s.estimated_price)}</span></p>
                        </div>
                        <Badge variant={status.tone}>{status.label}</Badge>
                      </div>
                      {q && (
                        <div className="mt-4 rounded-lg border border-accent/40 bg-accent/5 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <FileText className="h-4 w-4 text-accent" /> Vendor quotation
                            </div>
                            <Badge variant={QUOTATION_STATUS[q.status]?.tone ?? "secondary"}>
                              {QUOTATION_STATUS[q.status]?.label ?? q.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div><div className="text-muted-foreground">Labor</div><div className="font-semibold">{formatINR(q.labor_cost)}</div></div>
                            <div><div className="text-muted-foreground">Materials</div><div className="font-semibold">{formatINR(q.material_cost)}</div></div>
                            <div><div className="text-muted-foreground">Total</div><div className="font-bold text-accent">{formatINR(q.total)}</div></div>
                          </div>
                          {q.notes && <p className="text-xs text-muted-foreground mt-3">{q.notes}</p>}
                          {q.status === "pending" && (
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="hero" className="flex-1" disabled={decideLoading === q.id} onClick={() => decide(q, "accepted")}>
                                <Check className="h-3.5 w-3.5" /> Accept & start work
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1" disabled={decideLoading === q.id} onClick={() => decide(q, "rejected")}>
                                <X className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {bookings.length > 0 && (
            <section>
              <h2 className="font-semibold mb-3 flex items-center gap-2"><HardHat className="h-4 w-4 text-accent" /> Construction requests</h2>
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="rounded-xl border border-border bg-card p-5 flex flex-wrap gap-3 justify-between">
                    <div>
                      <p className="font-semibold text-sm">{b.style || "Custom Home"} · {b.bedrooms ?? "—"} BHK</p>
                      <p className="text-xs text-muted-foreground">{formatDate(b.created_at)} · Budget: {b.budget_range || "—"}</p>
                    </div>
                    <Badge variant="secondary">In review</Badge>
                  </div>
                ))}
              </div>
            </section>
          )}
          {consults.length > 0 && (
            <section>
              <h2 className="font-semibold mb-3 flex items-center gap-2"><ClipboardList className="h-4 w-4 text-accent" /> Architect consultations</h2>
              <div className="space-y-3">
                {consults.map((c) => (
                  <div key={c.id} className="rounded-xl border border-border bg-card p-5 flex flex-wrap gap-3 justify-between">
                    <div>
                      <p className="font-semibold text-sm">{c.style || "Consultation"} · {c.location || "—"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(c.created_at)} · Budget: {c.budget || "—"}</p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
