import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

const statusOptions = [
  "All",
  "Saved",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "OnHold",
] as const;

type JobsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

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

  const jobs = await prisma.job.findMany({
    where: {
      userId: user.id,
      ...(status !== "All" ? { status: status as any } : {}),
      ...(q
        ? {
            OR: [
              {
                title: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                company: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                location: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Állások</h1>
            <p className="mt-1 text-sm text-slate-400">
              Kezeld és szűrd az állásjelentkezéseidet.
            </p>
          </div>

          <a
            href="/jobs/new"
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:opacity-90"
          >
            Új állás
          </a>
        </div>

        <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <form className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto]">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Keresés
              </label>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Pozíció, cég vagy helyszín..."
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Státusz
              </label>
              <select
                name="status"
                defaultValue={status}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "All" ? "Összes" : option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90"
              >
                Szűrés
              </button>

              <a
                href="/jobs"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Reset
              </a>
            </div>
          </form>
        </section>

        <div className="mb-4 text-sm text-slate-400">
          Találatok száma: <span className="text-white">{jobs.length}</span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          {jobs.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              Nincs találat a megadott szűrés alapján.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  <th className="px-6 py-4 text-left">Pozíció</th>
                  <th className="px-6 py-4 text-left">Cég</th>
                  <th className="px-6 py-4 text-left">Helyszín</th>
                  <th className="px-6 py-4 text-left">Státusz</th>
                  <th className="px-6 py-4 text-left">Dátum</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <a
                        href={`/jobs/${job.id}`}
                        className="font-medium text-white transition hover:text-blue-300"
                      >
                        {job.title}
                      </a>
                    </td>

                    <td className="px-6 py-4 text-slate-300">{job.company}</td>

                    <td className="px-6 py-4 text-slate-400">
                      {job.location || "—"}
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}