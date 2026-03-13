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
  const [jobUrl, setJobUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Saved");

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

        setTitle(data.title ?? "");
        setCompany(data.company ?? "");
        setLocation(data.location ?? "");
        setJobUrl(data.jobUrl ?? "");
        setDescription(data.description ?? "");
        setStatus(data.status ?? "Saved");
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
      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="mb-8">
          <a
            href={`/jobs/${jobId}`}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Vissza az álláshoz
          </a>
          <h1 className="mt-4 text-3xl font-semibold">Állás szerkesztése</h1>
          <p className="mt-2 text-sm text-slate-400">
            Módosítsd a pozíció adatait és mentsd el a változtatásokat.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div>
            <label className="mb-2 block text-sm text-slate-300">Pozíció</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none"
              placeholder="Pozíció"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Cég</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none"
              placeholder="Cég"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Helyszín</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none"
              placeholder="Helyszín"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Job URL</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none"
              placeholder="https://..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Leírás</label>
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none"
              placeholder="Állás leírása"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Státusz</label>
            <select
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none"
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

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-white px-4 py-3 font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
          >
            {isSaving ? "Mentés..." : "Módosítások mentése"}
          </button>
        </form>
      </div>
    </main>
  );
}