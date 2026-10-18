import LoginForm from "../features/auth/LoginForm.jsx";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <Reveal className="card-surface p-8 shadow-soft">
        <h1 className="text-2xl font-extrabold text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink-muted">Welcome back to Homico.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-ink-muted">
          New here?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
