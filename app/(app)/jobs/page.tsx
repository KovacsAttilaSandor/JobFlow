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
    default:
      return "bg-white/10 text-slate-300 border-white/10";
  }
}

export default async function JobsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect("/login");

  const jobs = await prisma.job.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Állások</h1>
            <p className="text-slate-400 text-sm mt-1">
              Kezeld az állásjelentkezéseidet.
            </p>
          </div>

          <a
            href="/jobs/new"
            className="rounded-xl bg-white px-4 py-2 text-slate-950 font-medium"
          >
            Új állás
          </a>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">

          {jobs.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              Még nincs egyetlen állásod sem.
            </div>
          ) : (
            <table className="w-full text-sm">

              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  <th className="text-left px-6 py-4">Pozíció</th>
                  <th className="text-left px-6 py-4">Cég</th>
                  <th className="text-left px-6 py-4">Helyszín</th>
                  <th className="text-left px-6 py-4">Státusz</th>
                  <th className="text-left px-6 py-4">Dátum</th>
                </tr>
              </thead>

              <tbody>

                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >

                    <td className="px-6 py-4">
                      <a
                        href={`/jobs/${job.id}`}
                        className="font-medium text-white hover:underline"
                      >
                        {job.title}
                      </a>
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {job.company}
                    </td>

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
                      {new Date(job.createdAt).toLocaleDateString()}
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