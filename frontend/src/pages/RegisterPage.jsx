import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(e) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setToast("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

     if (response.success) {
       navigate("/", {
         replace: true,
         state: {
           toast: "Account created successfully!",
         },
       });
     }
    } catch (error) {
      setError(
        error.message ||
          "Unable to create your account. Please try again.",
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
              Create your account
            </h1>

            <p className="mt-2 text-text-secondary">
              Start tracking your nutrition with Calor
              <span className="text-accent">iq</span>.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-sm text-text-secondary">Name</span>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
                minLength={2}
                maxLength={50}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary"
                placeholder="Your name"
              />
            </label>

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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-text-primary outline-none focus:border-primary"
                  placeholder="At least 8 characters"
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

            <label className="block">
              <span className="text-sm text-text-secondary">
                Confirm password
              </span>

              <div className="relative mt-1.5">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-text-primary outline-none focus:border-primary"
                  placeholder="Repeat your password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={19} />
                  ) : (
                    <FiEye size={19} />
                  )}
                </button>
              </div>
            </label>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </Card>
      </main>
    </>
  );
}
