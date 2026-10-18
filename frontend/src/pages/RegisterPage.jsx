import RegisterForm from "../features/auth/RegisterForm.jsx";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";

export default function RegisterPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <Reveal className="card-surface p-8 shadow-soft">
        <h1 className="text-2xl font-extrabold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-muted">Start managing your home with Homico.</p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
