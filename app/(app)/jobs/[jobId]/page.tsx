import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import JobDetailActions from "@/components/job-detail-actions";
import JobAiInsights from "@/components/job-ai-insights";
import JobEventsPanel from "@/components/job-events-panel";
import Link from "next/link";
import type { EventType as UiEventType } from "@/components/event-form-modal";

function formatSalaryRange({
  salaryMin,
  salaryMax,
  currency,
}: {
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
}) {
  const fmt = (value: number) => value.toLocaleString("hu-HU");
  const cur = currency?.trim() ? ` ${currency.trim()}` : "";

  if (typeof salaryMin === "number" && typeof salaryMax === "number") {
    return `${fmt(salaryMin)}–${fmt(salaryMax)}${cur}`;
  }

  if (typeof salaryMin === "number") return `${fmt(salaryMin)}+${cur}`;
  if (typeof salaryMax === "number") return `≤${fmt(salaryMax)}${cur}`;
  return "—";
}

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
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
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

  const latestMatchScore = await prisma.matchScore.findFirst({
    where: {
      jobId: job.id,
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let initialSummary: {
    summary: string;
    responsibilities: string[];
    requirements: string[];
    techStack: string[];
  } | null = null;

  if (job.aiSummary) {
    try {
      initialSummary = JSON.parse(job.aiSummary);
    } catch (error) {
      console.error("AI_SUMMARY_PARSE_ERROR", error);
    }
  }

  let initialMatch: {
    score: number;
    summary: string;
    strengths: string[];
    gaps: string[];
  } | null = null;

  if (latestMatchScore) {
    try {
      initialMatch = {
        score: latestMatchScore.score,
        summary: latestMatchScore.summary,
        strengths: JSON.parse(latestMatchScore.strengths),
        gaps: JSON.parse(latestMatchScore.gaps),
      };
    } catch (error) {
      console.error("MATCH_SCORE_PARSE_ERROR", error);
    }
  }

  let initialPrep: {
    questions: string[];
    talkingPoints: string[];
    checklist: string[];
    pitch30s: string;
  } | null = null;

  if (job.aiInterviewPrep) {
    try {
      initialPrep = JSON.parse(job.aiInterviewPrep);
    } catch (error) {
      console.error("INTERVIEW_PREP_PARSE_ERROR", error);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <span>←</span>
          <span>Vissza az állásokhoz</span>
        </Link>

        <section className="mt-6 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_26%)] px-8 py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Job detail
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {job.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span className="font-medium text-slate-200">{job.company}</span>
                  {job.location && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span>{job.location}</span>
                    </>
                  )}
                  {job.source && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span>{job.source}</span>
                    </>
                  )}
                  {(job.salaryMin || job.salaryMax) && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span>
                        {formatSalaryRange({
                          salaryMin: job.salaryMin,
                          salaryMax: job.salaryMax,
                          currency: job.currency,
                        })}
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    Létrehozva: {new Date(job.createdAt).toLocaleDateString("hu-HU")}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    Frissítve: {new Date(job.updatedAt).toLocaleDateString("hu-HU")}
                  </span>
                </div>
              </div>

              <div className="w-full max-w-md">
                <JobDetailActions jobId={job.id} currentStatus={job.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              <section className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Állás részletei</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      A kiválasztott pozícióhoz tartozó alapinformációk.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoCard title="Pozíció" value={job.title} />
                  <InfoCard title="Cég" value={job.company} />
                  <InfoCard title="Helyszín" value={job.location || "—"} />
                  <InfoCard title="Forrás" value={job.source || "—"} />
                  <InfoCard
                    title="Bérsáv"
                    value={formatSalaryRange({
                      salaryMin: job.salaryMin,
                      salaryMax: job.salaryMax,
                      currency: job.currency,
                    })}
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Tag-ek
                  </p>
                  {job.tags.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags.map((item) => (
                        <span
                          key={item.tag.id}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                        >
                          {item.tag.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">
                      Nincs megadva tag.
                    </p>
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Leírás
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {job.description ||
                      "Még nincs leírás megadva ehhez az álláshoz."}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Állás link
                  </p>

                  {job.jobUrl ? (
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block break-all text-sm text-blue-300 underline underline-offset-4 transition hover:text-blue-200"
                    >
                      {job.jobUrl}
                    </a>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">
                      Nincs megadva link ehhez az álláshoz.
                    </p>
                  )}
                </div>
              </section>

              <JobAiInsights
                jobId={job.id}
                initialMatch={initialMatch}
                initialSummary={initialSummary}
                initialCoverLetter={job.aiCoverLetter ?? null}
                initialPrep={initialPrep}
              />

              <section className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold">Státusz előzmények</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Az állás státuszváltozásainak idővonala.
                  </p>
                </div>

                <div className="space-y-3">
                  {job.statusHistory.length === 0 ? (
                    <EmptyState text="Még nincs státusz előzmény." />
                  ) : (
                    job.statusHistory.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              {item.fromStatus && (
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                  {item.fromStatus}
                                </span>
                              )}
                              {item.fromStatus && (
                                <span className="text-slate-500">→</span>
                              )}
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                                {item.toStatus}
                              </span>
                            </div>

                            {item.note && (
                              <p className="mt-3 text-sm leading-6 text-slate-300">
                                {item.note}
                              </p>
                            )}
                          </div>

                          <div className="text-sm text-slate-500">
                            {new Date(item.changedAt).toLocaleString("hu-HU")}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-white/10 bg-slate-900/30 p-6 xl:sticky xl:top-24">
                <h2 className="text-xl font-semibold">Összegzés</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Gyors áttekintés a pozíció jelenlegi állapotáról.
                </p>

                <div className="mt-5 space-y-4">
                  <SidebarInfoCard
                    label="Aktuális státusz"
                    value={job.status}
                    badgeClass={getStatusClasses(job.status)}
                    isBadge
                  />

                  <SidebarInfoCard
                    label="Létrehozva"
                    value={new Date(job.createdAt).toLocaleString("hu-HU")}
                  />

                  <SidebarInfoCard
                    label="Utoljára frissítve"
                    value={new Date(job.updatedAt).toLocaleString("hu-HU")}
                  />

                  <SidebarInfoCard
                    label="Bérsáv"
                    value={formatSalaryRange({
                      salaryMin: job.salaryMin,
                      salaryMax: job.salaryMax,
                      currency: job.currency,
                    })}
                  />

                  <SidebarInfoCard
                    label="Kapcsolódó eventek"
                    value={String(job.events.length)}
                  />

                  <SidebarInfoCard
                    label="Státusz előzmények"
                    value={String(job.statusHistory.length)}
                  />
                </div>
              </section>

              <JobEventsPanel
                jobId={job.id}
                initialEvents={job.events.map((event) => ({
                  id: event.id,
                  jobId: event.jobId,
                  type: event.type as UiEventType,
                  title: event.title,
                  description: event.description,
                  location: event.location,
                  meetingLink: event.meetingLink,
                  startTime: event.startTime.toISOString(),
                  endTime: event.endTime ? event.endTime.toISOString() : null,
                  reminderMinutesBefore: event.reminderMinutesBefore,
                  job: {
                    id: job.id,
                    title: job.title,
                    company: job.company,
                  },
                }))}
              />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-sm text-white">{value}</p>
    </div>
  );
}

function SidebarInfoCard({
  label,
  value,
  isBadge = false,
  badgeClass = "",
}: {
  label: string;
  value: string;
  isBadge?: boolean;
  badgeClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      {isBadge ? (
        <div className="mt-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${badgeClass}`}>
            {value}
          </span>
        </div>
      ) : (
        <p className="mt-2 text-sm text-white">{value}</p>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
      {text}
    </div>
  );
}