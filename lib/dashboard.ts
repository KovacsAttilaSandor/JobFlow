import { prisma } from "@/lib/prisma";

export async function getDashboardData(userId: string) {
  const [
    totalJobs,
    activeJobs,
    interviews,
    offers,
    recentJobs,
    upcomingEvents,
    activity,
  ] = await Promise.all([
    prisma.job.count({
      where: { userId },
    }),

    prisma.job.count({
      where: {
        userId,
        status: {
          in: ["Applied", "Interviewing"],
        },
      },
    }),

    prisma.job.count({
      where: {
        userId,
        status: "Interviewing",
      },
    }),

    prisma.job.count({
      where: {
        userId,
        status: "Offer",
      },
    }),

    prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.event.findMany({
      where: {
        userId,
        startTime: {
          gte: new Date(),
        },
      },
      orderBy: {
        startTime: "asc",
      },
      take: 5,
      include: {
        job: true,
      },
    }),

    prisma.jobStatusHistory.findMany({
      where: {
        job: {
          userId,
        },
      },
      orderBy: {
        changedAt: "desc",
      },
      take: 5,
      include: {
        job: true,
      },
    }),
  ]);

  return {
    stats: {
      totalJobs,
      activeJobs,
      interviews,
      offers,
    },
    recentJobs,
    upcomingEvents,
    activity,
  };
}