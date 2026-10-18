import { useState } from "react";
import { bookingsApi } from "../../api/bookings.js";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";
import { formatINR } from "../../utils/format.js";

const SLOTS = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00"];

/**
 * Modal-style booking form for a single ServiceItem.
 * Posts to /api/bookings/services/ — requires auth.
 */
export default function BookingForm({ service, onClose }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    scheduled_date: "",
    time_slot: SLOTS[0],
    problem: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await bookingsApi.create({
        ...form,
        service: service.id,
        estimated_price: service.is_hourly ? service.hourly_rate : service.inspection_fee,
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Booking failed. Are you signed in?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title={service.title} size="md">
      <div>
        <p className="text-sm text-ink-muted -mt-2 mb-4">
          {service.is_hourly
            ? `Rate: ₹${service.hourly_rate}/hr`
            : `Inspection visit fee: ₹${service.inspection_fee}`}
        </p>

        {done ? (
          <div className="rounded-2xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/30">
            <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
              Booking confirmed!
            </h3>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
              You can track technician visit progress in your Dashboard.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <a
                href="/dashboard"
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-primary-dark"
              >
                Go to Dashboard
              </a>
              <button
                onClick={onClose}
                className="rounded-xl border border-border-muted px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
            <Field label="Full name" value={form.full_name} onChange={handle("full_name")} required />
            <Field label="Phone" value={form.phone} onChange={handle("phone")} required />
            <Field className="col-span-2" label="Address" value={form.address} onChange={handle("address")} required />
            <Field label="City" value={form.city} onChange={handle("city")} />
            <Field label="Pincode" value={form.pincode} onChange={handle("pincode")} />
            <Field label="Date" type="date" value={form.scheduled_date} onChange={handle("scheduled_date")} required />
            <label className="block">
              <span className="text-xs font-semibold text-ink">Time slot</span>
              <select
                value={form.time_slot}
                onChange={handle("time_slot")}
                className="mt-1 input-base py-2 text-xs"
              >
                {SLOTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <Field
              className="col-span-2"
              label="Describe the problem"
              value={form.problem}
              onChange={handle("problem")}
            />
            {error && <p className="col-span-2 text-xs font-medium text-red-500">{error}</p>}
            <Button type="submit" disabled={submitting} className="col-span-2 mt-2">
              {submitting ? "Booking…" : "Confirm Booking"}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-ink">{label}</span>
      <input
        {...props}
        className="mt-1 input-base py-2 text-xs"
      />
    </label>
  );
}
