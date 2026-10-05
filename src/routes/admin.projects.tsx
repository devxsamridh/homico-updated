import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { STAGES, type ProjectStage } from "@/lib/project-stages";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/projects")({
  component: AdminProjects,
});

interface Project {
  id: string; user_id: string | null; name: string;
  current_stage: ProjectStage; progress_percent: number;
  notes: string | null; eta: string | null; created_at: string; updated_at: string;
}

function AdminProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [stage, setStage] = useState<ProjectStage>("submitted");
  const [progress, setProgress] = useState(5);
  const [note, setNote] = useState("");
  const [eta, setEta] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    supabase.from("construction_projects").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setItems((data ?? []) as Project[]);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const openEdit = (p: Project) => {
    setEditing(p);
    setStage(p.current_stage);
    setProgress(p.progress_percent);
    setNote("");
    setEta(p.eta ?? "");
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.from("construction_projects").update({
      current_stage: stage,
      progress_percent: progress,
      notes: note || editing.notes,
      eta: eta || null,
      updated_at: new Date().toISOString(),
    }).eq("id", editing.id);
    if (!error && note) {
      await supabase.from("construction_project_updates").insert({
        project_id: editing.id, stage, note,
      });
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Project updated");
    setOpen(false);
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground text-sm">Update construction project stages.</p>
      </div>
      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-5 flex flex-wrap gap-4 justify-between items-center">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">Stage: <span className="capitalize text-accent font-medium">{p.current_stage}</span> · {p.progress_percent}% · Updated {formatDate(p.updated_at)}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => openEdit(p)}>Update</Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No projects yet.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update {editing?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Stage</Label>
              <Select value={stage} onValueChange={(v) => {
                const s = v as ProjectStage; setStage(s);
                const def = STAGES.find((x) => x.key === s)?.defaultProgress ?? progress;
                setProgress(def);
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Progress: {progress}%</Label><input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(+e.target.value)} className="w-full mt-2 accent-[oklch(0.72_0.18_50)]" /></div>
            <div><Label>ETA</Label><Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} /></div>
            <div><Label>Note (optional)</Label><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Update message visible to the client" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
