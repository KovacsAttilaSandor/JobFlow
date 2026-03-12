export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-white">
      
      {/* háttér glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.2),transparent_35%)]" />

      <div className="relative mx-auto max-w-4xl text-center">

        <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-slate-300 backdrop-blur">
          JobFlow
        </div>

        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Kövesd az állásjelentkezéseid
          <span className="block text-blue-400">egy helyen</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          A JobFlow egy AI-powered job tracker, ahol kezelheted a
          jelentkezéseidet, interjúidat és követheted az álláskeresési
          folyamatodat egy modern dashboardban.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <a
            href="/login"
            className="rounded-2xl bg-white px-6 py-3 font-medium text-slate-900 transition hover:opacity-90"
          >
            Bejelentkezés
          </a>

          <a
            href="/register"
            className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 font-medium backdrop-blur transition hover:bg-white/10"
          >
            Regisztráció
          </a>
        </div>

        {/* feature preview */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="font-semibold">📊 Jelentkezések követése</h3>
            <p className="mt-2 text-sm text-slate-400">
              Tartsd számon minden állásjelentkezésed egy dashboardon.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="font-semibold">🤖 AI elemzés</h3>
            <p className="mt-2 text-sm text-slate-400">
              AI segít elemezni a job description-t és a CV-det.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="font-semibold">📅 Interjú scheduler</h3>
            <p className="mt-2 text-sm text-slate-400">
              Kövesd az interjúkat és a follow-up dátumokat.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}