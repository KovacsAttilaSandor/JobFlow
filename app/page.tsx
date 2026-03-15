import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.16),transparent_30%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">JobFlow</div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Bejelentkezés
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:opacity-90"
            >
              Regisztráció
            </Link>
          </div>
        </header>

        <section className="flex flex-1 items-center py-16">
          <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-slate-300 backdrop-blur">
                AI-powered job application tracker
              </div>

              <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">
                Kövesd az
                <span className="block text-blue-400">állásjelentkezéseidet</span>
                egy helyen
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                A JobFlow segít rendszerezni az állásokat, követni az interjúkat,
                kezelni a státuszokat, és AI segítségével elemezni a CV-det az
                egyes pozíciókhoz.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="rounded-2xl bg-white px-6 py-3 font-medium text-slate-950 transition hover:opacity-90"
                >
                  Kezdés
                </Link>

                <Link
                  href="/login"
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10"
                >
                  Már van fiókom
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                <div className="text-sm text-slate-400">Dashboard</div>
                <div className="mt-4 text-3xl font-semibold">24</div>
                <div className="mt-1 text-sm text-slate-500">
                  Összes jelentkezés
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                <div className="text-sm text-slate-400">Aktív</div>
                <div className="mt-4 text-3xl font-semibold">8</div>
                <div className="mt-1 text-sm text-slate-500">
                  Applied + Interviewing
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:col-span-2">
                <div className="text-sm text-slate-400">Mit tud a rendszer?</div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                    <div className="font-medium">Job tracking</div>
                    <div className="mt-2 text-sm text-slate-400">
                      Státuszok, board nézet, események.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                    <div className="font-medium">CV upload</div>
                    <div className="mt-2 text-sm text-slate-400">
                      PDF feltöltés és szövegkinyerés.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                    <div className="font-medium">AI analysis</div>
                    <div className="mt-2 text-sm text-slate-400">
                      Match score, summary, cover letter.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}