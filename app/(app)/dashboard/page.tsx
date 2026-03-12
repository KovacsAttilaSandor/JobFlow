import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/dashboard";
import { redirect } from "next/navigation";

function getStatusClasses(status: string) {
  switch (status) {
    case "Saved":
      return "bg-yellow-500/15 text-yellow-300 border-yellow-400/20";
    case "Applied":
      return "bg-blue-500/15 text-blue-300 border-blue-400/20";
    case "Interviewing":
      return "bg-purple-500/15 text-purple-300 border-purple-400/20";
    case "Offer":
      return "bg-green-500/15 text-green-300 border-green-400/20";
    case "Rejected":
      return "bg-red-500/15 text-red-300 border-red-400/20";
    case "OnHold":
      return "bg-slate-500/15 text-slate-300 border-slate-400/20";
    default:
      return "bg-white/10 text-slate-300 border-white/10";
  }
}

function getEventClasses(type: string) {
  switch (type) {
    case "Interview":
      return "bg-purple-500/15 text-purple-300 border-purple-400/20";
    case "FollowUp":
      return "bg-blue-500/15 text-blue-300 border-blue-400/20";
    case "TaskDeadline":
      return "bg-orange-500/15 text-orange-300 border-orange-400/20";
    case "Other":
      return "bg-slate-500/15 text-slate-300 border-slate-400/20";
    default:
      return "bg-white/10 text-slate-300 border-white/10";
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("hu-HU", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!dbUser) redirect("/login");

  const data = await getDashboardData(dbUser.id);
  const displayName = dbUser.name || dbUser.email;

  return (



    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
              Dashboard
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Üdv újra, {displayName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Itt látod az álláskeresésed aktuális állapotát, a közelgő
              interjúkat és a legutóbbi aktivitásaidat.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/jobs"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Állások
            </a>

            <a
              href="/jobs/new"
              className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90"
            >
              Új állás
            </a>
          </div>
        </div>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <a href="/jobs" className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl transition hover:bg-white/10">
            <p className="text-sm text-slate-400">Összes jelentkezés</p>
            <p className="mt-3 text-3xl font-semibold">{data.stats.totalJobs}</p>
            <p className="mt-2 text-sm text-slate-500">Minden mentett állás</p>
          </a>

          <a href="/jobs" className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl transition hover:bg-white/10">
            <p className="text-sm text-slate-400">Aktív jelentkezések</p>
            <p className="mt-3 text-3xl font-semibold">{data.stats.activeJobs}</p>
            <p className="mt-2 text-sm text-slate-500">Applied + Interviewing</p>
          </a>

          <a href="/jobs" className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl transition hover:bg-white/10">
            <p className="text-sm text-slate-400">Interjúk</p>
            <p className="mt-3 text-3xl font-semibold">{data.stats.interviews}</p>
            <p className="mt-2 text-sm text-slate-500">Interviewing státuszban</p>
          </a>

          <a href="/jobs" className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl transition hover:bg-white/10">
            <p className="text-sm text-slate-400">Ajánlatok</p>
            <p className="mt-3 text-3xl font-semibold">{data.stats.offers}</p>
            <p className="mt-2 text-sm text-slate-500">Offer státuszban</p>
          </a>
        </section>

        {/* JOBS + EVENTS */}
        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* RECENT JOBS */}
          <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Legutóbbi jelentkezések</h2>
                <p className="text-sm text-slate-400">
                  Az utóbbi időben hozzáadott állások.
                </p>
              </div>

              <a
                href="/jobs"
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                Összes
              </a>
            </div>

            <div className="space-y-3">
              {data.recentJobs.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
                  Még nincs egyetlen állásod sem.
                </div>
              ) : (
                data.recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <a
                        href={`/jobs/${job.id}`}
                        className="text-base font-medium text-white hover:text-blue-300"
                      >
                        {job.title}
                      </a>

                      <a
                        href={`/jobs/${job.id}`}
                        className="mt-1 block text-sm text-slate-400 hover:text-slate-200"
                      >
                        {job.company}
                        {job.location ? ` • ${job.location}` : ""}
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(job.status)}`}
                      >
                        {job.status}
                      </span>

                      <span className="text-sm text-slate-500">
                        {formatDate(job.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* EVENTS */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <h2 className="text-xl font-semibold">Közelgő eventek</h2>

              <div className="mt-5 space-y-3">
                {data.upcomingEvents.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
                    Nincs közelgő event.
                  </div>
                ) : (
                  data.upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-slate-400">
                            {event.job?.company || "Event"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${getEventClasses(event.type)}`}
                        >
                          {event.type}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {formatDateTime(event.startTime)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </section>

        {/* ACTIVITY */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-semibold">Legutóbbi aktivitás</h2>

          <div className="mt-5 space-y-3">
            {data.activity.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
                Még nincs aktivitás.
              </div>
            ) : (
              data.activity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm"
                >
                  <span className="font-medium text-white">
                    {item.job.company}
                  </span>{" "}
                  – státusz módosítva:{" "}
                  <span className="text-slate-100">{item.toStatus}</span>{" "}
                  <span className="text-slate-500">
                    ({formatDateTime(item.changedAt)})
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </main>
  );
}