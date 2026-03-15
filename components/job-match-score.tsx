"use client";

import { useState } from "react";

type Props = {
  jobId: string;
};

type MatchResult = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
};

export default function JobMatchScore({ jobId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);

  async function handleAnalyze() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/jobs/${jobId}/match-score`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Nem sikerült lefuttatni az elemzést.");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Hiba történt az AI elemzés közben.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">AI Match Score</h2>
          <p className="mt-1 text-sm text-slate-400">
            Hasonlítsd össze a CV-det az állás leírásával.
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Elemzés..." : "AI elemzés"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <p className="text-sm text-slate-400">Match score</p>
            <p className="mt-2 text-4xl font-semibold text-white">
              {result.score}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <h3 className="text-sm font-medium text-white">Összegzés</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {result.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <h3 className="text-sm font-medium text-white">Erősségek</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {result.strengths.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <h3 className="text-sm font-medium text-white">Hiányosságok</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {result.gaps.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}