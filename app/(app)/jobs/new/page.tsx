"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function NewJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        company,
        location,
        jobUrl,
        description,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Nem sikerült létrehozni az állást.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-3xl font-semibold mb-8">
          Új állás hozzáadása
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div>
            <label className="text-sm text-slate-300">Pozíció</label>
            <input
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Cég</label>
            <input
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Helyszín</label>
            <input
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Job URL</label>
            <input
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Leírás</label>
            <textarea
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 text-slate-950 font-medium"
          >
            {loading ? "Mentés..." : "Állás mentése"}
          </button>
        </form>
      </div>
    </main>
  );
}
