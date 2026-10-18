import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { bookingsApi } from "../api/bookings.js";
import Card from "../components/Card.jsx";
import { formatDate, formatINR } from "../utils/format.js";
import Modal from "../components/Modal.jsx";
import Reveal, { RevealItem } from "../components/Reveal.jsx";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  FileText,
  Wrench,
  CaretRight,
  ShieldCheck,
  Check,
} from "@phosphor-icons/react";

/* Semantic status badge mappings with muted, low-saturation tones */
const STATUS_CONFIG = {
  pending: { label: "Requested", bg: "bg-amber-950/40 text-amber-400 border border-amber-900/40" },
  confirmed: { label: "Confirmed", bg: "bg-zinc-800 text-zinc-300 border border-zinc-700" },
  vendor_assigned: { label: "Vendor Assigned", bg: "bg-zinc-800 text-zinc-300 border border-zinc-700" },
  inspection_completed: { label: "Inspection Done", bg: "bg-zinc-800 text-zinc-300 border border-zinc-700" },
  quotation_sent: { label: "Quotation Received", bg: "bg-amber-950/40 text-amber-400 border border-amber-900/40" },
  quotation_accepted: { label: "Quotation Accepted", bg: "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" },
  quotation_rejected: { label: "Quotation Rejected", bg: "bg-rose-950/40 text-rose-400 border border-rose-900/40" },
  work_in_progress: { label: "Work in Progress", bg: "bg-zinc-800 text-zinc-300 border border-zinc-700" },
  completed: { label: "Completed", bg: "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" },
  cancelled: { label: "Cancelled", bg: "bg-surface-muted text-ink-muted border border-line" },
};

