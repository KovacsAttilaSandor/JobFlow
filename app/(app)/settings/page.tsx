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
      setError("Nem sikerült betölteni a CV adatokat.");
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
        setError(data.error || "CV feltöltése sikertelen.");
        return;
      }

      setMessage("CV sikeresen feltöltve.");
      await loadCv();
      e.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setError("Hiba történt a CV feltöltése közben.");
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
        setError(data.error || "CV elemzése sikertelen.");
        return;
      }

      setMessage("AI CV elemzés sikeresen elkészült.");
      await loadCv();
    } catch (err) {
      console.error(err);
      setError("Hiba történt a CV AI elemzése közben.");
    } finally {
      setParsing(false);
    }
  }

  async function deleteCv() {
    const confirmed = window.confirm(
      "Biztosan törölni szeretnéd a feltöltött CV-t?"
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
        setError(data.error || "CV törlése sikertelen.");
        return;
      }

      setCv(null);
      setMessage("CV sikeresen törölve.");
    } catch (err) {
      console.error(err);
      setError("Hiba történt a CV törlése közben.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            Settings
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Profil és AI beállítások
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Itt kezelheted a feltöltött CV-det, megnézheted az AI által
            feldolgozott adatokat, és felkészítheted a profilodat a pontosabb
            állásajánlat-elemzéshez.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">CV kezelése</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Töltsd fel PDF formátumban a CV-det. A rendszer kiolvassa a
                    szöveget, majd az AI strukturált adatokat készít belőle.
                  </p>
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  PDF only
                </div>
              </div>

              <form onSubmit={uploadCv} className="mt-6 space-y-4">
                <input
                  type="file"
                  name="file"
                  accept="application/pdf"
                  required
                  className="block w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                  >
                    {uploading ? "Feltöltés..." : "CV feltöltése / cseréje"}
                  </button>

                  {cv && (
                    <>
                      <button
                        type="button"
                        onClick={parseCv}
                        disabled={parsing}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
                      >
                        {parsing ? "AI elemzés..." : "AI CV parse"}
                      </button>

                      <button
                        type="button"
                        onClick={deleteCv}
                        disabled={deleting}
                        className="rounded-2xl bg-red-500/90 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-60"
                      >
                        {deleting ? "Törlés..." : "CV törlése"}
                      </button>
                    </>
                  )}
                </div>
              </form>

              {loading ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
                  Betöltés...
                </div>
              ) : cv ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <MiniInfoCard
                    label="CV állapot"
                    value="Feltöltve"
                  />
                  <MiniInfoCard
                    label="Utolsó frissítés"
                    value={new Date(cv.updatedAt).toLocaleString("hu-HU")}
                  />
                  <MiniInfoCard
                    label="AI parse állapot"
                    value={parsedCv ? "Elkészült" : "Még nincs"}
                  />
                  <MiniInfoCard
                    label="AI parse frissítve"
                    value={
                      cv.parsedUpdatedAt
                        ? new Date(cv.parsedUpdatedAt).toLocaleString("hu-HU")
                        : "—"
                    }
                  />
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-4 text-sm text-slate-400">
                  Még nincs feltöltött CV.
                </div>
              )}

              {cv?.rawText && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    CV preview
                  </p>

                  <div className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {cv.rawText.slice(0, 3000)}
                    {cv.rawText.length > 3000 ? "..." : ""}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <h2 className="text-xl font-semibold">AI CV profil</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                A Gemini által struktúrált formában feldolgozott CV-adatok.
                Ezek a későbbi AI elemzéseket is pontosabbá teszik.
              </p>

              {!parsedCv ? (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-4 text-sm text-slate-400">
                  Még nincs AI parse eredmény. Tölts fel egy CV-t, majd kattints
                  az <span className="text-white">AI CV parse</span> gombra.
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Headline
                    </p>
                    <p className="mt-3 text-lg font-medium text-white">
                      {parsedCv.headline}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Summary
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
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
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl xl:sticky xl:top-24">
              <h2 className="text-xl font-semibold">AI funkciók</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Ezeket a funkciókat használja a projekt a CV és az állások
                intelligens feldolgozásához.
              </p>

              <div className="mt-5 space-y-3">
                <FeatureItem title="CV upload & parsing" />
                <FeatureItem title="AI CV profile extraction" />
                <FeatureItem title="AI job summary" />
                <FeatureItem title="AI match score" />
                <FeatureItem title="AI cover letter" />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function MiniInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm text-white">{value}</p>
    </div>
  );
}

function TagCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function FeatureItem({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
      {title}
    </div>
  );
}