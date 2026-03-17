import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((item) => item.toLowerCase())
    .slice(0, 12);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const tags = normalizeTags(body.tags);

  const job = await prisma.job.create({
    data: {
      userId: user.id,
      title: body.title,
      company: body.company,
      location: body.location || null,
      jobUrl: body.jobUrl || null,
      description: body.description || null,
      source: body.source || null,
      salaryMin:
        typeof body.salaryMin === "number" && !Number.isNaN(body.salaryMin)
          ? body.salaryMin
          : null,
      salaryMax:
        typeof body.salaryMax === "number" && !Number.isNaN(body.salaryMax)
          ? body.salaryMax
          : null,
      currency: body.currency || null,
      status: "Saved",
      ...(tags.length
        ? {
            tags: {
              create: tags.map((name) => ({
                tag: {
                  connectOrCreate: {
                    where: {
                      userId_name: {
                        userId: user.id,
                        name,
                      },
                    },
                    create: {
                      userId: user.id,
                      name,
                    },
                  },
                },
              })),
            },
          }
        : {}),
    },
    include: {
      tags: {
        include: {
          tag: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(job);
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const jobs = await prisma.job.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tags: {
        include: {
          tag: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(jobs);
}