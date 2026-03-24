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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none fixed inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.10),transparent_38%)]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-10">
        <section
          className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--card)] shadow-2xl"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="border-b border-[var(--border)] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_26%)] px-8 py-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.10),transparent_28%)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--soft)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
                  Jobs
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Új állás hozzáadása 
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                  Add meg a pozíció legfontosabb adatait, vagy használd az AI
                  kitöltést, hogy gyorsabban rögzíthesd az álláshirdetést.
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <section
                className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Gyors felvitel AI-val</h2>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                      Illeszd be az álláshirdetés szövegét, és az AI megpróbálja
                      kitölteni a fontos mezőket: pozíció, cég, helyszín, bér,
                      forrás és leírás.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={autofillFromAi}
                    disabled={aiLoading}
                    className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-90 disabled:opacity-60"
                  >
                    {aiLoading ? "Kitöltés..." : "Mezők kitöltése AI-val"}
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">
                      Álláshirdetés szövege
                    </label>
                    <textarea
                      className="mt-2 min-h-[180px] w-full rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
                      value={aiJobText}
                      onChange={(e) => setAiJobText(e.target.value)}
                      placeholder="Illeszd be ide a teljes hirdetést vagy a legfontosabb részeit..."
                    />
                  </div>

                  <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-xs text-[var(--muted-foreground)]">
                    Tipp: ha a Job URL mezőt is kitöltöd, a rendszer eltárolja,
                    és az AI kontextusként is fel tudja használni.
                  </div>
                </div>

                {aiError && (
                  <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {aiError}
                  </div>
                )}
              </section>

              <section
                className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">Alapadatok</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Ezek az információk jelennek meg a lista-, board- és detail
                    nézetekben.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-sm text-[var(--muted-foreground)]">
                      Pozíció
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Pl. Senior Frontend fejlesztő"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">
                      Cég
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Pl. Acme Zrt."
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">
                      Helyszín
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Pl. Budapest / Hybrid / Remote"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">
                      Forrás
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="Pl. LinkedIn, Profession, Referral"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">
                      Job URL
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="Az álláshirdetés linkje"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-[var(--muted-foreground)]">
                      Tag-ek
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
                      value={tagsText}
                      onChange={(e) => setTagsText(e.target.value)}
                      placeholder="pl. remote, high priority, referral"
                    />
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                      Vesszővel elválasztva. Maximum 12 tag.
                    </p>
                  </div>
                </div>
              </section>

              <section
                className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">Fizetés és részletek</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Opcionális mezők, amelyek segítik az összehasonlítást és a
                    későbbi döntést.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">
                      Deviza
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="Pl. HUF, EUR"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">
                      Minimum fizetés
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      placeholder="Pl. 800000"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">
                      Maximum fizetés
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      placeholder="Pl. 1200000"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-sm text-[var(--muted-foreground)]">
                    Leírás / jegyzetek
                  </label>
                  <textarea
                    className="mt-2 min-h-[150px] w-full rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Illeszd be az álláshirdetés fontos részeit vagy a saját megjegyzéseidet."
                  />
                </div>
              </section>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--soft)] p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Mentésre kész
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Az új állás alapértelmezett státusza:{" "}
                    <span className="font-medium text-[var(--foreground)]">
                      Saved
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
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