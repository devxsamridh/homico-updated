import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, DoorOpen, Trash2, Send, Ruler } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getDesignBySlug } from "@/lib/doors-windows";
import { formatINRRange } from "@/lib/format";

export const Route = createFileRoute("/dashboard/designs")({
  component: SavedDesignsPage,
  head: () => ({ meta: [{ title: "My Saved Designs — Homico" }] }),
});

interface Row {
  id: string;
  kind: string;
  category: string;
  design_slug: string;
  design_name: string;
  material: string;
  height_in: number;
  width_in: number;
  quantity: number;
  estimated_low: number;
  estimated_high: number;
  status: string;
  created_at: string;
}

function SavedDesignsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("doors_windows_quotes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setRows([]);
      return;
    }
    setRows((data ?? []) as Row[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const remove = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.from("doors_windows_quotes").delete().eq("id", id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    setRows((r) => (r ? r.filter((x) => x.id !== id) : r));
  };

  const requestQuote = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase
      .from("doors_windows_quotes")
      .update({ kind: "quote", status: "pending" })
      .eq("id", id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Quotation requested");
    load();
  };

  if (rows === null) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Saved Designs</h1>
        <p className="text-muted-foreground text-sm">
          Door & window designs you've saved or requested quotes for.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-3">
            <DoorOpen className="h-6 w-6" />
          </div>
          <h3 className="font-semibold">No saved designs yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Browse the catalog and save your favourite designs.</p>
          <Button asChild variant="hero" className="mt-4">
            <Link to="/services">Browse services</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => {
            const design = getDesignBySlug(r.design_slug);
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-card overflow-hidden flex">
                <div className="w-32 shrink-0 bg-muted">
                  {design?.cover ? (
                    <img src={design.cover} alt={r.design_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <DoorOpen className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{r.design_name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {r.category} · {r.material}
                      </p>
                    </div>
                    <Badge variant={r.kind === "quote" ? "default" : "secondary"} className="capitalize shrink-0">
                      {r.kind === "quote" ? r.status : "Saved"}
                    </Badge>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ruler className="h-3.5 w-3.5" />
                    {r.height_in}″ × {r.width_in}″ · Qty {r.quantity}
                  </div>

                  <div className="mt-2 text-sm font-semibold text-accent">
                    {formatINRRange(Number(r.estimated_low), Number(r.estimated_high))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    {r.kind === "saved" && (
                      <Button
                        size="sm"
                        variant="hero"
                        onClick={() => requestQuote(r.id)}
                        disabled={busyId === r.id}
                      >
                        <Send className="h-3.5 w-3.5" /> Request quote
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(r.id)}
                      disabled={busyId === r.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
