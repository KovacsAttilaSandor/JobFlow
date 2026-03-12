"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (result?.error) {
      setError("Hibás email vagy jelszó.");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12 text-white">

      {/* háttér glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.18),transparent_30%)]" />

      <div className="relative w-full max-w-md">

        {/* logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-slate-300 backdrop-blur">
            🚀 JobFlow
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Jelentkezz be
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Kövesd az állásjelentkezéseidet, interjúidat és ajánlataidat egy
            modern dashboardban.
          </p>
        </div>

        {/* login card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                placeholder="pelda@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Jelszó
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Írd be a jelszavad"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* remember */}
            <div className="flex items-center justify-between text-sm text-slate-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-500" />
                Emlékezz rám
              </label>

              <a
                href="#"
                className="hover:text-white transition"
              >
                Elfelejtett jelszó?
              </a>
            </div>

            {/* error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              )}

              {loading ? "Bejelentkezés..." : "Bejelentkezés"}
            </button>
          </form>

          {/* register link */}
          <div className="mt-6 text-center text-sm text-slate-400">
            Nincs még fiókod?{" "}
            <a
              href="/register"
              className="font-medium text-white underline underline-offset-4 transition hover:text-slate-200"
            >
              Regisztráció
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}