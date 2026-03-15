"use client";

import { useState } from "react";

type SummaryResult = {
  summary: string;
  responsibilities: string[];
  requirements: string[];
  techStack: string[];
};

type MatchResult = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
};

type Props = {
  jobId: string;
  initialSummary: SummaryResult | null;
  initialMatch: MatchResult | null;
  initialCoverLetter: string | null;
};

export default function JobAiInsights({
  jobId,
  initialSummary,
  initialMatch,
  initialCoverLetter,
}: Props) {
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  const [error, setError] = useState("");

  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(
    initialSummary
  );
  const [matchResult, setMatchResult] = useState<MatchResult | null>(
    initialMatch
  );
  const [coverLetter, setCoverLetter] = useState(initialCoverLetter || "");

  async function generateSummary() {
    setLoadingSummary(true);
    setError("");

    try {
      const res = await fetch(`/api/jobs/${jobId}/summary`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Nem sikerült summary-t generálni.");
        return;
      }

      setSummaryResult(data);
    } catch (err) {
      console.error(err);
      setError("Hiba történt a summary generálása közben.");
    } finally {
      setLoadingSummary(false);
    }
  }

  async function generateMatch() {
    setLoadingMatch(true);
    setError("");

    try {
      const res = await fetch(`/api/jobs/${jobId}/match-score`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Nem sikerült match score-t generálni.");
        return;
      }

      setMatchResult(data);
    } catch (err) {
      console.error(err);
      setError("Hiba történt a match score generálása közben.");
    } finally {
      setLoadingMatch(false);
    }
  }

  async function generateCoverLetter() {
    setLoadingLetter(true);
    setError("");

    try {
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
      setError("Hiba történt a cover letter generálása közben.");
    } finally {
      setLoadingLetter(false);
    }
  }

  async function generateAll() {
    setLoadingAll(true);
    setError("");

    try {
      const [summaryRes, matchRes, letterRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}/summary`, { method: "POST" }),
        fetch(`/api/jobs/${jobId}/match-score`, { method: "POST" }),
        fetch(`/api/jobs/${jobId}/cover-letter`, { method: "POST" }),
      ]);

      const summaryData = await summaryRes.json();
      const matchData = await matchRes.json();
      const letterData = await letterRes.json();

      if (!summaryRes.ok) {
        setError(summaryData.error || "Summary generálás sikertelen.");
        return;
      }

      if (!matchRes.ok) {
        setError(matchData.error || "Match score generálás sikertelen.");
        return;
      }

      if (!letterRes.ok) {
        setError(letterData.error || "Cover letter generálás sikertelen.");
        return;
      }

      setSummaryResult(summaryData);
      setMatchResult(matchData);
      setCoverLetter(letterData.coverLetter);
    } catch (err) {
      console.error(err);
      setError("Hiba történt az AI elemzés közben.");
    } finally {
      setLoadingAll(false);
    }
  }

  async function copyCoverLetter() {
    if (!coverLetter) return;
    await navigator.clipboard.writeText(coverLetter);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            AI Insights
          </div>

          <h2 className="mt-4 text-2xl font-semibold">AI elemzések</h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Egy helyen generálhatsz állás összefoglalót, CV match score-t és
            személyre szabott cover lettert.
          </p>
        </div>

        <button
          onClick={generateAll}
          disabled={loadingAll}
          className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
        >
          {loadingAll ? "Generálás..." : "Generate all"}
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-white">Job Summary</h3>
              <p className="mt-1 text-xs text-slate-500">
                Rövid összefoglaló és tech stack
              </p>
            </div>

            <button
              onClick={generateSummary}
              disabled={loadingSummary}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {loadingSummary ? "..." : "Generate"}
            </button>
          </div>

          {summaryResult ? (
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-7 text-slate-300">
                {summaryResult.summary}
              </p>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Feladatok
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {summaryResult.responsibilities.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Elvárások
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {summaryResult.requirements.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Tech stack
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {summaryResult.techStack.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyAiState text="Még nincs summary generálva." />
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-white">Match Score</h3>
              <p className="mt-1 text-xs text-slate-500">
                CV és állás összehasonlítás
              </p>
            </div>

            <button
              onClick={generateMatch}
              disabled={loadingMatch}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {loadingMatch ? "..." : "Generate"}
            </button>
          </div>

          {matchResult ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Score
                </p>
                <p className="mt-2 text-4xl font-semibold text-white">
                  {matchResult.score}%
                </p>
              </div>

              <p className="text-sm leading-7 text-slate-300">
                {matchResult.summary}
              </p>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Erősségek
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {matchResult.strengths.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Hiányosságok
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {matchResult.gaps.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <EmptyAiState text="Még nincs match score generálva." />
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-white">Cover Letter</h3>
              <p className="mt-1 text-xs text-slate-500">
                Személyre szabott motivációs levél
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={generateCoverLetter}
                disabled={loadingLetter}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                {loadingLetter ? "..." : "Generate"}
              </button>

              {coverLetter && (
                <button
                  onClick={copyCoverLetter}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                >
                  Copy
                </button>
              )}
            </div>
          </div>

          {coverLetter ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {coverLetter}
              </pre>
            </div>
          ) : (
            <EmptyAiState text="Még nincs cover letter generálva." />
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyAiState({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
      {text}
    </div>
  );
}