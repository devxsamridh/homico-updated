import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, ArrowRight, Check, MapPin, Clock } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SERVICES } from "./services.index";

export const Route = createFileRoute("/services/book/$slug")({
  component: BookingPage,
  loader: ({ params }) => {
    const service = SERVICES.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return { service };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Service not found</h1>
        <Button asChild variant="outline" className="mt-4"><Link to="/services">Back to services</Link></Button>
      </div>
    </PublicLayout>
  ),
  errorComponent: ({ error }) => (
    <PublicLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-sm text-destructive">{error.message}</p>
      </div>
    </PublicLayout>
  ),
});

const SLOTS = [
  { id: "morning",   label: "Morning",   time: "8 AM – 12 PM" },
  { id: "afternoon", label: "Afternoon", time: "12 PM – 4 PM" },
  { id: "evening",   label: "Evening",   time: "4 PM – 8 PM" },
] as const;
type SlotId = typeof SLOTS[number]["id"];

function BookingPage() {
  const { service } = Route.useLoaderData();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<SlotId | "">("");

  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const slotLabel = SLOTS.find((s) => s.id === slot);
  const canNext1 = !!date && !!slot;
  const canNext2 = address.trim().length > 5;

  const confirm = () => {
    toast.success("Booking confirmed!", {
      description: `${service.title} on ${date && format(date, "PPP")}, ${slotLabel?.time}`,
    });
    navigate({ to: "/services" });
  };

  return (
    <PublicLayout>
      <section className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <Link to="/services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-border">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Booking</p>
              <h1 className="text-xl md:text-2xl font-bold mt-1">{service.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{service.desc}</p>
            </div>
            <span className="text-xs font-medium rounded-full bg-accent/10 text-accent px-3 py-1 whitespace-nowrap">{service.fee}</span>
          </div>

          {/* Stepper */}
          <ol className="flex items-center gap-2 my-6 text-xs">
            {[
              { n: 1, label: "Date & time" },
              { n: 2, label: "Address" },
              { n: 3, label: "Confirm" },
            ].map((s, i) => (
              <li key={s.n} className="flex items-center gap-2 flex-1">
                <span className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center font-semibold text-[11px]",
                  step >= s.n ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
                )}>
                  {step > s.n ? <Check className="h-3 w-3" /> : s.n}
                </span>
                <span className={cn("font-medium", step >= s.n ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </span>
                {i < 2 && <span className="flex-1 h-px bg-border" />}
              </li>
            ))}
          </ol>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm">Select a date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("mt-2 w-full sm:w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm">Choose a time slot</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {SLOTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSlot(s.id)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-base",
                        slot === s.id ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:border-accent/60",
                      )}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Clock className="h-4 w-4 text-accent" /> {s.label}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{s.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button disabled={!canNext1} onClick={() => setStep(2)}>
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="address" className="text-sm">Service address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / flat no, street, area, city, pincode"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="notes" className="text-sm">Notes for the professional <span className="text-muted-foreground">(optional)</span></Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. leaking kitchen tap, ring the bell twice…"
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button disabled={!canNext2} onClick={() => setStep(3)}>
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-border divide-y divide-border">
                <Row label="Service" value={service.title} />
                <Row label="Date" value={date ? format(date, "PPP") : "—"} />
                <Row label="Time slot" value={slotLabel ? `${slotLabel.label} (${slotLabel.time})` : "—"} />
                <Row label="Address" value={address} icon={<MapPin className="h-3.5 w-3.5" />} />
                {notes && <Row label="Notes" value={notes} />}
                <Row label="Fee" value={service.fee} highlight />
              </div>

              <p className="text-xs text-muted-foreground">
                You'll only be charged the inspection/visit fee upfront. Any additional work is quoted on site before starting.
              </p>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button variant="hero" onClick={confirm}>
                  Confirm & Pay
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

function Row({ label, value, icon, highlight }: { label: string; value: string; icon?: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn("text-sm text-right flex items-center gap-1.5", highlight && "font-semibold text-accent")}>
        {icon} {value}
      </span>
    </div>
  );
}
