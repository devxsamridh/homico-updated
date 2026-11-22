import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../../components/Button.jsx";

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", full_name: "", phone: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === "string" ? data : Object.values(data || {})[0]?.[0] || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-2">
      <Field label="Full name" value={form.full_name} onChange={handle("full_name")} required />
      <Field label="Username" value={form.username} onChange={handle("username")} required />
      <Field label="Email" type="email" value={form.email} onChange={handle("email")} required />
      <Field label="Phone" value={form.phone} onChange={handle("phone")} />
      <Field className="sm:col-span-2" label="Password" type="password" value={form.password} onChange={handle("password")} required />
      {error && <p className="text-sm font-medium text-red-500 sm:col-span-2">{error}</p>}
      <Button type="submit" loading={submitting} disabled={submitting} size="md" className="w-full sm:col-span-2">
        Create account
      </Button>
    </form>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-ink">{label}</span>
      <input
        {...props}
        className="mt-0.5 input-base py-1.5"
      />
    </label>
  );
}
