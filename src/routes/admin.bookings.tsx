import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatINR } from "@/lib/format";
import { getServiceBySlug, STATUS_LABELS, QUOTATION_STATUS } from "@/lib/home-services";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
});

const STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

function AdminBookings() {
  const [consults, setConsults] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [quoteFor, setQuoteFor] = useState<any | null>(null);
  const [labor, setLabor] = useState("");
  const [material, setMaterial] = useState("");
  const [notes, setNotes] = useState("");
  const [savingQuote, setSavingQuote] = useState(false);

  const load = () => {
    return Promise.all([
      supabase.from("consultation_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("construction_bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("service_bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("service_quotations").select("*"),
    ]).then(([c, b, s, q]) => {
      setConsults(c.data ?? []);
      setBookings(b.data ?? []);
      setServices(s.data ?? []);
      const map: Record<string, any> = {};
      (q.data ?? []).forEach((qu: any) => { map[qu.booking_id] = qu; });
      setQuotes(map);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("service_bookings").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    toast.success("Status updated");
  };

  const openQuote = (s: any) => {
    const existing = quotes[s.id];
    setQuoteFor(s);
    setLabor(existing ? String(existing.labor_cost) : "");
    setMaterial(existing ? String(existing.material_cost) : "");
    setNotes(existing?.notes ?? "");
  };

  const saveQuote = async () => {
    if (!quoteFor) return;
    const lc = Number(labor) || 0;
    const mc = Number(material) || 0;
    if (lc <= 0 && mc <= 0) { toast.error("Enter labor or material cost"); return; }
    setSavingQuote(true);
    const existing = quotes[quoteFor.id];
    const payload = {
      booking_id: quoteFor.id,
      user_id: quoteFor.user_id,
      labor_cost: lc,
      material_cost: mc,
      total: lc + mc,
      notes: notes.trim() || null,
      status: "pending",
    };
    const { data, error } = existing
      ? await supabase.from("service_quotations").update(payload).eq("id", existing.id).select().single()
      : await supabase.from("service_quotations").insert(payload).select().single();
    setSavingQuote(false);
    if (error) { toast.error(error.message); return; }
    setQuotes((prev) => ({ ...prev, [quoteFor.id]: data }));
    toast.success("Quotation sent to customer");
    setQuoteFor(null);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground text-sm">All home services, consultations and construction requests.</p>
      </div>
      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Home services ({services.length})</TabsTrigger>
          <TabsTrigger value="construction">Construction ({bookings.length})</TabsTrigger>
          <TabsTrigger value="consult">Consultations ({consults.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-4">
          <div className="rounded-2xl border border-border bg-card overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Customer</TableHead><TableHead>Category</TableHead><TableHead>Date / Slot</TableHead>
                <TableHead>Address</TableHead><TableHead>Inspection</TableHead><TableHead>Quotation</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {services.map((s) => {
                  const cat = getServiceBySlug(s.category);
                  const status = STATUS_LABELS[s.status] ?? { label: s.status, tone: "secondary" as const };
                  const q = quotes[s.id];
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-medium">{s.full_name}</div>
                        <div className="text-xs text-muted-foreground">{s.phone}</div>
                      </TableCell>
                      <TableCell>{cat?.name ?? s.category}</TableCell>
                      <TableCell>
                        <div>{s.scheduled_date}</div>
                        <div className="text-xs text-muted-foreground">{s.time_slot}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="text-xs line-clamp-2">{s.address}</div>
                        <div className="text-xs text-muted-foreground">{s.city || ""} {s.pincode || ""}</div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatINR(s.estimated_price)}</TableCell>
                      <TableCell>
                        {q ? (
                          <div className="space-y-1">
                            <div className="text-sm font-bold">{formatINR(q.total)}</div>
                            <Badge variant={QUOTATION_STATUS[q.status]?.tone ?? "secondary"} className="text-[10px]">
                              {QUOTATION_STATUS[q.status]?.label ?? q.status}
                            </Badge>
                            <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => openQuote(s)}>Edit</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => openQuote(s)}>
                            <FileText className="h-3 w-3" /> Send quote
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <Badge variant={status.tone} className="w-fit">{status.label}</Badge>
                          <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v)}>
                            <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((st) => <SelectItem key={st} value={st}>{STATUS_LABELS[st]?.label ?? st}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {services.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No service bookings yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="construction" className="mt-4">
          <div className="rounded-2xl border border-border bg-card overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Style</TableHead><TableHead>Budget</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.email}</TableCell>
                    <TableCell>{b.phone || "—"}</TableCell>
                    <TableCell>{b.style || "—"}</TableCell>
                    <TableCell>{b.budget_range || "—"}</TableCell>
                    <TableCell>{formatDate(b.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="consult" className="mt-4">
          <div className="rounded-2xl border border-border bg-card overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Location</TableHead><TableHead>Budget</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {consults.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.location || "—"}</TableCell>
                    <TableCell>{c.budget || "—"}</TableCell>
                    <TableCell>{formatDate(c.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!quoteFor} onOpenChange={(o) => !o && setQuoteFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">After on-site inspection, enter the breakdown for the customer to accept or reject.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="labor">Labor cost (₹)</Label>
                <Input id="labor" type="number" min="0" value={labor} onChange={(e) => setLabor(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="material">Material cost (₹)</Label>
                <Input id="material" type="number" min="0" value={material} onChange={(e) => setMaterial(e.target.value)} />
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{formatINR((Number(labor) || 0) + (Number(material) || 0))}</span>
            </div>
            <div>
              <Label htmlFor="qnotes">Notes for customer (optional)</Label>
              <Textarea id="qnotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteFor(null)}>Cancel</Button>
            <Button variant="hero" onClick={saveQuote} disabled={savingQuote}>
              {savingQuote ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Send to customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
