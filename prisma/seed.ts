import { EventType, JobStatus, PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const companies = [
  "Stripe",
  "Vercel",
  "Notion",
  "Linear",
  "Spotify",
  "Shopify",
  "Airbnb",
  "Google",
  "Meta",
  "OpenAI",
  "Netflix",
  "Uber",
  "Slack",
  "Figma",
];

const titles = [
  "Frontend Engineer",
  "Software Engineer",
  "Fullstack Developer",
  "React Developer",
  "Product Engineer",
  "Typescript Engineer",
  "Senior Frontend Engineer",
  "Frontend Developer",
];

const locations = [
  "Remote",
  "Berlin",
  "London",
  "Stockholm",
  "Zurich",
  "Amsterdam",
  "San Francisco",
];

const statuses: JobStatus[] = [
  JobStatus.Saved,
  JobStatus.Applied,
  JobStatus.Interviewing,
  JobStatus.Offer,
  JobStatus.Rejected,
  JobStatus.OnHold,
];

const sources = [
  "LinkedIn",
  "Profession",
  "Indeed",
  "Company website",
  "Referral",
  "Hacker News",
];

const currencies = ["HUF", "EUR", "USD"] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(days: number) {
  return new Date(Date.now() + Math.random() * days * 86400000);
}

async function main() {
  let user = await prisma.user.findFirst();

  if (!user) {
    console.log("No user found. Creating a demo user...");

    user = await prisma.user.create({
      data: {
        email: "demo@jobflow.local",
        name: "Demo User",
        passwordHash: await bcrypt.hash("demo1234", 10),
      },
    });
  }

  console.log("Cleaning old data...");

  await prisma.jobStatusHistory.deleteMany();
  await prisma.event.deleteMany();
  await prisma.matchScore.deleteMany();
  await prisma.job.deleteMany();

  console.log("Generating jobs...");

  const jobs = [];

  for (let i = 0; i < 50; i++) {
    const status = randomItem(statuses);
    const currency = randomItem(currencies) as (typeof currencies)[number];

    const shouldHaveSalary = Math.random() > 0.25;
    const salaryMin = shouldHaveSalary
      ? currency === "HUF"
        ? randomInt(500_000, 1_400_000)
        : currency === "EUR"
          ? randomInt(2_500, 8_000)
          : randomInt(3_000, 10_000)
      : null;
    const salaryMax =
      salaryMin !== null && Math.random() > 0.2
        ? salaryMin +
          (currency === "HUF"
            ? randomInt(100_000, 500_000)
            : randomInt(500, 2_000))
        : null;

    const job = await prisma.job.create({
      data: {
        userId: user.id,
        title: randomItem(titles),
        company: randomItem(companies),
        location: randomItem(locations),
        status,
        description: "Sample job description for testing the dashboard and board.",
        source: Math.random() > 0.15 ? randomItem(sources) : null,
        jobUrl:
          Math.random() > 0.25
            ? `https://example.com/jobs/${encodeURIComponent(
                String(i)
              )}-${encodeURIComponent(randomItem(companies))}`
            : null,
        salaryMin,
        salaryMax,
        currency: salaryMin !== null || salaryMax !== null ? currency : null,
      },
    });

    jobs.push(job);

    await prisma.jobStatusHistory.create({
      data: {
        jobId: job.id,
        toStatus: status,
      },
    });

    if (Math.random() > 0.65) {
      await prisma.event.create({
        data: {
          userId: user.id,
          jobId: job.id,
          type: EventType.Interview,
          title: "Interview with " + job.company,
          description: Math.random() > 0.6 ? "Technical + culture fit." : null,
          meetingLink:
            Math.random() > 0.6 ? "https://meet.google.com/abc-defg-hij" : null,
          startTime: randomDate(7),
          endTime: randomDate(7),
          reminderMinutesBefore: Math.random() > 0.5 ? 30 : 10,
        },
      });
    }

    if (Math.random() > 0.75) {
      await prisma.event.create({
        data: {
          userId: user.id,
          jobId: job.id,
          type: EventType.FollowUp,
          title: "Follow-up email",
          description:
            Math.random() > 0.6
              ? "Send a short update / ask about next steps."
              : null,
          startTime: randomDate(5),
          reminderMinutesBefore: Math.random() > 0.5 ? 60 : null,
        },
      });
    }

    if (Math.random() > 0.8) {
      await prisma.event.create({
        data: {
          userId: user.id,
          jobId: job.id,
          type: EventType.TaskDeadline,
          title: "Portfolio / take-home deadline",
          description:
            Math.random() > 0.5 ? "Make sure the repo is public + README." : null,
          startTime: randomDate(10),
          reminderMinutesBefore: 24 * 60,
        },
      });
    }

    if (Math.random() > 0.9) {
      await prisma.event.create({
        data: {
          userId: user.id,
          jobId: Math.random() > 0.4 ? job.id : null,
          type: EventType.Other,
          title: "Notes / admin",
          description:
            Math.random() > 0.5 ? "Update CV, ping recruiter, log outcome." : null,
          startTime: randomDate(14),
        },
      });
    }
  }

  console.log("Seed completed.");
}

main().finally(() => prisma.$disconnect());