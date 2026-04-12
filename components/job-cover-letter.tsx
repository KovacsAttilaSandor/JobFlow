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

export default function JobCoverLetter({ jobId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const { lang, setLang } = useAiOutputLanguage();

  async function handleGenerate() {
    try {
      setLoading(true);
      setError("");

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
    } catch (err) {
      console.error(err);
      setError("Something went wrong while generating.");
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">AI Cover Letter</h2>
          <p className="mt-1 text-sm text-slate-400">
            Generate a tailored cover letter for this role.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <AiOutputLanguageSelect
            id={`ai-lang-letter-${jobId}`}
            lang={lang}
            onChange={setLang}
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
          >
            {loading
              ? "Generating..."
              : coverLetter.trim()
                ? "Regenerate"
                : "Generate"}
          </button>

          {coverLetter ? (
            <button
              onClick={handleCopy}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Copy
            </button>
          ) : null}
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