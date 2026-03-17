"use client";

import { useRouter, useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

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
          throw new Error("Nem sikerült betölteni az állást.");
        }

        const data = await res.json();

        if (!data) {
          throw new Error("Az állás nem található.");
        }

        const tagNames = Array.isArray(data.tags)
          ? (data.tags as Array<{ tag?: { name?: string } }>)
              .map((t) => t?.tag?.name)
              .filter((name): name is string => typeof name === "string" && name.trim().length > 0)
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
        setError("Nem sikerült betölteni az állás adatait.");
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
        throw new Error("Nem sikerült menteni az állást.");
      }

      router.push(`/jobs/${jobId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Nem sikerült menteni a módosításokat.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingJob) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-xl px-6 py-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Állás adatainak betöltése...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <a
          href={`/jobs/${jobId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <span>←</span>
          <span>Vissza az álláshoz</span>
        </a>

        <section className="mt-6 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_26%)] px-8 py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Edit job
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Állás szerkesztése
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Módosítsd a pozíció adatait és mentsd el a változtatásokat.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {createdAt && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      Létrehozva:{" "}
                      {new Date(createdAt).toLocaleDateString("hu-HU")}
                    </span>
                  )}
                  {updatedAt && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      Frissítve:{" "}
                      {new Date(updatedAt).toLocaleDateString("hu-HU")}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/30 p-5">
                <p className="text-sm font-medium text-white">Gyors műveletek</p>
                <p className="mt-1 text-xs text-slate-400">
                  Mentés után visszairányít a részletező oldalra.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`/jobs/${jobId}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                  >
                    Mégse
                  </a>
                  <button
                    form="edit-job-form"
                    type="submit"
                    disabled={isSaving}
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                  >
                    {isSaving ? "Mentés..." : "Mentés"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <form
              id="edit-job-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                  <h2 className="text-lg font-semibold">Alapadatok</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Ezek jelennek meg a listában és a részletező oldalon is.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm text-slate-300">
                        Pozíció
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="pl. Full-Stack Developer"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm text-slate-300">
                        Cég
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="pl. Acme Kft."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Helyszín
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="pl. Budapest / Remote"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Forrás
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="pl. LinkedIn"
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
                        placeholder="pl. remote, high priority, referral"
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Vesszővel elválasztva. Max 12 tag.
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm text-slate-300">
                        Állás link
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
                          Megnyitás új lapon
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                  <h2 className="text-lg font-semibold">Státusz & bér</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Opcionális mezők, de sokat segítenek a döntésben és
                    szűrésben.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm text-slate-300">
                        Státusz
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
                        Min. bér
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="pl. 800000"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        inputMode="numeric"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Max. bér
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="pl. 1200000"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        inputMode="numeric"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm text-slate-300">
                        Pénznem
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                        placeholder="pl. HUF / EUR / USD"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Tipp: ha üresen hagyod, a bérsáv a pénznem nélkül fog
                        megjelenni.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                <h2 className="text-lg font-semibold">Leírás</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Ide jöhet a hirdetés szövege, jegyzetek, to-do, stb.
                </p>
                <textarea
                  className="mt-5 min-h-[220px] w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-white/20"
                  placeholder="Állás leírása"
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
                  Mégse
                </a>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                >
                  {isSaving ? "Mentés..." : "Módosítások mentése"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}