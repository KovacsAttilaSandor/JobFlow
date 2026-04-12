"use client";

import { useRouter, useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function SkeletonText({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-full bg-white/[0.06] ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function SkeletonInput() {
  return <SkeletonBlock className="h-[50px] rounded-2xl" />;
}

function EditJobPageSkeleton() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="inline-flex items-center gap-2 text-sm text-slate-500">
          <span>←</span>
          <span>Back to job</span>
        </div>

        <section className="mt-6 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_26%)] px-8 py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <SkeletonText className="h-7 w-20" />
                <SkeletonText className="mt-4 h-10 w-full max-w-[340px] rounded-2xl" />
                <SkeletonText className="mt-3 h-4 w-full max-w-[520px]" />

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <SkeletonText className="h-7 w-32" />
                  <SkeletonText className="h-7 w-32" />
                </div>
              </div>

              <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/30 p-5">
                <SkeletonText className="h-5 w-28 rounded-xl" />
                <SkeletonText className="mt-2 h-3 w-52" />

                <div className="mt-4 flex flex-wrap gap-3">
                  <SkeletonBlock className="h-10 w-24 rounded-2xl" />
                  <SkeletonBlock className="h-10 w-24 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                  <SkeletonText className="h-6 w-28 rounded-xl" />
                  <SkeletonText className="mt-2 h-4 w-72" />

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <SkeletonText className="mb-2 h-4 w-16" />
                      <SkeletonInput />
                    </div>

                    <div className="sm:col-span-2">
                      <SkeletonText className="mb-2 h-4 w-12" />
                      <SkeletonInput />
                    </div>

                    <div>
                      <SkeletonText className="mb-2 h-4 w-16" />
                      <SkeletonInput />
                    </div>

                    <div>
                      <SkeletonText className="mb-2 h-4 w-14" />
                      <SkeletonInput />
                    </div>

                    <div className="sm:col-span-2">
                      <SkeletonText className="mb-2 h-4 w-12" />
                      <SkeletonInput />
                      <SkeletonText className="mt-2 h-3 w-40" />
                    </div>

                    <div className="sm:col-span-2">
                      <SkeletonText className="mb-2 h-4 w-20" />
                      <SkeletonInput />
                      <SkeletonText className="mt-2 h-3 w-36" />
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                  <SkeletonText className="h-6 w-32 rounded-xl" />
                  <SkeletonText className="mt-2 h-4 w-72" />

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <SkeletonText className="mb-2 h-4 w-16" />
                      <SkeletonInput />
                    </div>

                    <div>
                      <SkeletonText className="mb-2 h-4 w-16" />
                      <SkeletonInput />
                    </div>

                    <div>
                      <SkeletonText className="mb-2 h-4 w-16" />
                      <SkeletonInput />
                    </div>

                    <div className="sm:col-span-2">
                      <SkeletonText className="mb-2 h-4 w-20" />
                      <SkeletonInput />
                      <SkeletonText className="mt-2 h-3 w-64" />
                    </div>
                  </div>
                </section>
              </div>

              <section className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                <SkeletonText className="h-6 w-20 rounded-xl" />
                <SkeletonText className="mt-2 h-4 w-64" />
                <SkeletonBlock className="mt-5 min-h-[220px] rounded-2xl" />
              </section>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SkeletonBlock className="h-12 w-full rounded-2xl sm:w-28" />
                <SkeletonBlock className="h-12 w-full rounded-2xl sm:w-48" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Saved");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        setIsLoadingJob(true);
        setError("");

        const res = await fetch(`/api/jobs/${jobId}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load job.");
        }

        const data = await res.json();

        if (!data) {
          throw new Error("Job not found.");
        }

        const tagNames = Array.isArray(data.tags)
          ? (data.tags as Array<{ tag?: { name?: string } }>)
              .map((t) => t?.tag?.name)
              .filter(
                (name): name is string =>
                  typeof name === "string" && name.trim().length > 0
              )
          : [];

        setTitle(data.title ?? "");
        setCompany(data.company ?? "");
        setLocation(data.location ?? "");
        setSource(data.source ?? "");
        setTagsText(tagNames.join(", "));
        setSalaryMin(
          typeof data.salaryMin === "number" ? String(data.salaryMin) : ""
        );
        setSalaryMax(
          typeof data.salaryMax === "number" ? String(data.salaryMax) : ""
        );
        setCurrency(data.currency ?? "");
        setJobUrl(data.jobUrl ?? "");
        setDescription(data.description ?? "");
        setStatus(data.status ?? "Saved");
        setCreatedAt(data.createdAt ?? null);
        setUpdatedAt(data.updatedAt ?? null);
      } catch (err) {
        console.error(err);
        setError("Failed to load job data.");
      } finally {
        setIsLoadingJob(false);
      }
    }

    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          company,
          location,
          source,
          tags: tagsText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 12),
          salaryMin,
          salaryMax,
          currency,
          jobUrl,
          description,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save job.");
      }

      router.push(`/jobs/${jobId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingJob) {
    return <EditJobPageSkeleton />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <a
          href={`/jobs/${jobId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <span>←</span>
          <span>Back to job</span>
        </a>

        <section className="mt-6 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_26%)] px-8 py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Edit job
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Edit job
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Update the role details and save your changes.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {createdAt && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      Created:{" "}
                      {new Date(createdAt).toLocaleDateString("en-US")}
                    </span>
                  )}
                  {updatedAt && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      Updated:{" "}
                      {new Date(updatedAt).toLocaleDateString("en-US")}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/30 p-5">
                <p className="text-sm font-medium text-white">Quick actions</p>
                <p className="mt-1 text-xs text-slate-400">
                  After saving, you’ll return to the job detail page.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`/jobs/${jobId}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                  >
                    Cancel
                  </a>
                  <button
                    form="edit-job-form"
                    type="submit"
                    disabled={isSaving}
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <form id="edit-job-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                  <h2 className="text-lg font-semibold">Basics</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Shown in the list and job detail views.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm text-slate-300">
                        Title
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="e.g. Full-Stack Developer"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm text-slate-300">
                        Company
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="e.g. Acme Inc."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Location
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="e.g. London / Remote"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Source
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="e.g. LinkedIn"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm text-slate-300">
                        Tag-ek
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="e.g. remote, high priority, referral"
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Comma-separated. Max 12 tags.
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm text-slate-300">
                        Job link
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="https://..."
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                        inputMode="url"
                      />
                      {jobUrl?.trim() ? (
                        <a
                          href={jobUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-2 inline-block text-sm text-blue-300 underline underline-offset-4 transition hover:text-blue-200"
                        >
                          Open in new tab
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                  <h2 className="text-lg font-semibold">Status & salary</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Optional fields that help with decisions and filtering.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm text-slate-300">
                        Status
                      </label>
                      <select
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                        <option value="OnHold">OnHold</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Min salary
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="e.g. 80000"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        inputMode="numeric"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Max salary
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="e.g. 120000"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        inputMode="numeric"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm text-slate-300">
                        Currency
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="e.g. USD / EUR / GBP"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Tip: if left empty, the salary range shows without a
                        currency code.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Paste the posting, notes, to-dos, etc.
                </p>
                <textarea
                  className="mt-5 min-h-[220px] w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                  placeholder="Job description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href={`/jobs/${jobId}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}