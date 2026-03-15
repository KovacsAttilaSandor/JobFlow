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
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A két jelszó nem egyezik.");
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
        setError(data.error || "Hiba történt.");
        return;
      }

      setMessage("Sikeres regisztráció! Most már bejelentkezhetsz.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("Szerverhiba történt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_30%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-slate-300 backdrop-blur">
              🚀 JobFlow
            </div>

            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight tracking-tight">
              Hozz létre egy fiókot, és kezdd el rendszerezni az
              <span className="block text-blue-400">
                állásjelentkezéseidet
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              Kövesd az állásokat, interjúkat és follow-upokat egy modern
              dashboardban, és használd az AI funkciókat a gyorsabb
              álláskereséshez.
            </p>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-sm font-medium text-white">
                  Job tracking
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  Státuszok, board nézet, események és dashboard.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-sm font-medium text-white">AI tools</div>
                <div className="mt-2 text-sm text-slate-400">
                  Match score, AI summary és cover letter generálás.
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md justify-self-center">
            <div className="mb-8 text-center lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-slate-300 backdrop-blur">
                🚀 JobFlow
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                Regisztráció
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Hozz létre egy új fiókot, és kezdj el mindent egy helyen kezelni.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-6 hidden lg:block">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Regisztráció
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Add meg az adataidat, és kész is a JobFlow fiókod.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Név
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Teljes neved"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="pelda@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Jelszó
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 pr-12 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Legalább 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-white"
                      aria-label="Jelszó megjelenítése"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Jelszó megerősítése
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 pr-12 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Írd be újra a jelszót"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-white"
                      aria-label="Jelszó megjelenítése"
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
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-medium text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                  )}
                  {loading ? "Regisztráció..." : "Fiók létrehozása"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-400">
                Már van fiókod?{" "}
                <Link
                  href="/login"
                  className="font-medium text-white underline underline-offset-4 transition hover:text-slate-200"
                >
                  Bejelentkezés
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}