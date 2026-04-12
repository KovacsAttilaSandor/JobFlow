import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createEventSchema = z.object({
  jobId: z.string().optional().nullable(),
  type: z.enum(["Interview", "TaskDeadline", "FollowUp", "Other"]),
  title: z.string().min(2).max(200),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  meetingLink: z.string().url().optional().nullable(),
  startTime: z.union([z.string(), z.date()]),
  endTime: z.union([z.string(), z.date()]).optional().nullable(),
  reminderMinutesBefore: z.number().int().min(0).max(10080).optional().nullable(),
});

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

export async function GET(req: Request) {
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

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const jobId = url.searchParams.get("jobId");

  const events = await prisma.event.findMany({
    where: {
      userId: user.id,
      ...(jobId ? { jobId } : {}),
      ...(from || to
        ? {
            startTime: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { startTime: "asc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: true,
        },
      },
    },
  });

  return NextResponse.json(events);
}

export async function POST(req: Request) {
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

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.jobId) {
    const job = await prisma.job.findFirst({
      where: {
        id: data.jobId,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
  }

  const event = await prisma.event.create({
    data: {
      userId: user.id,
      jobId: data.jobId || null,
      type: data.type,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      location: data.location?.trim() || null,
      meetingLink: data.meetingLink?.trim() || null,
      startTime: toDate(data.startTime),
      endTime: data.endTime ? toDate(data.endTime) : null,
      reminderMinutesBefore: data.reminderMinutesBefore ?? null,
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: true,
        },
      },
    },
  });

  return NextResponse.json(event, { status: 201 });
}

