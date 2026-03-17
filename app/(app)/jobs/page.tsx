import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import JobsFilters from "@/components/jobs-filters";
import Link from "next/link";

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

type JobsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    location?: string;
    source?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 10;

type JobStatusValue =
  | "Saved"
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "OnHold";

export default async function JobsPage({ searchParams }: JobsPageProps) {
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

  const params = await searchParams;

  const q = params.q?.trim() || "";
  const status = params.status?.trim() || "All";
  const location = params.location?.trim() || "All";
  const source = params.source?.trim() || "All";
  const tag = params.tag?.trim() || "All";
  const sort = params.sort?.trim() || "newest";
  const currentPage = Math.max(1, Number(params.page || "1"));

  let orderBy:
    | { createdAt: "asc" | "desc" }
    | { title: "asc" | "desc" }
    | { company: "asc" | "desc" }
    | { status: "asc" | "desc" };

  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "title-asc":
      orderBy = { title: "asc" };
      break;
    case "company-asc":
      orderBy = { company: "asc" };
      break;
    case "status-asc":
      orderBy = { status: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const where = {
    userId: user.id,
    ...(status !== "All" ? { status: status as JobStatusValue } : {}),
    ...(location !== "All" ? { location } : {}),
    ...(source !== "All" ? { source } : {}),
    ...(tag !== "All"
      ? {
          tags: {
            some: {
              tag: {
                name: tag,
                userId: user.id,
              },
            },
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            {
              title: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              company: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              location: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              source: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [locationRows, sourceRows, statusRows, statsRows, tagRows, totalCount, jobs] =
    await Promise.all([
      prisma.job.findMany({
        where: {
          userId: user.id,
          location: {
            not: null,
          },
        },
        select: {
          location: true,
        },
        distinct: ["location"],
        orderBy: {
          location: "asc",
        },
      }),
      prisma.job.findMany({
        where: {
          userId: user.id,
          source: {
            not: null,
          },
        },
        select: {
          source: true,
        },
        distinct: ["source"],
        orderBy: {
          source: "asc",
        },
      }),
      prisma.job.findMany({
        where: {
          userId: user.id,
        },
        select: {
          status: true,
        },
        distinct: ["status"],
        orderBy: {
          status: "asc",
        },
      }),
      prisma.job.groupBy({
        by: ["status"],
        where: {
          userId: user.id,
        },
        _count: {
          _all: true,
        },
      }),
      prisma.tag.findMany({
        where: { userId: user.id },
        select: { name: true },
        orderBy: { name: "asc" },
      }),
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        orderBy,
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          tags: {
            include: {
              tag: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

  const locationOptions = locationRows
    .map((item) => item.location)
    .filter((item): item is string => Boolean(item));

  const sourceOptions = sourceRows
    .map((item) => item.source)
    .filter((item): item is string => Boolean(item));

  const statusOptions = statusRows.map((item) => item.status);
  const tagOptions = tagRows.map((item) => item.name);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const statsMap = new Map(
    statsRows.map((item) => [item.status, item._count._all])
  );

  const queryBase = new URLSearchParams();
  if (q) queryBase.set("q", q);
  if (status !== "All") queryBase.set("status", status);
  if (location !== "All") queryBase.set("location", location);
  if (source !== "All") queryBase.set("source", source);
  if (tag !== "All") queryBase.set("tag", tag);
  if (sort !== "newest") queryBase.set("sort", sort);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_25%)] px-8 py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Jobs
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Állások kezelése
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Keress, szűrj, rendezz és navigálj gyorsan a jelentkezéseid
                  között.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                  Találatok: <span className="text-white">{totalCount}</span>
                </div>

                <a
                  href={`/api/jobs/export?${queryBase.toString()}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Export (CSV)
                </a>

                <Link
                  href="/jobs/new"
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90"
                >
                  Új állás
                </Link>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              <StatCard label="Összes" value={statsRows.reduce((acc, item) => acc + item._count._all, 0)} />
              <StatCard label="Saved" value={statsMap.get("Saved") || 0} />
              <StatCard label="Applied" value={statsMap.get("Applied") || 0} />
              <StatCard label="Interviewing" value={statsMap.get("Interviewing") || 0} />
              <StatCard label="Offer" value={statsMap.get("Offer") || 0} />
              <StatCard label="Rejected" value={statsMap.get("Rejected") || 0} />
              <StatCard label="OnHold" value={statsMap.get("OnHold") || 0} />
            </div>

            <div className="mt-8">
              <JobsFilters
                statusOptions={statusOptions}
                locationOptions={locationOptions}
                sourceOptions={sourceOptions}
                tagOptions={tagOptions}
              />
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/30">
              {jobs.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-lg font-medium text-white">
                    Nincs találat
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Próbálj meg más szűrőket vagy keresési kifejezést használni.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1220px] text-sm">
                    <thead className="border-b border-white/10 bg-white/5 text-slate-400">
                      <tr>
                        <th className="px-6 py-4 text-left font-medium">Pozíció</th>
                        <th className="px-6 py-4 text-left font-medium">Cég</th>
                        <th className="px-6 py-4 text-left font-medium">Helyszín</th>
                        <th className="px-6 py-4 text-left font-medium">Bérsáv</th>
                        <th className="px-6 py-4 text-left font-medium">Forrás</th>
                        <th className="px-6 py-4 text-left font-medium">Link</th>
                        <th className="px-6 py-4 text-left font-medium">Státusz</th>
                        <th className="px-6 py-4 text-left font-medium">Létrehozva</th>
                        <th className="px-6 py-4 text-left font-medium">Frissítve</th>
                      </tr>
                    </thead>

                    <tbody>
                      {jobs.map((job) => (
                        <tr
                          key={job.id}
                          className="border-b border-white/5 transition hover:bg-white/5"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="font-medium text-white transition hover:text-blue-300"
                            >
                              {job.title}
                            </Link>
                            {job.tags?.length ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {job.tags.slice(0, 3).map((item) => (
                                  <span
                                    key={item.tagId}
                                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300"
                                  >
                                    {item.tag.name}
                                  </span>
                                ))}
                                {job.tags.length > 3 ? (
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400">
                                    +{job.tags.length - 3}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                            {job.description && (
                              <p className="mt-1 max-w-md truncate text-xs text-slate-500">
                                {job.description}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4 text-slate-300">
                            {job.company}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {job.location || "—"}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {formatSalaryRange({
                              salaryMin: job.salaryMin,
                              salaryMax: job.salaryMax,
                              currency: job.currency,
                            })}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {job.source || "—"}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {job.jobUrl ? (
                              <a
                                href={job.jobUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="font-medium text-blue-300 hover:text-blue-200"
                              >
                                Megnyitás
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                                job.status
                              )}`}
                            >
                              {job.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-slate-500">
                            {new Date(job.createdAt).toLocaleDateString("hu-HU")}
                          </td>

                          <td className="px-6 py-4 text-slate-500">
                            {new Date(job.updatedAt).toLocaleDateString("hu-HU")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-400">
                  Oldal <span className="text-white">{currentPage}</span> /{" "}
                  <span className="text-white">{totalPages}</span>
                </p>

                <div className="flex items-center gap-3">
                  {currentPage > 1 ? (
                    <a
                      href={`/jobs?${buildPageQuery(queryBase, currentPage - 1)}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                    >
                      Előző
                    </a>
                  ) : (
                    <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-500">
                      Előző
                    </span>
                  )}

                  {currentPage < totalPages ? (
                    <a
                      href={`/jobs?${buildPageQuery(queryBase, currentPage + 1)}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                    >
                      Következő
                    </a>
                  ) : (
                    <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-500">
                      Következő
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function buildPageQuery(base: URLSearchParams, page: number) {
  const params = new URLSearchParams(base.toString());
  params.set("page", String(page));
  return params.toString();
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}