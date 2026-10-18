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
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Full name" value={form.full_name} onChange={handle("full_name")} required />
      <Field label="Username" value={form.username} onChange={handle("username")} required />
      <Field label="Email" type="email" value={form.email} onChange={handle("email")} required />
      <Field label="Phone" value={form.phone} onChange={handle("phone")} />
      <Field label="Password" type="password" value={form.password} onChange={handle("password")} required />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        {...props}
        className="mt-1 input-base"
      />
    </label>
  );
}
