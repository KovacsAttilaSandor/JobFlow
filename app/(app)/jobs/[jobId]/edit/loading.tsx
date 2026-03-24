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
  
  export default function Loading() {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <span>←</span>
            <span>Vissza az álláshoz</span>
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