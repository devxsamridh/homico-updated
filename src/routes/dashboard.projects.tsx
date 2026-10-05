import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, HardHat, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { STAGES, type ProjectStage } from "@/lib/project-stages";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/projects")({
  component: ProjectsPage,
});

interface Project {
  id: string;
  name: string;
  current_stage: ProjectStage;
  progress_percent: number;
  notes: string | null;
  eta: string | null;
  started_at: string | null;
  created_at: string;
  updated_at: string;
}

function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("construction_projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setProjects((data ?? []) as Project[]);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground text-sm">Track the status of your construction project.</p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <HardHat className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold">No active projects</p>
          <p className="text-sm text-muted-foreground mb-4">Once you book a construction service, your project appears here.</p>
          <Button asChild variant="hero"><Link to="/services/construction">Start a project</Link></Button>
        </div>
      ) : (
        <div className="space-y-5">
          {projects.map((p) => {
            const currentIdx = STAGES.findIndex((s) => s.key === p.current_stage);
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">Started {formatDate(p.started_at ?? p.created_at)} · Updated {formatDate(p.updated_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">{p.progress_percent}%</p>
                    <p className="text-xs text-muted-foreground">ETA {formatDate(p.eta)}</p>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-6">
                  <div className="h-full bg-gradient-accent transition-all" style={{ width: `${p.progress_percent}%` }} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {STAGES.map((s, i) => {
                    const done = i < currentIdx;
                    const active = i === currentIdx;
                    return (
                      <div key={s.key} className={cn("text-center p-3 rounded-lg border transition-base", active ? "border-accent bg-accent/5" : done ? "border-success/40 bg-success/5" : "border-border")}>
                        {done ? <CheckCircle2 className="h-5 w-5 mx-auto text-success" /> : <Circle className={cn("h-5 w-5 mx-auto", active ? "text-accent" : "text-muted-foreground")} />}
                        <p className={cn("text-xs font-medium mt-1.5", active && "text-accent")}>{s.label}</p>
                      </div>
                    );
                  })}
                </div>

                {p.notes && <p className="text-sm text-muted-foreground mt-4 p-3 rounded-lg bg-muted/50">{p.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
