import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, Clock, Loader2, ShieldCheck, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { WORKER_TYPES, getWorkerBySlug } from "@/lib/workforce";
import { TIME_SLOTS } from "@/lib/home-services";

const workforceSearch = z.object({
  worker: fallback(z.enum(["mason", "labour", "carpenter", "painter"]), "mason").default("mason"),
});

export const Route = createFileRoute("/services/workforce")({
  validateSearch: zodValidator(workforceSearch),
  component: WorkforcePage,
  head: () => ({
    meta: [
      { title: "Skilled Workforce — Hire Masons, Labour, Carpenters & Painters | Homico" },
      { name: "description", content: "Hire masons, general labour, carpenters and painters by the hour or day. Transparent pricing, verified workers." },
      { property: "og:title", content: "Skilled Workforce — Homico" },
      { property: "og:description", content: "Hire skilled workers by hour or day with transparent pricing." },
    ],
  }),
});

type Mode = "hour" | "day";

function WorkforcePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { worker: initialWorker } = Route.useSearch();

  const [workerSlug, setWorkerSlug] = useState<string>(initialWorker);
  const [mode, setMode] = useState<Mode>("hour");
  const [count, setCount] = useState(1);
  const [duration, setDuration] = useState(4);
  const [description, setDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [pincode, setPincode] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(TIME_SLOTS[0]);
  const [submitting, setSubmitting] = useState(false);

  const worker = getWorkerBySlug(workerSlug)!;
  const rate = mode === "hour" ? worker.hourlyRate : worker.dailyRate;
  const total = useMemo(() => rate * count * duration, [rate, count, duration]);

  const submit = async () => {
    if (!user) {
      toast.info("Please sign in to book workers");
      navigate({ to: "/auth" });
      return;
    }
    if (!fullName || !phone || !address || !date) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    const problem = `Workforce Request — ${count}× ${worker.name}\nDuration: ${duration} ${mode}${duration > 1 ? "s" : ""}\nRate: ${formatINR(rate)}/${mode}\nWork: ${description || "—"}`;
    const { error } = await supabase.from("service_bookings").insert({
      user_id: user.id,
      category: `workforce-${worker.slug}`,
      full_name: fullName,
      phone,
      address,
      city,
      pincode,
      scheduled_date: date,
      time_slot: slot,
      problem,
      estimated_price: total,
      status: "pending",
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Workforce request submitted");
    navigate({ to: "/dashboard/bookings" });
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-subtle border-b border-border">
        <div className="container mx-auto px-4 py-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold mb-4">
            <Users className="h-3.5 w-3.5" /> Verified skilled workers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold">Skilled Workforce on demand</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Hire masons, labour, carpenters and painters by the hour or day. Transparent rates, no middlemen.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-2">1. Pick a worker type</h2>
        <p className="text-sm text-muted-foreground mb-6">All workers are background-verified and skill-tested.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {WORKER_TYPES.map((w, i) => {
            const Icon = w.icon;
            const active = w.slug === workerSlug;
            return (
              <motion.button
                key={w.slug}
                type="button"
                onClick={() => setWorkerSlug(w.slug)}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`text-left rounded-2xl border overflow-hidden transition-base ${active ? "border-accent ring-2 ring-accent/40 shadow-elegant" : "border-border bg-card hover:border-accent/60 hover:shadow-elegant"}`}
              >
                <div className="relative h-32 overflow-hidden bg-muted">
                  <img src={w.image} alt={w.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className={`absolute top-3 left-3 h-9 w-9 rounded-lg flex items-center justify-center ${w.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <div className="font-semibold leading-tight">{w.name}</div>
                    <div className="text-[11px] opacity-90">{w.tagline}</div>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">From</div>
                    <div className="font-bold">{formatINR(w.hourlyRate)}<span className="text-xs font-normal text-muted-foreground">/hr</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Day</div>
                    <div className="font-bold">{formatINR(w.dailyRate)}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-12">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold">2. Job details</h2>
              <p className="text-sm text-muted-foreground">{worker.description}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Billing</Label>
                <RadioGroup value={mode} onValueChange={(v) => { setMode(v as Mode); setDuration(v === "hour" ? 4 : 1); }} className="grid grid-cols-2 gap-2">
                  {(["hour", "day"] as Mode[]).map((m) => (
                    <label key={m} className={`rounded-lg border p-3 cursor-pointer flex items-center gap-2 ${mode === m ? "border-accent bg-accent/5" : "border-border"}`}>
                      <RadioGroupItem value={m} />
                      <span className="capitalize text-sm font-medium">Per {m}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label className="mb-2 block">Number of workers</Label>
                <Input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Math.max(1, Math.min(20, +e.target.value || 1)))} />
              </div>
              <div>
                <Label className="mb-2 block">Duration ({mode === "hour" ? "hours" : "days"})</Label>
                <Input type="number" min={1} max={mode === "hour" ? 12 : 30} value={duration} onChange={(e) => setDuration(Math.max(1, +e.target.value || 1))} />
              </div>
              <div>
                <Label className="mb-2 block">Start date</Label>
                <Input type="date" value={date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-2 block">Preferred time slot</Label>
                <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-2 block">Work description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the job — e.g. plastering 200 sqft wall, fitting 3 doors, painting 2 rooms…" rows={3} />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-3">3. Site details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="mb-2 block">Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
                <div><Label className="mb-2 block">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <div className="sm:col-span-2"><Label className="mb-2 block">Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
                <div><Label className="mb-2 block">City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
                <div><Label className="mb-2 block">Pincode</Label><Input value={pincode} onChange={(e) => setPincode(e.target.value)} /></div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 h-fit lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><Calculator className="h-4 w-4 text-accent" /> Cost summary</div>
            <div className="rounded-xl bg-muted/40 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Worker</span><span className="font-medium">{worker.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span className="font-medium">{formatINR(rate)}/{mode}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Workers</span><span className="font-medium">× {count}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">× {duration} {mode}{duration > 1 ? "s" : ""}</span></div>
              <div className="border-t border-border pt-2 flex justify-between text-base">
                <span className="font-semibold">Estimated total</span>
                <span className="font-bold text-accent">{formatINR(total)}</span>
              </div>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> Verified, ID-checked workers</li>
              <li className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-accent" /> Replacement guaranteed if no-show</li>
            </ul>
            <Button variant="hero" className="w-full" onClick={submit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Confirm booking <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Final amount may vary based on actual hours worked. Materials not included.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Looking for inspection-based maintenance like plumbing or waterproofing? <Link to="/services/home-services" className="text-accent">Browse Home Maintenance</Link>
        </p>
      </section>
    </PublicLayout>
  );
}
