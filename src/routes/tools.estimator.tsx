import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { estimate, type LocationTier, type Quality, TIER_LABELS, QUALITY_LABELS } from "@/lib/estimator";
import { formatINR, formatINRRange } from "@/lib/format";

export const Route = createFileRoute("/tools/estimator")({
  component: EstimatorPage,
  head: () => ({ meta: [{ title: "Cost Estimator — Homico" }] }),
});

function EstimatorPage() {
  const [plot, setPlot] = useState(2400);
  const [floors, setFloors] = useState(2);
  const [tier, setTier] = useState<LocationTier>("tier2");
  const [quality, setQuality] = useState<Quality>("standard");

  const result = useMemo(() => estimate({ plotSize: plot, floors, tier, quality }), [plot, floors, tier, quality]);

  return (
    <PublicLayout>
      <section className="bg-gradient-subtle border-b border-border">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold mb-4">
            <Calculator className="h-3.5 w-3.5" /> Free tool
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">Cost Estimator</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Get an instant cost range and material breakdown for your home.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-7 shadow-soft h-fit">
          <h2 className="font-bold text-lg mb-5">Your inputs</h2>
          <div className="space-y-5">
            <div><Label>Plot size: <span className="text-accent">{plot} sq ft</span></Label>
              <input type="range" min={600} max={12000} step={100} value={plot} onChange={(e) => setPlot(+e.target.value)} className="w-full mt-2 accent-[oklch(0.72_0.18_50)]" /></div>
            <div><Label>Floors: <span className="text-accent">{floors}</span></Label>
              <input type="range" min={1} max={4} value={floors} onChange={(e) => setFloors(+e.target.value)} className="w-full mt-2 accent-[oklch(0.72_0.18_50)]" /></div>
            <div><Label>Location</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as LocationTier)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIER_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select></div>
            <div><Label>Finish quality</Label>
              <Select value={quality} onValueChange={(v) => setQuality(v as Quality)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(QUALITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select></div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl bg-gradient-hero text-primary-foreground p-7 shadow-elegant">
            <p className="text-xs uppercase tracking-wide opacity-80">Estimated cost</p>
            <p className="text-4xl md:text-5xl font-bold mt-2">{formatINRRange(result.low, result.high)}</p>
            <p className="opacity-80 mt-1">Built-up area: {result.builtUpArea.toLocaleString("en-IN")} sq ft · Avg {formatINR(result.avg)}</p>
            <Button asChild variant="hero" size="lg" className="mt-5">
              <Link to="/services/construction">Get a quote <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7">
            <h3 className="font-bold mb-4">Material requirements</h3>
            <div className="divide-y divide-border">
              {[
                ["Cement", `${result.materials.cementBags.toLocaleString("en-IN")} bags`],
                ["Steel (TMT)", `${result.materials.steelKg.toLocaleString("en-IN")} kg`],
                ["Bricks", `${result.materials.bricks.toLocaleString("en-IN")} nos`],
                ["Sand", `${result.materials.sandCuft.toLocaleString("en-IN")} cuft`],
                ["Aggregate", `${result.materials.aggregateCuft.toLocaleString("en-IN")} cuft`],
              ].map(([name, val]) => (
                <div key={name} className="flex justify-between py-3 text-sm">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="font-semibold">{val}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Estimates based on industry rules of thumb. Actual quantities may vary by design.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
