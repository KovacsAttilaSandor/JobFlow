"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.77 17.77 0 0 1-4.16 5.19" />
      <path d="M6.71 6.72C4.57 8.17 3 12 3 12a17.54 17.54 0 0 0 5.07 5.74" />
    </svg>
  );
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setMessage("Registration successful! You can sign in now.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("A server error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_30%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1 text-sm text-muted backdrop-blur">
              🚀 JobFlow
            </div>

            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight tracking-tight">
              Create an account and start organizing your
              <span className="block text-blue-400">
                job applications
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-2">
              Track roles, interviews, and follow-ups in a modern dashboard,
              and use AI tools to move your search faster.
            </p>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-5 backdrop-blur">
                <div className="text-sm font-medium text-foreground">
                  Job tracking
                </div>
                <div className="mt-2 text-sm text-muted-2">
                  Statuses, board view, events, and dashboard.
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5 backdrop-blur">
                <div className="text-sm font-medium text-foreground">AI tools</div>
                <div className="mt-2 text-sm text-muted-2">
                  Match score, AI summary, and cover letter generation.
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md justify-self-center">
            <div className="mb-8 text-center lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1 text-sm text-muted backdrop-blur">
                🚀 JobFlow
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                Register
              </h1>

              <p className="mt-3 text-sm leading-6 text-muted-2">
                Create a new account and manage everything in one place.
              </p>
            </div>

            <div className="rounded-[28px] border border-border bg-surface p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-6 hidden lg:block">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Register
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-2">
                  Enter your details to create your JobFlow account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-foreground placeholder:text-muted-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-foreground placeholder:text-muted-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 pr-12 text-foreground placeholder:text-muted-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-muted transition hover:text-foreground"
                      aria-label="Show password"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Confirm password
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 pr-12 text-foreground placeholder:text-muted-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-muted transition hover:text-foreground"
                      aria-label="Show password"
                    >
                      <EyeIcon open={showConfirmPassword} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/70 border-t-transparent" />
                  )}
                  {loading ? "Registering..." : "Create account"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-2">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-foreground underline underline-offset-4 transition hover:opacity-80"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}