"use client";

import { useState } from "react";

type Props = {
  jobId: string;
};

export default function JobCoverLetter({ jobId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  async function handleGenerate() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/jobs/${jobId}/cover-letter`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Nem sikerült cover lettert generálni.");
        return;
      }

      setCoverLetter(data.coverLetter);
    } catch (err) {
      console.error(err);
      setError("Hiba történt a generálás közben.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!coverLetter) return;
    await navigator.clipboard.writeText(coverLetter);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">AI Cover Letter</h2>
          <p className="mt-1 text-sm text-slate-400">
            Generálj személyre szabott motivációs levelet az álláshoz.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Generálás..." : "Generálás"}
          </button>

          {coverLetter && (
            <button
              onClick={handleCopy}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Másolás
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {coverLetter && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
          <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
            {coverLetter}
          </pre>
        </div>
      )}
    </section>
  );
}