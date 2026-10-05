import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, FormEvent, useEffect } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { Search, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  component: SearchPage,
  head: () => ({
    meta: [
      { title: "Search — Homico" },
      { name: "description", content: "Search services, materials, and more on Homico." },
    ],
  }),
});

type Item = { title: string; desc: string; to: string; tags: string[] };

const INDEX: Item[] = [
  { title: "Home Maintenance", desc: "Plumbing, electrical & repairs", to: "/services/home-services", tags: ["plumbing", "electrical", "repair", "handyman", "maintenance", "leak", "tap", "wiring"] },
  { title: "Skilled Workforce", desc: "Masons, painters, carpenters & helpers", to: "/services/workforce", tags: ["mason", "painter", "carpenter", "labor", "labour", "helper", "worker"] },
  { title: "Renovation & Interiors", desc: "Modular kitchens, interiors, design", to: "/services/renovation", tags: ["renovation", "interior", "kitchen", "modular", "design", "wardrobe"] },
  { title: "Raw Materials", desc: "Cement, steel, bricks, tiles, sand", to: "/services/materials", tags: ["cement", "steel", "bricks", "tiles", "sand", "material", "tmt"] },
  
  { title: "Architecture & Planning", desc: "Licensed architects & buildable plans", to: "/services/planning", tags: ["architect", "plan", "drawing", "blueprint", "elevation"] },
  { title: "Home Elevation Ideas", desc: "Browse modern front elevations", to: "/services/elevation-ideas", tags: ["elevation", "facade", "exterior"] },
  { title: "Cost Estimation", desc: "AI-assisted budget calculator", to: "/tools/estimator", tags: ["cost", "estimate", "budget", "calculator", "price"] },
  { title: "Full Construction", desc: "End-to-end turnkey builds", to: "/services/construction", tags: ["construction", "build", "turnkey", "contractor"] },
  { title: "Painting Services", desc: "Interior & exterior painting", to: "/services/renovation", tags: ["painting", "paint", "wall"] },
  { title: "Waterproofing", desc: "Roof, bathroom, terrace waterproofing", to: "/services/home-services", tags: ["waterproofing", "leak", "seepage"] },
];

function score(item: Item, q: string): number {
  if (!q) return 0;
  const ql = q.toLowerCase();
  let s = 0;
  if (item.title.toLowerCase().includes(ql)) s += 5;
  if (item.desc.toLowerCase().includes(ql)) s += 2;
  for (const t of item.tags) if (t.includes(ql)) s += 3;
  return s;
}

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [value, setValue] = useState(q);

  useEffect(() => setValue(q), [q]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    return INDEX.map((i) => ({ i, s: score(i, q.trim()) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.i);
  }, [q]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ search: { q: value.trim() } });
  };

  return (
    <PublicLayout>
      <section className="container mx-auto px-4 lg:px-8 py-10 md:py-14 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground mt-1">Find services, materials, and tools.</p>

        <form onSubmit={onSubmit} className="mt-6">
          <div className="flex items-stretch rounded-full border border-border bg-card shadow-sm focus-within:border-accent overflow-hidden">
            <div className="flex items-center gap-2 px-4 flex-1 min-w-0">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search plumbing, cement, painting…"
                className="flex-1 min-w-0 bg-transparent outline-none text-sm md:text-base placeholder:text-muted-foreground py-3"
              />
            </div>
            <button type="submit" className="px-5 my-1 mr-1 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:opacity-90">
              Search
            </button>
          </div>
        </form>

        <div className="mt-8">
          {!q.trim() ? (
            <div className="text-sm text-muted-foreground">Try “plumbing”, “cement”, “interior design”, or “windows”.</div>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm font-medium">No results for “{q}”</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different keyword or browse our services.</p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/services">Browse all services</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {results.map((r) => (
                <li key={r.title + r.to}>
                  <Link
                    to={r.to}
                    className="flex items-center justify-between gap-3 p-4 hover:bg-accent/5 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{r.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{r.desc}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
