import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { JobStatus, type Prisma } from "@/app/generated/prisma/client";

function csvEscape(value: string) {
  const needsQuotes = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function formatSalaryRange(
  salaryMin: number | null,
  salaryMax: number | null,
  currency: string | null
) {
  const cur = currency?.trim() ? ` ${currency.trim()}` : "";
  if (typeof salaryMin === "number" && typeof salaryMax === "number") {
    return `${salaryMin}-${salaryMax}${cur}`;
  }
  if (typeof salaryMin === "number") return `${salaryMin}+${cur}`;
  if (typeof salaryMax === "number") return `<=${salaryMax}${cur}`;
  return "";
}

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const status = (url.searchParams.get("status") || "All").trim();
  const location = (url.searchParams.get("location") || "All").trim();
  const source = (url.searchParams.get("source") || "All").trim();
  const tag = (url.searchParams.get("tag") || "All").trim();
  const sort = (url.searchParams.get("sort") || "newest").trim();
  const statusValue = status === "All" ? null : status;

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

  const where: Prisma.JobWhereInput = {
    userId: user.id,
    ...(statusValue ? { status: statusValue as JobStatus } : {}),
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
              title: { contains: q, mode: "insensitive" },
            },
            {
              company: { contains: q, mode: "insensitive" },
            },
            {
              location: { contains: q, mode: "insensitive" },
            },
            {
              source: { contains: q, mode: "insensitive" },
            },
            {
              description: { contains: q, mode: "insensitive" },
            },
          ],
        }
      : {}),
  };

  const jobs = await prisma.job.findMany({
    where,
    orderBy,
    include: {
      tags: {
        include: { tag: { select: { name: true } } },
      },
    },
  });

  const header = [
    "title",
    "company",
    "location",
    "source",
    "status",
    "salary",
    "jobUrl",
    "tags",
    "createdAt",
    "updatedAt",
  ];

  const lines = [header.join(",")];

  for (const job of jobs) {
    const tags = job.tags.map((t) => t.tag.name).join(";");
    const salary = formatSalaryRange(job.salaryMin, job.salaryMax, job.currency);

    const row = [
      job.title,
      job.company,
      job.location || "",
      job.source || "",
      job.status,
      salary,
      job.jobUrl || "",
      tags,
      job.createdAt.toISOString(),
      job.updatedAt.toISOString(),
    ].map(csvEscape);

    lines.push(row.join(","));
  }

  const csv = lines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"jobs-export.csv\"`,
    },
  });
}

