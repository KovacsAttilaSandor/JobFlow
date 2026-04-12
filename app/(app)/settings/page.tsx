"use client";

import { useEffect, useMemo, useState } from "react";

type ParsedCv = {
  headline: string;
  summary: string;
  skills: string[];
  technologies: string[];
  experience: string[];
  education: string[];
  languages: string[];
  highlights: string[];
};

type CvResponse = {
  id: string;
  rawText: string;
  parsedData: string | null;
  parsedUpdatedAt: string | null;
  updatedAt: string;
} | null;

export default function SettingsPage() {
  const [cv, setCv] = useState<CvResponse>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCv() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/user/cv", {
        cache: "no-store",
      });

      const data = await res.json();
      setCv(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load resume data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCv();
  }, []);

  const parsedCv: ParsedCv | null = useMemo(() => {
    if (!cv?.parsedData) return null;

    try {
      return JSON.parse(cv.parsedData);
    } catch (error) {
      console.error("PARSED_CV_JSON_ERROR", error);
      return null;
    }
  }, [cv]);

  async function uploadCv(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);

    try {
      setUploading(true);

      const res = await fetch("/api/user/cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "resume upload failed.");
        return;
      }

      setMessage("resume uploaded successfully.");
      await loadCv();
      e.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while uploading your resume.");
    } finally {
      setUploading(false);
    }
  }

  async function parseCv() {
    try {
      setParsing(true);
      setError("");
      setMessage("");

      const res = await fetch("/api/user/cv/parse", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "resume parsing failed.");
        return;
      }

      setMessage("AI resume parsing completed.");
      await loadCv();
    } catch (err) {
      console.error(err);
      setError("Something went wrong during AI resume parsing.");
    } finally {
      setParsing(false);
    }
  }

  async function deleteCv() {
    const confirmed = window.confirm(
      "Delete your uploaded resume?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      setMessage("");

      const res = await fetch("/api/user/cv", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete resume.");
        return;
      }

      setCv(null);
      setMessage("resume deleted.");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while deleting your resume.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_-20%,rgba(59,130,246,0.12),transparent),radial-gradient(ellipse_100%_60%_at_100%_100%,rgba(168,85,247,0.08),transparent)] dark:bg-[radial-gradient(ellipse_120%_80%_at_0%_-20%,rgba(96,165,250,0.16),transparent),radial-gradient(ellipse_100%_60%_at_100%_100%,rgba(129,140,248,0.12),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[32px] border border-border bg-surface shadow-2xl backdrop-blur-xl ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_25%)] px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted backdrop-blur-sm">
                  <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)] dark:shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                  Settings
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Profile & AI settings
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-muted-2 sm:text-[15px]">
                  Manage your uploaded resume, review AI-extracted data, and tune
                  your profile for more accurate job analysis.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:shrink-0">
                <TopStat
                  label="resume"
                  value={cv ? "Uploaded" : "None"}
                  tone={cv ? "ok" : "muted"}
                />
                <TopStat
                  label="AI parse"
                  value={parsedCv ? "Ready" : "None"}
                  tone={parsedCv ? "ok" : "muted"}
                />
                <TopStat
                  label="Skills"
                  value={String(parsedCv?.skills?.length ?? 0)}
                  tone="neutral"
                />
                <TopStat
                  label="Tech"
                  value={String(parsedCv?.technologies?.length ?? 0)}
                  tone="neutral"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200"
              >
                <span className="mt-0.5 text-red-600 dark:text-red-400" aria-hidden>
                  !
                </span>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200"
              >
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-8">
                <SettingsSection
                  eyebrow="Files"
                  title="resume management"
                  description="Upload a PDF resume. We extract the text, then AI builds structured profile data."
                  badge="PDF only"
                >
                  <form onSubmit={uploadCv} className="mt-6 space-y-5">
                    <div className="group relative overflow-hidden rounded-[22px] border border-dashed border-border bg-gradient-to-b from-surface to-surface-2/50 p-6 transition hover:border-primary/30 hover:from-surface hover:to-surface-2">
                      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/10" />
                      <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                          <PdfIcon className="size-6 text-muted-2" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            Drop a PDF or choose a file
                          </p>
                          <p className="mt-1 text-xs text-muted-2">
                            Text-based PDFs parse best. Max size depends on your
                            server limits.
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        name="file"
                        accept="application/pdf"
                        required
                        className="relative mt-5 block w-full cursor-pointer rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-primary-foreground file:transition file:hover:opacity-90"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={uploading}
                        className="rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-90 disabled:opacity-60"
                      >
                        {uploading ? "Uploading..." : "Upload / replace resume"}
                      </button>

                      {cv && (
                        <>
                          <button
                            type="button"
                            onClick={parseCv}
                            disabled={parsing}
                            className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition hover:bg-surface-2 disabled:opacity-60"
                          >
                            {parsing ? "Parsing..." : "AI resume parse"}
                          </button>

                          <button
                            type="button"
                            onClick={deleteCv}
                            disabled={deleting}
                            className="rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-800 transition hover:bg-red-500/15 dark:text-red-200 disabled:opacity-60"
                          >
                            {deleting ? "Deleting..." : "Delete resume"}
                          </button>
                        </>
                      )}
                    </div>
                  </form>

                  {loading ? (
                    <div className="mt-6 space-y-3 rounded-2xl border border-border bg-surface p-5">
                      <div className="h-3 w-1/3 animate-pulse rounded-full bg-surface-2" />
                      <div className="h-3 w-2/3 animate-pulse rounded-full bg-surface-2" />
                      <div className="h-3 w-1/2 animate-pulse rounded-full bg-surface-2" />
                      <p className="pt-2 text-xs text-muted-2">
                        Loading resume data…
                      </p>
                    </div>
                  ) : cv ? (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <MiniInfoCard label="resume status" value="Uploaded" />
                      <MiniInfoCard
                        label="Last updated"
                        value={new Date(cv.updatedAt).toLocaleString("en-US")}
                      />
                      <MiniInfoCard
                        label="AI parse status"
                        value={parsedCv ? "Complete" : "Not yet"}
                      />
                      <MiniInfoCard
                        label="AI parse updated"
                        value={
                          cv.parsedUpdatedAt
                            ? new Date(cv.parsedUpdatedAt).toLocaleString("en-US")
                            : "—"
                        }
                      />
                    </div>
                  ) : (
                    <EmptyState
                      text="No resume uploaded yet."
                      className="mt-6"
                    />
                  )}

                  {cv?.rawText && (
                    <div className="mt-6 overflow-hidden rounded-[22px] border border-border bg-surface shadow-inner">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2/40 px-5 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">
                          CV preview
                        </p>
                        <span className="rounded-full border border-border bg-background px-3 py-1 font-mono text-[11px] text-muted">
                          {cv.rawText.length.toLocaleString("en-US")} chars
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto whitespace-pre-wrap p-5 text-sm leading-7 text-muted">
                        {cv.rawText.slice(0, 3000)}
                        {cv.rawText.length > 3000 ? "…" : ""}
                      </div>
                    </div>
                  )}
                </SettingsSection>

                <SettingsSection
                  eyebrow="Structured data"
                  title="AI resume profile"
                  description="Structured resume data produced by Gemini. This makes later AI analyses more accurate."
                  badge={parsedCv ? "AI profile ready" : undefined}
                  badgeTone="success"
                >
                  {!parsedCv ? (
                    <EmptyState
                      text="No AI parse yet. Upload a resume, then click AI resume parse."
                      className="mt-6"
                    />
                  ) : (
                    <div className="mt-6 space-y-5">
                      <div className="rounded-[22px] border border-border bg-surface p-5 sm:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">
                          Headline
                        </p>
                        <p className="mt-3 text-lg font-semibold leading-snug text-foreground">
                          {parsedCv.headline}
                        </p>
                      </div>

                      <div className="rounded-[22px] border border-border bg-surface p-5 sm:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">
                          Summary
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted">
                          {parsedCv.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <TagCard title="Skills" items={parsedCv.skills} />
                        <TagCard title="Technologies" items={parsedCv.technologies} />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <ListCard title="Experience" items={parsedCv.experience} />
                        <ListCard title="Education" items={parsedCv.education} />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <TagCard title="Languages" items={parsedCv.languages} />
                        <ListCard title="Highlights" items={parsedCv.highlights} />
                      </div>
                    </div>
                  )}
                </SettingsSection>
              </div>

              <aside className="space-y-6">
                <section className="sticky top-6 overflow-hidden rounded-[28px] border border-border bg-gradient-to-b from-surface to-background/80 p-6 shadow-lg ring-1 ring-black/[0.04] backdrop-blur-sm dark:from-surface dark:to-surface-2/30 dark:ring-white/[0.06] xl:top-24">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <SparklesIcon className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">
                        AI features
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-muted-2">
                        Capabilities that power intelligent processing of your
                        resume and jobs.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <FeatureItem title="CV upload & parsing" />
                    <FeatureItem title="AI CV profile extraction" />
                    <FeatureItem title="AI job summary" />
                    <FeatureItem title="AI match score" />
                    <FeatureItem title="AI cover letter" />
                  </div>

                  <div className="mt-6 rounded-[20px] border border-border bg-surface-2/50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">
                      Profile status
                    </p>
                    <div className="mt-4 space-y-3 text-sm">
                      <StatusRow
                        label="resume uploaded"
                        value={cv ? "Yes" : "No"}
                        ok={Boolean(cv)}
                      />
                      <StatusRow
                        label="AI parse"
                        value={parsedCv ? "Ready" : "None"}
                        ok={Boolean(parsedCv)}
                      />
                      <StatusRow
                        label="Languages"
                        value={String(parsedCv?.languages?.length ?? 0)}
                      />
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6M9 13h6M9 17h6M9 9h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function SettingsSection({
  eyebrow,
  title,
  description,
  badge,
  badgeTone = "default",
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
  badgeTone?: "default" | "success";
  children: React.ReactNode;
}) {
  const badgeClass =
    badgeTone === "success"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
      : "border-border bg-surface text-muted";

  return (
    <section className="overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-surface/90 via-background/30 to-surface-2/40 p-6 shadow-lg ring-1 ring-black/[0.04] dark:from-surface dark:via-surface-2/20 dark:to-surface dark:ring-white/[0.06] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-2">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-2">{description}</p>
        </div>
        {badge ? (
          <span
            className={`shrink-0 self-start rounded-full border px-3 py-1 text-xs font-medium ${badgeClass}`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function StatusRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5">
      <span className="text-muted-2">{label}</span>
      <span className="flex items-center gap-2 font-medium text-foreground">
        {ok !== undefined ? (
          <span
            className={`size-2 rounded-full ${ok ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-muted-2"}`}
          />
        ) : null}
        {value}
      </span>
    </div>
  );
}

function TopStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "muted" | "neutral";
}) {
  const ring =
    tone === "ok"
      ? "ring-emerald-500/20"
      : tone === "muted"
        ? "ring-border"
        : "ring-primary/15";

  return (
    <div
      className={`rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-sm ring-1 backdrop-blur-sm ${ring}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function MiniInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2/40 p-4 transition hover:border-primary/20">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function TagCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-2">No data.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted shadow-sm"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-2">No data.</p>
      ) : (
        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted">
          {items.map((item, index) => (
            <li key={index} className="flex gap-2.5">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-primary/50" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FeatureItem({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground transition hover:border-primary/25 hover:bg-surface">
      <CheckIcon className="size-4 shrink-0 text-primary" />
      <span>{title}</span>
    </div>
  );
}

function FeatureCard({
  title,
  status,
  items,
}: {
  title: string;
  status: "Done" | "In progress" | "Planned";
  items: string[];
}) {
  const badgeClass =
    status === "Done"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
      : status === "In progress"
        ? "border-sky-500/25 bg-sky-500/10 text-sky-900 dark:text-sky-200"
        : "border-border bg-surface text-muted-2";

  return (
    <div className="group rounded-[22px] border border-border bg-surface p-5 transition hover:border-primary/20 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p
            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClass}`}
          >
            {status}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-muted">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2.5">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-primary/40 transition group-hover:bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[20px] border border-dashed border-border bg-surface-2/30 px-5 py-6 text-sm text-muted-2 ${className}`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-lg text-muted-2">
        ∅
      </span>
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}