const STEPS = [
  { key: "pending", label: "Requested" },
  { key: "vendor_assigned", label: "Assigned" },
  { key: "inspection_completed", label: "Inspected" },
  { key: "quotation_sent", label: "Quoted" },
  { key: "work_in_progress", label: "In Progress" },
  { key: "completed", label: "Done" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [fetchKey, setFetchKey] = useState(0);

  const { data: bookingsData, loading: bookingsLoading } = useFetch(
    () => bookingsApi.list(),
    [fetchKey]
  );

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [decidingQuote, setDecidingQuote] = useState(false);
  const [quoteMsg, setQuoteMsg] = useState(null);

  const bookings = bookingsData?.results ?? bookingsData ?? [];

  const openBookingDetail = async (bookingId) => {
    try {
      const detail = await bookingsApi.get(bookingId);
      setSelectedBooking(detail);
      setQuoteMsg(null);
    } catch (err) {
      console.error("Failed to load booking detail", err);
    }
  };

  const handleDecideQuote = async (quotationId, decision) => {
    setDecidingQuote(true);
    setQuoteMsg(null);
    try {
      await bookingsApi.decideQuotation(quotationId, decision);
      setQuoteMsg({
        type: "success",
        text: `Quotation has been successfully ${decision}!`,
      });
      setFetchKey((k) => k + 1);
      if (selectedBooking) {
        const refreshed = await bookingsApi.get(selectedBooking.id);
        setSelectedBooking(refreshed);
      }
    } catch (err) {
      setQuoteMsg({
        type: "error",
        text: err.response?.data?.detail || `Failed to ${decision} quotation.`,
      });
    } finally {
      setDecidingQuote(false);
    }
  };

  const getStepProgressIndex = (status) => {
    if (status === "cancelled") return -1;
    if (status === "pending" || status === "confirmed") return 0;
    if (status === "vendor_assigned") return 1;
    if (status === "inspection_completed") return 2;
    if (status === "quotation_sent" || status === "quotation_rejected") return 3;
    if (status === "quotation_accepted" || status === "work_in_progress") return 4;
    if (status === "completed") return 5;
    return 0;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Welcome Banner */}
      <Reveal className="card-surface p-6 md:p-8 relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-white/[0.03] blur-3xl" />
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center relative z-10">
          <div>
            <span className="badge border border-line bg-surface-muted text-ink">
              <ShieldCheck size={14} weight="duotone" />
              Customer Portal
            </span>
            <h1 className="mt-2 text-2xl font-black text-ink sm:text-3xl">
              Welcome back, {user?.full_name || user?.email}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Track your service visits, review contractor quotations, and monitor work progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="card-surface p-3 text-center min-w-[5rem] shadow-soft-xs">
              <p className="text-2xl font-black text-ink">{bookings.length}</p>
              <p className="text-[11px] font-semibold text-ink-muted">Bookings</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Bookings View */}
      <div className="mt-8">
        {bookingsLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="card-surface p-6 skeleton">
                <div className="h-6 w-1/3 rounded bg-surface-muted" />
                <div className="mt-4 h-4 w-1/2 rounded bg-surface-muted" />
                <div className="mt-8 h-10 w-full rounded bg-surface-muted" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line p-12 text-center card-surface">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-muted text-ink">
              <Wrench size={24} weight="duotone" />
            </div>
            <p className="mt-3 text-base font-semibold text-ink">No bookings yet</p>
            <p className="text-sm text-ink-muted">Need help around the house? Book an expert inspection visit.</p>
            <a
              href="/services"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary-strong"
            >
              Browse Services
            </a>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {bookings.map((b) => {
              const statusInfo = STATUS_CONFIG[b.status] || {
                label: b.status,
                bg: "bg-surface-muted text-ink-muted border border-line",
              };
              const hasQuoteAction = b.status === "quotation_sent";
              const progressIdx = getStepProgressIndex(b.status);

              return (
                <Card key={b.id} className="flex flex-col justify-between transition-all hover:border-ink/20">
                  <div>
                    {/* Top Bar */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-ink text-base">
                          {b.service?.title || `Service #${b.service}`}
                        </h3>
                        <p className="text-xs text-ink-faint">Booking ID: {b.id.slice(-6).toUpperCase()}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusInfo.bg}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Step Progress Bar */}
                    {b.status !== "cancelled" && (
                      <div className="mt-4 border-y border-line py-3">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-ink-faint">
                          {STEPS.map((step, idx) => (
                            <div
                              key={step.key}
                              className={`flex items-center gap-1 ${
                                idx <= progressIdx ? "text-ink font-bold" : ""
                              }`}
                            >
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                                  idx <= progressIdx
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-surface-muted text-ink-faint border border-line"
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="hidden sm:inline">{step.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meta Information */}
                    <div className="mt-4 space-y-1.5 text-xs text-ink-muted">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} weight="duotone" className="text-ink-faint" />
                        <span>{formatDate(b.scheduled_date)}</span>
                        <span className="text-ink-faint">•</span>
                        <Clock size={14} weight="duotone" className="text-ink-faint" />
                        <span>{b.time_slot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} weight="duotone" className="text-ink-faint" />
                        <span className="truncate">{b.address}</span>
                      </div>
                    </div>

                    {/* Problem note */}
                    {b.problem && (
                      <div className="mt-3 rounded-xl border border-line bg-surface-muted p-2.5 text-xs text-ink-muted">
                        <span className="font-semibold text-ink">Problem note: </span>
                        {b.problem}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
                    <div>
                      <span className="text-xs text-ink-faint">Inspection Fee</span>
                      <p className="text-sm font-bold text-ink">
                        {formatINR(b.estimated_price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasQuoteAction && (
                        <span className="animate-pulse rounded-full bg-amber-950/40 border border-amber-900/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
                          Action Needed
                        </span>
                      )}
                      <button
                        onClick={() => openBookingDetail(b.id)}
                        className="flex items-center gap-1 rounded-xl border border-line bg-surface-muted px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-primary hover:text-primary-foreground"
                      >
                        <span>View Details</span>
                        <CaretRight size={14} weight="bold" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Detail & Quotation Review Modal */}
      {selectedBooking && (
        <Modal
          open={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={selectedBooking.service?.title || "Booking Detail"}
          size="md"
        >
          <div>
            <p className="text-xs text-ink-faint -mt-2">Booking ID: {selectedBooking.id}</p>

            {quoteMsg && (
              <div
                className={`mt-4 rounded-xl p-3 text-xs font-semibold ${
                  quoteMsg.type === "success"
                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                    : "bg-rose-950/40 text-rose-400 border border-rose-900/40"
                }`}
              >
                {quoteMsg.text}
              </div>
            )}

            {/* Quotations section */}
            <div className="mt-5">
              <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                <FileText size={16} weight="duotone" className="text-ink" />
                <span>Contractor Quotations</span>
              </h3>

              {!selectedBooking.quotations || selectedBooking.quotations.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-line bg-surface-muted p-4 text-center text-xs text-ink-muted">
                  No quotes generated yet. The assigned technician will provide an itemized quote after the ₹89 inspection visit.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {selectedBooking.quotations.map((q) => {
                    const isSent = q.status === "sent";
                    const isAccepted = q.status === "accepted";
                    const isRejected = q.status === "rejected";

                    return (
                      <div
                        key={q.id}
                        className={`rounded-2xl border p-4 transition-all ${
                          isSent
                            ? "border-line bg-surface-muted/60"
                            : "border-line"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-ink">Quote #{q.id.slice(-6)}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isSent
                                ? "bg-amber-950/40 text-amber-400 border border-amber-900/40"
                                : isAccepted
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                                : isRejected
                                ? "bg-rose-950/40 text-rose-400 border border-rose-900/40"
                                : "bg-surface-muted text-ink-muted border border-line"
                            }`}
                          >
                            {q.status.toUpperCase()}
                          </span>
                        </div>

                        {q.description && (
                          <p className="mt-2 text-xs text-ink-muted">{q.description}</p>
                        )}

                        {/* Cost Breakdown */}
                        <div className="mt-3 space-y-1 border-t border-dashed border-line pt-2 text-xs text-ink-muted">
                          <div className="flex justify-between">
                            <span>Labor Charges</span>
                            <span>{formatINR(q.labor_cost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Material Cost</span>
                            <span>{formatINR(q.material_cost)}</span>
                          </div>
                          <div className="flex justify-between border-t border-line pt-1 font-bold text-ink">
                            <span>Total Estimate</span>
                            <span className="text-ink">{formatINR(q.total_amount)}</span>
                          </div>
                        </div>

                        {/* Action Buttons for Sent Quotation */}
                        {isSent && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => handleDecideQuote(q.id, "accepted")}
                              disabled={decidingQuote}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow-soft transition hover:bg-primary-strong disabled:opacity-50"
                            >
                              <Check size={14} weight="bold" />
                              Accept &amp; Start Work
                            </button>
                            <button
                              onClick={() => handleDecideQuote(q.id, "rejected")}
                              disabled={decidingQuote}
                              className="flex items-center justify-center gap-1 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink disabled:opacity-50"
                            >
                              <XCircle size={14} weight="bold" />
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
