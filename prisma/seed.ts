import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })

const prisma = new PrismaClient({adapter});

async function main() {

  const user = await prisma.user.findFirst();

  if (!user) {
    console.log("No user found. Register first.");
    return;
  }

  const stripeJob = await prisma.job.create({
    data: {
      userId: user.id,
      title: "Frontend Engineer",
      company: "Stripe",
      location: "Remote",
      status: "Applied",
      description: "React + Typescript position",
    },
  });

  const notionJob = await prisma.job.create({
    data: {
      userId: user.id,
      title: "Product Engineer",
      company: "Notion",
      location: "Berlin",
      status: "Interviewing",
    },
  });

  const vercelJob = await prisma.job.create({
    data: {
      userId: user.id,
      title: "Fullstack Developer",
      company: "Vercel",
      location: "Remote",
      status: "Saved",
    },
  });

  const linearJob = await prisma.job.create({
    data: {
      userId: user.id,
      title: "Software Engineer",
      company: "Linear",
      location: "Remote",
      status: "Rejected",
    },
  });

  await prisma.event.createMany({
    data: [
      {
        userId: user.id,
        jobId: notionJob.id,
        type: "Interview",
        title: "Technical interview",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
      {
        userId: user.id,
        jobId: stripeJob.id,
        type: "FollowUp",
        title: "Follow-up email",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 48),
      },
    ],
  });

  await prisma.jobStatusHistory.createMany({
    data: [
      {
        jobId: stripeJob.id,
        toStatus: "Applied",
      },
      {
        jobId: notionJob.id,
        toStatus: "Interviewing",
      },
      {
        jobId: linearJob.id,
        toStatus: "Rejected",
      },
    ],
  });

  console.log("Seed data created.");
}

main().finally(() => prisma.$disconnect());