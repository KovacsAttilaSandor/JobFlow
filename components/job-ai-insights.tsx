"use client";

import { useMemo, useState } from "react";
import {
  AiOutputLanguageSelect,
  useAiOutputLanguage,
} from "@/components/ai-output-language";
import { buildAiGenerationQuery } from "@/lib/ai-output-language";

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

type PrepResult = {
  questions: string[];
  talkingPoints: string[];
  checklist: string[];
  pitch30s: string;
};

type Props = {
  jobId: string;
  initialSummary: SummaryResult | null;
  initialMatch: MatchResult | null;
  initialCoverLetter: string | null;
  initialPrep: PrepResult | null;
};

type TabKey = "summary" | "match" | "cover" | "prep";

function SummaryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
    </svg>
  );
}

function MatchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function CoverIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PrepIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M7 7h10" />
      <path d="M7 11h10" />
      <path d="M7 15h6" />
      <path d="M5 3h14v18H5z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M5 15V7a2 2 0 0 1 2-2h8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function JobAiInsights({
  jobId,
  initialSummary,
  initialMatch,
  initialCoverLetter,
  initialPrep,
}: Props) {
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [loadingPrep, setLoadingPrep] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  const [error, setError] = useState("");

  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(
    initialSummary
  );
  const [matchResult, setMatchResult] = useState<MatchResult | null>(
    initialMatch
  );
  const [coverLetter, setCoverLetter] = useState(initialCoverLetter || "");
  const [prepResult, setPrepResult] = useState<PrepResult | null>(initialPrep);
  const [copied, setCopied] = useState(false);

  const defaultTab: TabKey = useMemo(() => {
    if (initialSummary) return "summary";
    if (initialMatch) return "match";
    if (initialCoverLetter) return "cover";
    if (initialPrep) return "prep";
    return "summary";
  }, [initialSummary, initialMatch, initialCoverLetter, initialPrep]);

  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  const { lang, setLang } = useAiOutputLanguage();

  const aiBusy =
    loadingSummary ||
    loadingMatch ||
    loadingLetter ||
    loadingPrep ||
    loadingAll;

  async function generateSummary() {
    setLoadingSummary(true);
    setError("");

    try {
      const q = buildAiGenerationQuery({
        regenerate: Boolean(summaryResult),
        lang,
      });
      const res = await fetch(`/api/jobs/${jobId}/summary${q}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate summary.");
        return;
      }

      setSummaryResult(data);
      setActiveTab("summary");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while generating the summary.");
    } finally {
      setLoadingSummary(false);
    }
  }

  async function generateMatch() {
    setLoadingMatch(true);
    setError("");

    try {
      const q = buildAiGenerationQuery({
        regenerate: Boolean(matchResult),
        lang,
      });
      const res = await fetch(`/api/jobs/${jobId}/match-score${q}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate match score.");
        return;
      }

      setMatchResult(data);
      setActiveTab("match");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while generating the match score.");
    } finally {
      setLoadingMatch(false);
    }
  }

  async function generateCoverLetter() {
    setLoadingLetter(true);
    setError("");

    try {
      const q = buildAiGenerationQuery({
        regenerate: coverLetter.trim().length > 0,
        lang,
      });
      const res = await fetch(`/api/jobs/${jobId}/cover-letter${q}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate cover letter.");
        return;
      }

      setCoverLetter(data.coverLetter);
      setActiveTab("cover");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while generating the cover letter.");
    } finally {
      setLoadingLetter(false);
    }
  }

  async function generatePrep() {
    setLoadingPrep(true);
    setError("");

    try {
      const q = buildAiGenerationQuery({
        regenerate: Boolean(prepResult),
        lang,
      });
      const res = await fetch(`/api/jobs/${jobId}/interview-prep${q}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate interview prep.");
        return;
      }

      setPrepResult(data);
      setActiveTab("prep");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while generating interview prep.");
    } finally {
      setLoadingPrep(false);
    }
  }

  async function generateAll() {
    setLoadingAll(true);
    setError("");

    try {
      const q = buildAiGenerationQuery({
        regenerate: Boolean(
          summaryResult || matchResult || coverLetter.trim()
        ),
        lang,
      });
      const [summaryRes, matchRes, letterRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}/summary${q}`, { method: "POST" }),
        fetch(`/api/jobs/${jobId}/match-score${q}`, { method: "POST" }),
        fetch(`/api/jobs/${jobId}/cover-letter${q}`, { method: "POST" }),
      ]);

      const summaryData = await summaryRes.json();
      const matchData = await matchRes.json();
      const letterData = await letterRes.json();

      if (!summaryRes.ok) {
        setError(summaryData.error || "Summary generation failed.");
        return;
      }

      if (!matchRes.ok) {
        setError(matchData.error || "Match score generation failed.");
        return;
      }

      if (!letterRes.ok) {
        setError(letterData.error || "Cover letter generation failed.");
        return;
      }

      setSummaryResult(summaryData);
      setMatchResult(matchData);
      setCoverLetter(letterData.coverLetter);
      setActiveTab("summary");
    } catch (err) {
      console.error(err);
      setError("Something went wrong during AI analysis.");
    } finally {
      setLoadingAll(false);
    }
  }

  async function copyCoverLetter() {
    if (!coverLetter) return;

    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  function tabButtonClass(tab: TabKey) {
    const active = activeTab === tab;

    return `inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
      active
        ? "bg-white text-slate-950"
        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
    }`;
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_28%)] px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              AI Insights
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              AI insights for this job
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Generate a smart summary, résumé match score, and tailored cover
              letter in one clear workspace.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 lg:max-w-sm lg:shrink-0">
            <AiOutputLanguageSelect
              id={`ai-output-lang-${jobId}`}
              lang={lang}
              onChange={setLang}
              disabled={aiBusy}
            />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={generateSummary}
              disabled={loadingSummary}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {loadingSummary
                ? "Summary..."
                : summaryResult
                  ? "Regenerate summary"
                  : "Summary"}
            </button>

            <button
              onClick={generateMatch}
              disabled={loadingMatch}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {loadingMatch
                ? "Match..."
                : matchResult
                  ? "Regenerate match"
                  : "Match score"}
            </button>

            <button
              onClick={generateCoverLetter}
              disabled={loadingLetter}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {loadingLetter
                ? "Letter..."
                : coverLetter.trim()
                  ? "Regenerate letter"
                  : "Cover letter"}
            </button>

            <button
              onClick={generatePrep}
              disabled={loadingPrep}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {loadingPrep
                ? "Prep..."
                : prepResult
                  ? "Regenerate prep"
                  : "Interview prep"}
            </button>

            <button
              onClick={generateAll}
              disabled={loadingAll}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
            >
              {loadingAll
                ? "Generating..."
                : summaryResult || matchResult || coverLetter.trim()
                  ? "Regenerate all"
                  : "Generate all"}
            </button>
          </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={tabButtonClass("summary")}
          >
            <SummaryIcon />
            <span>Summary</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("match")}
            className={tabButtonClass("match")}
          >
            <MatchIcon />
            <span>Match Score</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cover")}
            className={tabButtonClass("cover")}
          >
            <CoverIcon />
            <span>Cover Letter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prep")}
            className={tabButtonClass("prep")}
          >
            <PrepIcon />
            <span>Interview Prep</span>
          </button>
        </div>

        {activeTab === "summary" && (
          <>
            {summaryResult ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Summary
                  </p>
                  <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
                    {summaryResult.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Responsibilities
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                      {summaryResult.responsibilities.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Requirements
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                      {summaryResult.requirements.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Tech stack
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {summaryResult.techStack.map((item, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyAiState text="No summary generated for this job yet." />
            )}
          </>
        )}

        {activeTab === "match" && (
          <>
            {matchResult ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Analysis summary
                      </p>
                      <p className="mt-4 text-sm leading-7 text-slate-300">
                        {matchResult.summary}
                      </p>
                    </div>

                    <div className="w-full max-w-xs">
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Match score
                            </p>
                            <p className="mt-3 text-5xl font-semibold text-white">
                              {matchResult.score}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 transition-all duration-500"
                            style={{ width: `${Math.max(0, Math.min(100, matchResult.score))}%` }}
                          />
                        </div>

                        <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Strengths
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                      {matchResult.strengths.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Gaps
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                      {matchResult.gaps.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyAiState text="No match score generated for this job yet." />
            )}
          </>
        )}

        {activeTab === "cover" && (
          <>
            {coverLetter ? (
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Cover letter
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Tailored, copy-ready cover letter.
                    </p>
                  </div>

                  <button
                    onClick={copyCoverLetter}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      copied
                        ? "border border-green-500/20 bg-green-500/10 text-green-300"
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <pre className="whitespace-pre-wrap text-sm leading-8 text-slate-300">
                    {coverLetter}
                  </pre>
                </div>
              </div>
            ) : (
              <EmptyAiState text="No cover letter generated for this job yet." />
            )}
          </>
        )}

        {activeTab === "prep" && (
          <>
            {prepResult ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    30-second pitch
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {prepResult.pitch30s}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Questions
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                      {prepResult.questions.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Talking points
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                      {prepResult.talkingPoints.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Checklist
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                    {prepResult.checklist.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <EmptyAiState text="No interview prep generated for this job yet." />
            )}
          </>
        )}
      </div>
    </section>
  );
}

function EmptyAiState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/30 p-6 text-sm text-slate-400">
      {text}
    </div>
  );
}