import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/dashboard";
import { redirect } from "next/navigation";
import Link from "next/link";

function getStatusClasses(status: string) {
  switch (status) {
    case "Saved":
      return "status-pill status-saved";
    case "Applied":
      return "status-pill status-applied";
    case "Interviewing":
      return "status-pill status-interviewing";
    case "Offer":
      return "status-pill status-offer";
    case "Rejected":
      return "status-pill status-rejected";
    case "OnHold":
      return "status-pill status-onhold";
    default:
      return "status-pill bg-surface-3 text-muted border-border";
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
      return "bg-surface-3 text-muted border-border";
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.12),transparent_55%)] opacity-70" />
      <div className="relative mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}
        <section className="overflow-hidden rounded-[32px] border border-border bg-background/70 shadow-2xl backdrop-blur-2xl">
          <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_28%)] px-8 py-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Dashboard
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Welcome back, {displayName}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  A snapshot of your search: how many active applications you
                  have, which events are coming up, and how your statuses have
                  shifted recently.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/jobs"
                  className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition hover:bg-surface-2"
                >
                  Jobs
                </Link>

                <Link
                  href="/jobs/board"
                  className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition hover:bg-surface-2"
                >
                  Board view
                </Link>

                <Link
                  href="/jobs/new"
                  className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  New job
                </Link>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="px-8 pb-8 pt-6">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/jobs"
                className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl transition hover:border-white/20 hover:bg-white/10"
              >
                <p className="text-sm text-slate-400">Total applications</p>
                <p className="mt-3 text-3xl font-semibold">
                  {data.stats.totalJobs}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  All saved jobs
                </p>
              </Link>

              <Link
                href="/jobs"
                className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl transition hover:border-white/20 hover:bg-white/10"
              >
                <p className="text-sm text-slate-400">Active applications</p>
                <p className="mt-3 text-3xl font-semibold">
                  {data.stats.activeJobs}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Applied + Interviewing
                </p>
              </Link>

              <Link
                href="/jobs"
                className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl transition hover:border-white/20 hover:bg-white/10"
              >
                <p className="text-sm text-slate-400">Interviews</p>
                <p className="mt-3 text-3xl font-semibold">
                  {data.stats.interviews}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  In Interviewing status
                </p>
              </Link>

              <Link
                href="/jobs"
                className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl transition hover:border-white/20 hover:bg-white/10"
              >
                <p className="text-sm text-slate-400">Offers</p>
                <p className="mt-3 text-3xl font-semibold">
                  {data.stats.offers}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  In Offer status
                </p>
              </Link>
            </section>
          </div>
        </section>

        {/* JOBS + EVENTS */}
        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* RECENT JOBS */}
          <div className="xl:col-span-2 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Recent applications
                </h2>
                <p className="text-xs text-slate-400">
                  Jobs you added recently.
                </p>
              </div>

              <Link
                href="/jobs"
                className="text-xs font-medium text-slate-300 hover:text-white"
              >
                View all
              </Link>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-3">
                {data.recentJobs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
                    You don&apos;t have any jobs yet.{" "}
                    <Link
                      href="/jobs/new"
                      className="font-medium text-blue-300 underline-offset-4 hover:underline"
                    >
                      Add a new job
                    </Link>
                    .
                  </div>
                ) : (
                  data.recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-white/20 hover:bg-white/10 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-sm font-medium text-white hover:text-blue-300"
                        >
                          {job.title}
                        </Link>

                        <Link
                          href={`/jobs/${job.id}`}
                          className="mt-1 block text-xs text-slate-400 hover:text-slate-200"
                        >
                          {job.company}
                          {job.location ? ` • ${job.location}` : ""}
                        </Link>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-medium  ${getStatusClasses(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>

                        <span className="text-xs text-slate-500">
                          {formatDate(job.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* EVENTS */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold tracking-tight">
                    Upcoming events
                  </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Interviews, follow-ups, and deadlines in the coming days.
                </p>
                </div>

                <a
                  href="/events"
                  className="text-xs font-medium text-slate-300 hover:text-white"
                >
                  Open calendar
                </a>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-3">
                  {data.upcomingEvents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
                      No upcoming events.
                    </div>
                  ) : (
                    data.upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              {event.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {event.job?.company || "Event"}
                            </p>
                          </div>

                          <span
                            className={`rounded-full border px-3 py-1 text-[11px] ${getEventClasses(
                              event.type
                            )}`}
                          >
                            {event.type}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          {formatDateTime(event.startTime)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVITY */}
        <section className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-2xl">
          <h2 className="text-base font-semibold tracking-tight">
            Recent activity
          </h2>

          <div className="mt-4 space-y-3">
            {data.activity.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
                No activity yet.
              </div>
            ) : (
              data.activity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm"
                >
                  <span className="font-medium text-white">
                    {item.job.company}
                  </span>{" "}
                  – status updated to{" "}
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