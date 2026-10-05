import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/vendors")({
  component: AdminVendors,
});

interface Vendor {
  id: string; business_name: string; contact_name: string | null;
  phone: string | null; city: string | null; status: string; created_at: string;
}

function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const load = () => {
    setLoading(true);
    supabase.from("vendors" as never).select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setVendors((data ?? []) as Vendor[]);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("vendors" as never).update({ status } as never).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Vendor ${status}`); setVendors((vs) => vs.map((v) => v.id === id ? { ...v, status } : v)); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete vendor? Their products will be unlinked.")) return;
    const { error } = await supabase.from("vendors" as never).delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  };

  const filtered = filter === "all" ? vendors : vendors.filter((v) => v.status === filter);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground text-sm">{vendors.length} total · {vendors.filter(v => v.status === "pending").length} pending review.</p>
        </div>
        <div className="flex gap-1">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "ghost"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead><TableHead>Contact</TableHead><TableHead>Phone</TableHead>
              <TableHead>City</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.business_name}</TableCell>
                <TableCell>{v.contact_name || "—"}</TableCell>
                <TableCell>{v.phone || "—"}</TableCell>
                <TableCell>{v.city || "—"}</TableCell>
                <TableCell>
                  <Badge variant={v.status === "approved" ? "default" : v.status === "rejected" ? "destructive" : "secondary"} className="capitalize">{v.status}</Badge>
                </TableCell>
                <TableCell>{formatDate(v.created_at)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {v.status !== "approved" && (
                    <Button variant="ghost" size="icon" className="text-green-600" onClick={() => setStatus(v.id, "approved")} title="Approve"><Check className="h-4 w-4" /></Button>
                  )}
                  {v.status !== "rejected" && (
                    <Button variant="ghost" size="icon" className="text-orange-600" onClick={() => setStatus(v.id, "rejected")} title="Reject"><X className="h-4 w-4" /></Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(v.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-12">No vendors.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
