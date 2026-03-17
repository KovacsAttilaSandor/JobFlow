"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function NewJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState("HUF");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiJobText, setAiJobText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  async function autofillFromAi() {
    if (aiJobText.trim().length < 50) {
      setAiError("Kérlek, illessz be legalább pár mondatnyi álláshirdetést.");
      return;
    }

    setAiLoading(true);
    setAiError("");

    try {
      const res = await fetch("/api/jobs/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobText: aiJobText,
          jobUrl: jobUrl?.trim() ? jobUrl.trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAiError(data?.error || "Nem sikerült az AI kitöltés.");
        return;
      }

      if (data.title) setTitle(String(data.title));
      if (data.company) setCompany(String(data.company));
      if (data.location) setLocation(String(data.location));
      if (data.source) setSource(String(data.source));
      if (typeof data.salaryMin === "number") setSalaryMin(String(data.salaryMin));
      if (typeof data.salaryMax === "number") setSalaryMax(String(data.salaryMax));
      if (data.currency) setCurrency(String(data.currency));
      if (data.description) setDescription(String(data.description));
    } catch (err) {
      console.error(err);
      setAiError("Hiba történt az AI kitöltés közben.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        company,
        location,
        jobUrl,
        description,
        source: source || null,
        tags,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        currency: currency || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Nem sikerült létrehozni az állást.");
      return;
    }

    router.push("/jobs");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_25%)] px-8 py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Jobs
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Új állás hozzáadása
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Add meg a pozíció legfontosabb adatait, hogy könnyen
                  nyomon követhesd a jelentkezésedet.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/jobs"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Lista nézet
                </Link>

                <Link
                  href="/jobs/board"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Board nézet
                </Link>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              <section className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Gyors felvitel (AI)</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Illeszd be az álláshirdetés szövegét, és az AI megpróbálja
                      kitölteni a mezőket (pozíció, cég, bér, stb.).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={autofillFromAi}
                    disabled={aiLoading}
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                  >
                    {aiLoading ? "Kitöltés..." : "Mezők kitöltése AI-val"}
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-300">
                      Álláshirdetés szövege
                    </label>
                    <textarea
                      className="mt-2 min-h-[160px] w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      value={aiJobText}
                      onChange={(e) => setAiJobText(e.target.value)}
                      placeholder="Illeszd be ide a teljes hirdetést vagy a fontos részeket..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-500">
                      Tipp: ha megadod a Job URL-t is, a rendszer eltárolja, és
                      az AI kontextusnak is használhatja.
                    </p>
                  </div>
                </div>

                {aiError && (
                  <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {aiError}
                  </div>
                )}
              </section>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-300">Pozíció</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Pl. Senior Frontend fejlesztő"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Cég</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Pl. Acme Zrt."
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Helyszín</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Pl. Budapest / Remote"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Forrás</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Pl. LinkedIn, Profession, Referral"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Tag-ek</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder="pl. remote, high priority, referral"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Vesszővel elválasztva. Max 12 tag.
                  </p>
                </div>

                <div>
                  <label className="text-sm text-slate-300">Job URL</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="Az álláshirdetés linkje"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Deviza</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="Pl. HUF, EUR"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">
                    Minimum fizetés (bruttó / hónap)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="Pl. 800000"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">
                    Maximum fizetés (bruttó / hónap)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="Pl. 1200000"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300">Leírás / jegyzetek</label>
                <textarea
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Illeszd be az álláshirdetés fontos részeit vagy a saját megjegyzéseidet."
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  Az új állás alapértelmezett státusza:{" "}
                  <span className="font-medium text-slate-200">Saved</span>
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-medium text-slate-950 shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Mentés..." : "Állás mentése"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
