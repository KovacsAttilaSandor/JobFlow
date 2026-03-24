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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none fixed inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.10),transparent_38%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <section
          className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--card)] shadow-2xl"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="border-b border-[var(--border)] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_26%)] px-8 py-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.10),transparent_28%)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--soft)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
                  Settings
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Profil és AI beállítások
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                  Itt kezelheted a feltöltött CV-det, megnézheted az AI által
                  feldolgozott adatokat, és felkészítheted a profilodat a
                  pontosabb állásajánlat-elemzéshez.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <TopStat
                  label="CV"
                  value={cv ? "Feltöltve" : "Nincs"}
                />
                <TopStat
                  label="AI parse"
                  value={parsedCv ? "Kész" : "Nincs"}
                />
                <TopStat
                  label="Skills"
                  value={String(parsedCv?.skills?.length ?? 0)}
                />
                <TopStat
                  label="Tech"
                  value={String(parsedCv?.technologies?.length ?? 0)}
                />
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-8">
                <section
                  className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">CV kezelése</h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                        Töltsd fel PDF formátumban a CV-det. A rendszer kiolvassa
                        a szöveget, majd az AI strukturált adatokat készít belőle.
                      </p>
                    </div>

                    <div className="rounded-full border border-[var(--border)] bg-[var(--soft)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
                      PDF only
                    </div>
                  </div>

                  <form onSubmit={uploadCv} className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--soft)] p-4">
                      <input
                        type="file"
                        name="file"
                        accept="application/pdf"
                        required
                        className="block w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--primary-foreground)]"
                      />
                      <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                        A legjobb eredményhez használj jól olvasható, szöveges PDF-et.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={uploading}
                        className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-90 disabled:opacity-60"
                      >
                        {uploading ? "Feltöltés..." : "CV feltöltése / cseréje"}
                      </button>

                      {cv && (
                        <>
                          <button
                            type="button"
                            onClick={parseCv}
                            disabled={parsing}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--card-hover)] disabled:opacity-60"
                          >
                            {parsing ? "AI elemzés..." : "AI CV parse"}
                          </button>

                          <button
                            type="button"
                            onClick={deleteCv}
                            disabled={deleting}
                            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-500/15 dark:text-red-300 disabled:opacity-60"
                          >
                            {deleting ? "Törlés..." : "CV törlése"}
                          </button>
                        </>
                      )}
                    </div>
                  </form>

                  {loading ? (
                    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-4 text-sm text-[var(--muted-foreground)]">
                      Betöltés...
                    </div>
                  ) : cv ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <MiniInfoCard label="CV állapot" value="Feltöltve" />
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
                    <EmptyState text="Még nincs feltöltött CV." className="mt-6" />
                  )}

                  {cv?.rawText && (
                    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]/85">
                          CV preview
                        </p>
                        <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[11px] text-[var(--muted-foreground)]">
                          {cv.rawText.length.toLocaleString("hu-HU")} karakter
                        </span>
                      </div>

                      <div className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm leading-7 text-[var(--soft-foreground)]">
                        {cv.rawText.slice(0, 3000)}
                        {cv.rawText.length > 3000 ? "..." : ""}
                      </div>
                    </div>
                  )}
                </section>

                <section
                  className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">AI CV profil</h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                        A Gemini által struktúrált formában feldolgozott CV-adatok.
                        Ezek a későbbi AI elemzéseket is pontosabbá teszik.
                      </p>
                    </div>

                    {parsedCv && (
                      <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
                        AI profil készen áll
                      </div>
                    )}
                  </div>

                  {!parsedCv ? (
                    <EmptyState
                      text="Még nincs AI parse eredmény. Tölts fel egy CV-t, majd kattints az AI CV parse gombra."
                      className="mt-6"
                    />
                  ) : (
                    <div className="mt-6 space-y-6">
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]/85">
                          Headline
                        </p>
                        <p className="mt-3 text-lg font-medium text-[var(--foreground)]">
                          {parsedCv.headline}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]/85">
                          Summary
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[var(--soft-foreground)]">
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

                <section
                  className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Feature inventory</h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                        Gyors áttekintés arról, mi van már készen és min lehet még
                        bővíteni.
                      </p>
                    </div>

                    <div className="rounded-full border border-[var(--border)] bg-[var(--soft)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
                      Product overview
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FeatureCard
                      title="Auth (Credentials)"
                      status="Kész"
                      items={["Regisztráció", "Bejelentkezés", "JWT session"]}
                    />
                    <FeatureCard
                      title="Jobs (lista + board)"
                      status="Kész"
                      items={[
                        "Lista nézet szűréssel/rendezéssel",
                        "Kanban board drag&drop státusz",
                        "Új / szerkesztés / részletek",
                      ]}
                    />
                    <FeatureCard
                      title="Dashboard"
                      status="Kész"
                      items={[
                        "Státusz statok",
                        "Legutóbbi állások",
                        "Közelgő eventek (megjelenítés)",
                        "Aktivitás (status history)",
                      ]}
                    />
                    <FeatureCard
                      title="AI (Gemini)"
                      status="Kész"
                      items={[
                        "CV parse",
                        "Job summary",
                        "Match score",
                        "Cover letter",
                      ]}
                    />
                    <FeatureCard
                      title="Eventek (CRUD + naptár)"
                      status="Fejlesztés alatt"
                      items={[
                        "Event létrehozás / szerkesztés / törlés",
                        "Job detail integráció",
                        "Naptár export (ICS)",
                        "Külön /events nézet",
                      ]}
                    />
                    <FeatureCard
                      title="Extra workflow"
                      status="Tervezve"
                      items={[
                        "Job parsing paste/URL-ből",
                        "Tag-ek + export",
                        "Interview prep",
                      ]}
                    />
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section
                  className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 xl:sticky xl:top-24"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <h2 className="text-xl font-semibold">AI funkciók</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
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

                  <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]/85">
                      Profil állapot
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[var(--muted-foreground)]">CV feltöltve</span>
                        <span className="font-medium text-[var(--foreground)]">
                          {cv ? "Igen" : "Nem"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[var(--muted-foreground)]">AI parse</span>
                        <span className="font-medium text-[var(--foreground)]">
                          {parsedCv ? "Kész" : "Nincs"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[var(--muted-foreground)]">Nyelvek</span>
                        <span className="font-medium text-[var(--foreground)]">
                          {parsedCv?.languages?.length ?? 0}
                        </span>
                      </div>
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

function TopStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]/80">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function MiniInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]/85">
        {label}
      </p>
      <p className="mt-2 text-sm text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function TagCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]/85">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">Nincs adat.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs text-[var(--soft-foreground)]"
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
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]/85">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">Nincs adat.</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm text-[var(--soft-foreground)]">
          {items.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FeatureItem({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--soft-foreground)]">
      {title}
    </div>
  );
}

function FeatureCard({
  title,
  status,
  items,
}: {
  title: string;
  status: "Kész" | "Fejlesztés alatt" | "Tervezve";
  items: string[];
}) {
  const badgeClass =
    status === "Kész"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : status === "Fejlesztés alatt"
        ? "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300"
        : "border-[var(--border)] bg-[var(--soft)] text-[var(--muted-foreground)]";

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--soft)] p-5 transition hover:bg-[var(--card-hover)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-[var(--foreground)]">{title}</p>
          <p
            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs ${badgeClass}`}
          >
            {status}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-[var(--soft-foreground)]">
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
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
      className={`rounded-2xl border border-dashed border-[var(--border)] bg-[var(--soft)] p-4 text-sm text-[var(--muted-foreground)] ${className}`}
    >
      {text}
    </div>
  );
}