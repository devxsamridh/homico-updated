import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  Ruler,
  Home,
  Palette,
  Loader2,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Download,
  FileImage,
  FileText,
  RefreshCw,
  Pencil,
  MessageSquare,
  Sun,
  Wind,
  Building2,
  DoorOpen,
  Calendar,
  IndianRupee,
  Package,
} from "lucide-react";
import jsPDF from "jspdf";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateHomePlan, type PlannerInputType, type PlannerResult } from "@/lib/ai-planner.functions";
import { FloorPlanCanvas, FLOOR_PLAN_ROOM_COLORS } from "@/components/planner/FloorPlanCanvas";

export const Route = createFileRoute("/tools/ai-home-planner")({
  component: AiHomePlannerPage,
  head: () => ({
    meta: [
      { title: "AI Home Planner — Design your dream home in minutes | Homico" },
      {
        name: "description",
        content:
          "Generate a personalized house plan, cost estimate, materials list and elevation ideas with Homico's AI Home Planner.",
      },
      { property: "og:title", content: "AI Home Planner — Homico" },
      {
        property: "og:description",
        content: "Plan your dream home in minutes with AI-generated layouts, cost & materials.",
      },
    ],
  }),
});

const STEPS = [
  { key: "plot", title: "Property", icon: Ruler },
  { key: "rooms", title: "Rooms", icon: Home },
  { key: "prefs", title: "Preferences", icon: Palette },
  { key: "result", title: "Your Plan", icon: Sparkles },
] as const;

type FormState = Omit<PlannerInputType, never>;

const initialForm: FormState = {
  plotLength: 40,
  plotWidth: 30,
  facing: "East",
  plotType: "Regular",
  floors: 2,
  bedrooms: 3,
  bathrooms: 3,
  livingRooms: 1,
  kitchen: 1,
  diningRoom: 1,
  balcony: 2,
  parking: 1,
  poojaRoom: 1,
  homeOffice: 0,
  storeRoom: 1,
  utilityRoom: 1,
  garden: true,
  style: "Modern",
  budget: "Standard",
  familySize: 4,
  priority: "Natural Lighting",
};

function AiHomePlannerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const planRef = useRef<HTMLDivElement>(null);

  const plotSize = useMemo(() => form.plotLength * form.plotWidth, [form.plotLength, form.plotWidth]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const generate = async () => {
    setLoading(true);
    setStep(3);
    try {
      const res = await generateHomePlan({ data: form });
      setResult(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const svgToPng = async (svg: SVGSVGElement, scale = 2): Promise<string> => {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    // Ensure the viewBox is set and no inline transforms remain
    clone.style.transform = "";
    const bbox = svg.viewBox.baseVal;
    const w = bbox.width || svg.clientWidth;
    const h = bbox.height || svg.clientHeight;
    clone.setAttribute("width", String(w));
    clone.setAttribute("height", String(h));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const xml = new XMLSerializer().serializeToString(clone);
    const svg64 = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = svg64;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * scale * 10));
    canvas.height = Math.max(1, Math.round(h * scale * 10));
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FAFAF7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  const downloadImage = async () => {
    if (!planRef.current) return;
    try {
      const svgs = planRef.current.querySelectorAll("svg");
      if (svgs.length === 0) throw new Error("No plan to export");
      for (let i = 0; i < svgs.length; i++) {
        const png = await svgToPng(svgs[i] as SVGSVGElement, 2);
        const a = document.createElement("a");
        a.href = png;
        a.download = `floor-plan-${i + 1}-${Date.now()}.png`;
        a.click();
      }
      toast.success("Image downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  };

  const downloadPdf = async () => {
    if (!planRef.current || !result) return;
    try {
      const svgs = planRef.current.querySelectorAll("svg");
      if (svgs.length === 0) throw new Error("No plan to export");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      for (let i = 0; i < svgs.length; i++) {
        if (i > 0) pdf.addPage();
        const png = await svgToPng(svgs[i] as SVGSVGElement, 2);
        pdf.setFontSize(16);
        pdf.text(`${result.floorPlan[i]?.floor ?? `Floor ${i + 1}`} — ${result.builtUpArea}`, 40, 40);
        // fit image
        const img = new Image();
        img.src = png;
        await new Promise((r) => (img.onload = r));
        const maxW = pageW - 80;
        const maxH = pageH - 100;
        const ratio = Math.min(maxW / img.width, maxH / img.height);
        pdf.addImage(png, "PNG", 40, 60, img.width * ratio, img.height * ratio);
      }
      pdf.save(`home-plan-${Date.now()}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF export failed");
    }
  };

  const modifyPlan = () => setStep(0);
  const consultArchitect = () => navigate({ to: "/services/planning" });


  return (
    <PublicLayout>
      <section className="border-b border-border bg-gradient-subtle">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5" /> AI Home Planner
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Design your dream home in minutes.
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Tell us about your plot and needs. Our AI drafts a floor plan, cost and materials
              list — instantly.
            </p>
          </div>

          {/* Progress */}
          <div className="mt-8 md:mt-10">
            <div className="flex items-center justify-between max-w-2xl">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                const Icon = s.icon;
                return (
                  <div key={s.key} className="flex-1 flex items-center last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-base ${
                          done
                            ? "bg-accent border-accent text-accent-foreground"
                            : active
                              ? "border-accent text-accent bg-background"
                              : "border-border text-muted-foreground bg-background"
                        }`}
                      >
                        {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span
                        className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {s.title}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 transition-base ${done ? "bg-accent" : "bg-border"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepCard key="plot" title="Tell us about your plot" icon={Ruler}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <NumberField
                    label="Plot Length (ft)"
                    value={form.plotLength}
                    onChange={(v) => update("plotLength", v)}
                  />
                  <NumberField
                    label="Plot Width (ft)"
                    value={form.plotWidth}
                    onChange={(v) => update("plotWidth", v)}
                  />
                </div>
                <div className="rounded-xl bg-accent/10 text-accent px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Plot Size</span>
                  <span className="font-bold">{plotSize.toLocaleString("en-IN")} sq ft</span>
                </div>

                <div>
                  <Label className="mb-2 block">Plot Facing</Label>
                  <ChoiceGrid
                    cols={4}
                    options={["North", "South", "East", "West"] as const}
                    value={form.facing}
                    onChange={(v) => update("facing", v)}
                    icon={Compass}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Plot Type</Label>
                  <ChoiceGrid
                    cols={3}
                    options={["Corner", "Regular", "Irregular"] as const}
                    value={form.plotType}
                    onChange={(v) => update("plotType", v)}
                  />
                </div>
              </StepCard>
            )}

            {step === 1 && (
              <StepCard key="rooms" title="What rooms do you need?" icon={Home}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Counter label="Floors" value={form.floors} onChange={(v) => update("floors", v)} min={1} max={5} />
                  <Counter label="Bedrooms" value={form.bedrooms} onChange={(v) => update("bedrooms", v)} />
                  <Counter label="Bathrooms" value={form.bathrooms} onChange={(v) => update("bathrooms", v)} />
                  <Counter label="Living" value={form.livingRooms} onChange={(v) => update("livingRooms", v)} max={5} />
                  <Counter label="Kitchen" value={form.kitchen} onChange={(v) => update("kitchen", v)} max={3} />
                  <Counter label="Dining" value={form.diningRoom} onChange={(v) => update("diningRoom", v)} max={3} />
                  <Counter label="Balcony" value={form.balcony} onChange={(v) => update("balcony", v)} max={6} />
                  <Counter label="Parking" value={form.parking} onChange={(v) => update("parking", v)} max={6} />
                  <Counter label="Pooja" value={form.poojaRoom} onChange={(v) => update("poojaRoom", v)} max={2} />
                  <Counter label="Office" value={form.homeOffice} onChange={(v) => update("homeOffice", v)} max={3} />
                  <Counter label="Store" value={form.storeRoom} onChange={(v) => update("storeRoom", v)} max={3} />
                  <Counter label="Utility" value={form.utilityRoom} onChange={(v) => update("utilityRoom", v)} max={3} />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium">Garden required?</p>
                    <p className="text-sm text-muted-foreground">Adds landscaped outdoor space</p>
                  </div>
                  <div className="flex gap-2">
                    {[true, false].map((v) => (
                      <button
                        key={String(v)}
                        onClick={() => update("garden", v)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-base ${
                          form.garden === v
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        {v ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
              </StepCard>
            )}

            {step === 2 && (
              <StepCard key="prefs" title="Your preferences" icon={Palette}>
                <div>
                  <Label className="mb-2 block">Preferred Style</Label>
                  <ChoiceGrid
                    cols={3}
                    options={["Modern", "Contemporary", "Traditional", "Luxury", "Minimal"] as const}
                    value={form.style}
                    onChange={(v) => update("style", v)}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Budget</Label>
                  <ChoiceGrid
                    cols={4}
                    options={["Economy", "Standard", "Premium", "Luxury"] as const}
                    value={form.budget}
                    onChange={(v) => update("budget", v)}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <NumberField
                    label="Family Size"
                    value={form.familySize}
                    onChange={(v) => update("familySize", v)}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Construction Priority</Label>
                  <ChoiceGrid
                    cols={2}
                    options={[
                      "Maximum Space",
                      "Better Ventilation",
                      "Natural Lighting",
                      "Vastu Friendly",
                      "Modern Design",
                    ] as const}
                    value={form.priority}
                    onChange={(v) => update("priority", v)}
                  />
                </div>
              </StepCard>
            )}

            {step === 3 && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {loading || !result ? (
                  <div className="rounded-2xl border border-border bg-card p-10 md:p-16 text-center shadow-soft">
                    <div className="inline-flex h-16 w-16 rounded-full bg-accent/10 items-center justify-center mb-6">
                      <Loader2 className="h-8 w-8 text-accent animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold">AI is designing your home…</h2>
                    <p className="text-muted-foreground mt-2">
                      Analyzing plot, arranging rooms and estimating materials.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                      {["Layout", "Ventilation", "Vastu", "Materials", "Cost", "Timeline"].map((t) => (
                        <span key={t} className="px-3 py-1 rounded-full bg-muted">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div ref={planRef}>
                    <ResultView
                      result={result}
                      onDownloadPdf={downloadPdf}
                      onDownloadImage={downloadImage}
                      onModify={modifyPlan}
                      onRegenerate={generate}
                      onConsult={consultArchitect}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {step < 3 && (
            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" onClick={back} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              {step < 2 ? (
                <Button variant="hero" onClick={next}>
                  Continue <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button variant="hero" onClick={generate}>
                  <Sparkles className="h-4 w-4 mr-1" /> Generate Plan
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

/* ---------- Building blocks ---------- */

function StepCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Input
        type="number"
        value={value}
        min={1}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 0))}
      />
    </div>
  );
}

function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
  cols = 3,
  icon: Icon,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  cols?: 2 | 3 | 4;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const colClass = cols === 4 ? "grid-cols-2 sm:grid-cols-4" : cols === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2";
  return (
    <div className={`grid ${colClass} gap-2`}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-3 rounded-xl border text-sm font-medium transition-base flex items-center justify-center gap-1.5 ${
              active
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-background hover:border-accent/40 hover:bg-muted/50"
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="rounded-xl border border-border p-3 flex flex-col gap-2 bg-background">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center justify-between">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-8 w-8 rounded-lg border border-border hover:border-accent hover:text-accent transition-base"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="font-bold text-lg tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-8 w-8 rounded-lg border border-border hover:border-accent hover:text-accent transition-base"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ---------- Result view ---------- */

function ResultView({
  result,
  onDownloadPdf,
  onDownloadImage,
  onModify,
  onRegenerate,
  onConsult,
}: {
  result: PlannerResult;
  onDownloadPdf: () => void;
  onDownloadImage: () => void;
  onModify: () => void;
  onRegenerate: () => void;
  onConsult: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-subtle p-6 md:p-8 shadow-soft">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5" /> Your AI-generated plan
        </div>
        <p className="text-lg leading-relaxed">{result.summary}</p>
        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <Stat icon={Building2} label="Built-up Area" value={result.builtUpArea} />
          <Stat icon={IndianRupee} label="Estimated Cost" value={result.estimatedCost} />
          <Stat icon={Calendar} label="Timeline" value={result.timeline} />
        </div>
      </div>

      {/* Interactive 2D floor plan */}
      <SectionCard title="Interactive 2D Floor Plan" icon={Home}>
        <div className="space-y-6">
          {result.floorPlan.map((floor, idx) => (
            <div key={idx}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h4 className="font-semibold text-base">{floor.floor}</h4>
                <span className="text-xs text-muted-foreground">
                  Footprint {floor.widthFt.toFixed(1)}′ × {floor.lengthFt.toFixed(1)}′
                </span>
              </div>
              <FloorPlanCanvas floor={floor} />
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(new Set(floor.rooms.map((r) => r.type))).map((t) => {
                  const c = FLOOR_PLAN_ROOM_COLORS[t] ?? FLOOR_PLAN_ROOM_COLORS.other;
                  return (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full border"
                      style={{ background: c.fill, borderColor: c.stroke, color: c.text }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: c.stroke }} />
                      {t}
                    </span>
                  );
                })}
              </div>
              <details className="mt-3 rounded-lg border border-border bg-background">
                <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                  Room list · {floor.rooms.length} rooms
                </summary>
                <div className="grid sm:grid-cols-2 gap-2 p-3 pt-0">
                  {floor.rooms.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border p-3 flex items-start justify-between bg-background"
                    >
                      <div>
                        <p className="font-medium text-sm">{r.name}</p>
                        {r.notes && <p className="text-xs text-muted-foreground mt-0.5">{r.notes}</p>}
                      </div>
                      <span className="text-xs text-accent font-semibold whitespace-nowrap">
                        {r.w.toFixed(1)}′ × {r.h.toFixed(1)}′
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-6">
        <SectionCard title="Material Requirements" icon={Package}>
          <ul className="divide-y divide-border">
            {result.materials.map((m, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="text-sm">{m.item}</span>
                <span className="text-sm font-semibold">{m.quantity}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Design Tips" icon={Sun}>
          <ul className="space-y-2">
            {result.tips.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Front Elevation Ideas" icon={Building2}>
        <div className="grid md:grid-cols-3 gap-3">
          {result.elevation.map((e, i) => (
            <div key={i} className="rounded-xl border border-border p-4 bg-background">
              <div className="text-xs font-bold text-accent mb-1">Design {i + 1}</div>
              <p className="text-sm">{e}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Doors & Windows" icon={DoorOpen}>
        <div className="grid md:grid-cols-3 gap-3">
          {result.doorsWindows.map((d, i) => (
            <div key={i} className="rounded-xl border border-border p-4 bg-background flex gap-3">
              <Wind className="h-5 w-5 text-accent shrink-0" />
              <p className="text-sm">{d}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Actions */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Button variant="hero" onClick={onDownloadPdf}>
            <FileText className="h-4 w-4 mr-1" /> Download PDF
          </Button>
          <Button variant="outline" onClick={onDownloadImage}>
            <FileImage className="h-4 w-4 mr-1" /> Download Image
          </Button>
          <Button variant="outline" onClick={onModify}>
            <Pencil className="h-4 w-4 mr-1" /> Modify Plan
          </Button>
          <Button variant="outline" onClick={onRegenerate}>
            <RefreshCw className="h-4 w-4 mr-1" /> Generate Again
          </Button>
          <Button variant="outline" onClick={onConsult}>
            <MessageSquare className="h-4 w-4 mr-1" /> Consult Architect
          </Button>
        </div>
      </div>
    </div>
  );
}


function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
