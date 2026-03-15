"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload(e: any) {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/user/cv", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      setMessage("Hiba történt a feltöltés közben.");
      return;
    }

    setMessage("CV sikeresen feltöltve.");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-2 text-sm text-slate-400">
            Kezeld a profilodat és a CV-det, amit az AI elemzés használ.
          </p>
        </div>

        {/* CV CARD */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-xl font-semibold">CV feltöltése</h2>

              <p className="mt-2 text-sm text-slate-400 max-w-md leading-6">
                Töltsd fel a CV-det PDF formátumban. Az AI ezt fogja használni
                az állásokkal való összehasonlításhoz és a match score
                kiszámításához.
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              PDF only
            </div>
          </div>

          {/* UPLOAD AREA */}
          <div className="mt-8">

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-900/40 px-6 py-12 text-center transition hover:border-white/30 hover:bg-slate-900/60">

              <div className="text-4xl">📄</div>

              <p className="mt-4 text-sm text-slate-300">
                Kattints ide vagy húzd be a CV fájlt
              </p>

              <p className="mt-1 text-xs text-slate-500">
                PDF formátum támogatott
              </p>

              <input
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
                className="hidden"
              />
            </label>

            {/* LOADING */}
            {loading && (
              <div className="mt-6 text-sm text-slate-400">
                Feltöltés és feldolgozás...
              </div>
            )}

            {/* MESSAGE */}
            {message && (
              <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {message}
              </div>
            )}
          </div>
        </section>

        {/* INFO PANEL */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-medium text-white">
            Hogyan működik az AI elemzés
          </h3>

          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>• A rendszer kiolvassa a CV szövegét a PDF-ből</li>
            <li>• Az AI összehasonlítja az állás leírásával</li>
            <li>• Match score-t számol (0-100%)</li>
            <li>• Megmutatja az erősségeket és hiányzó skilleket</li>
          </ul>
        </section>

      </div>
    </main>
  );
}