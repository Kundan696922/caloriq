import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

 

  function handleChange(e) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const response = await login(form);

      if (response.success) {
        navigate("/", {
          replace: true,
          state: {
            toast: "Login successful!",
          },
        });
      }
    } catch (error) {
      setError(
        error.message || "Unable to log in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome back
            </h1>

            <p className="mt-2 text-text-secondary">
              Log in to continue to your Calor
              <span className="text-accent">iq</span> account.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-sm text-text-secondary">Email</span>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm text-text-secondary">Password</span>

              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-text-primary outline-none focus:border-primary"
                  placeholder="Your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
                </button>
              </div>
            </label>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </Card>
      </main>
    </>
  );
}
