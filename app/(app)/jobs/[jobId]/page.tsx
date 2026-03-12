import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

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

type PageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function JobDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  const { jobId } = await params;

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId: user.id,
    },
    include: {
      events: {
        orderBy: {
          startTime: "asc",
        },
      },
      statusHistory: {
        orderBy: {
          changedAt: "desc",
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <a
              href="/jobs"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              ← Vissza az állásokhoz
            </a>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {job.title}
            </h1>

            <p className="mt-2 text-slate-400">
              {job.company}
              {job.location ? ` • ${job.location}` : ""}
            </p>

            <div className="mt-4">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                  job.status
                )}`}
              >
                {job.status}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={`/jobs/${job.id}/edit`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Szerkesztés
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <h2 className="text-xl font-semibold">Állás részletei</h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Pozíció
                  </p>
                  <p className="mt-2 text-sm text-white">{job.title}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Cég
                  </p>
                  <p className="mt-2 text-sm text-white">{job.company}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Helyszín
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {job.location || "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Forrás
                  </p>
                  <p className="mt-2 text-sm text-white">{job.source || "—"}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Leírás
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {job.description || "Még nincs leírás megadva ehhez az álláshoz."}
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Állás link
                </p>
                {job.jobUrl ? (
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block break-all text-sm text-blue-300 underline underline-offset-4"
                  >
                    {job.jobUrl}
                  </a>
                ) : (
                  <p className="mt-3 text-sm text-slate-300">Nincs megadva link.</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <h2 className="text-xl font-semibold">Státusz előzmények</h2>

              <div className="mt-5 space-y-3">
                {job.statusHistory.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
                    Még nincs státusz előzmény.
                  </div>
                ) : (
                  job.statusHistory.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm text-white">
                            <span className="text-slate-400">Új státusz:</span>{" "}
                            {item.toStatus}
                          </p>

                          {item.fromStatus && (
                            <p className="mt-1 text-sm text-slate-400">
                              Előző státusz: {item.fromStatus}
                            </p>
                          )}

                          {item.note && (
                            <p className="mt-2 text-sm text-slate-300">
                              Megjegyzés: {item.note}
                            </p>
                          )}
                        </div>

                        <p className="text-sm text-slate-500">
                          {new Date(item.changedAt).toLocaleString("hu-HU")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <h2 className="text-xl font-semibold">Összegzés</h2>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Létrehozva
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {new Date(job.createdAt).toLocaleString("hu-HU")}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Utoljára frissítve
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {new Date(job.updatedAt).toLocaleString("hu-HU")}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Aktuális státusz
                  </p>
                  <p className="mt-2 text-sm text-white">{job.status}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Kapcsolódó eventek</h2>
                <a
                  href="/events"
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  Összes
                </a>
              </div>

              <div className="mt-5 space-y-3">
                {job.events.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
                    Nincs még ehhez az álláshoz kapcsolódó event.
                  </div>
                ) : (
                  job.events.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{event.title}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            {new Date(event.startTime).toLocaleString("hu-HU")}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getEventClasses(
                            event.type
                          )}`}
                        >
                          {event.type}
                        </span>
                      </div>

                      {event.location && (
                        <p className="mt-3 text-sm text-slate-300">
                          Helyszín: {event.location}
                        </p>
                      )}

                      {event.meetingLink && (
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block break-all text-sm text-blue-300 underline underline-offset-4"
                        >
                          {event.meetingLink}
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}