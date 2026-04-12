"use client";

import { useState } from "react";
import {
  AiOutputLanguageSelect,
  useAiOutputLanguage,
} from "@/components/ai-output-language";
import { buildAiGenerationQuery } from "@/lib/ai-output-language";

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
  const { lang, setLang } = useAiOutputLanguage();

  async function handleAnalyze() {
    try {
      setLoading(true);
      setError("");

      const q = buildAiGenerationQuery({
        regenerate: Boolean(result),
        lang,
      });
      const res = await fetch(`/api/jobs/${jobId}/match-score${q}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to run analysis.");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong during AI analysis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">AI Match Score</h2>
          <p className="mt-1 text-sm text-muted-2">
            Compare your résumé with the job description.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <AiOutputLanguageSelect
            id={`ai-lang-match-${jobId}`}
            lang={lang}
            onChange={setLang}
            disabled={loading}
            labelClassName="text-[11px] font-medium uppercase tracking-wide text-muted-2"
            selectClassName="w-full min-w-[160px] rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="shrink-0 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading
              ? "Analyzing..."
              : result
                ? "Regenerate analysis"
                : "Run AI analysis"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl border border-border bg-surface-2/60 p-5">
            <p className="text-sm text-muted-2">Match score</p>
            <p className="mt-2 text-4xl font-semibold text-foreground">
              {result.score}%
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-2/60 p-5">
            <h3 className="text-sm font-medium text-foreground">Summary</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              {result.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-2/60 p-5">
              <h3 className="text-sm font-medium text-foreground">Strengths</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {result.strengths.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-surface-2/60 p-5">
              <h3 className="text-sm font-medium text-foreground">Gaps</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted">
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