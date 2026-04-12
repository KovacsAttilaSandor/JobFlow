import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z
  .object({
    type: z.enum(["Interview", "TaskDeadline", "FollowUp", "Other"]).optional(),
    title: z.string().min(2).max(200).optional(),
    description: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    meetingLink: z.string().url().optional().nullable(),
    startTime: z.union([z.string(), z.date()]).optional(),
    endTime: z.union([z.string(), z.date()]).optional().nullable(),
    reminderMinutesBefore: z
      .number()
      .int()
      .min(0)
      .max(10080)
      .optional()
      .nullable(),
  })
  .strict();

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
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

  const { eventId } = await params;

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      userId: user.id,
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

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
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

  const { eventId } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const existing = await prisma.event.findFirst({
    where: {
      id: eventId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const data = parsed.data;

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...(data.type ? { type: data.type } : {}),
      ...(data.title ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined
        ? { description: data.description?.trim() || null }
        : {}),
      ...(data.location !== undefined
        ? { location: data.location?.trim() || null }
        : {}),
      ...(data.meetingLink !== undefined
        ? { meetingLink: data.meetingLink?.trim() || null }
        : {}),
      ...(data.startTime ? { startTime: toDate(data.startTime) } : {}),
      ...(data.endTime !== undefined
        ? { endTime: data.endTime ? toDate(data.endTime) : null }
        : {}),
      ...(data.reminderMinutesBefore !== undefined
        ? { reminderMinutesBefore: data.reminderMinutesBefore }
        : {}),
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

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
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

  const { eventId } = await params;

  const existing = await prisma.event.findFirst({
    where: {
      id: eventId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  return NextResponse.json({ success: true });
}

