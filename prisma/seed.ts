import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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

const statuses = [
  "Saved",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
] as const;

function randomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(days: number) {
  return new Date(Date.now() + Math.random() * days * 86400000);
}

async function main() {
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log("No user found. Register first.");
    return;
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

    const job = await prisma.job.create({
      data: {
        userId: user.id,
        title: randomItem(titles),
        company: randomItem(companies),
        location: randomItem(locations),
        status,
        description: "Sample job description for testing the dashboard and board.",
      },
    });

    jobs.push(job);

    await prisma.jobStatusHistory.create({
      data: {
        jobId: job.id,
        toStatus: status,
      },
    });

    if (Math.random() > 0.7) {
      await prisma.event.create({
        data: {
          userId: user.id,
          jobId: job.id,
          type: "Interview",
          title: "Interview with " + job.company,
          startTime: randomDate(7),
        },
      });
    }

    if (Math.random() > 0.85) {
      await prisma.event.create({
        data: {
          userId: user.id,
          jobId: job.id,
          type: "FollowUp",
          title: "Follow-up email",
          startTime: randomDate(5),
        },
      });
    }
  }

  console.log("Seed completed.");
}

main().finally(() => prisma.$disconnect());