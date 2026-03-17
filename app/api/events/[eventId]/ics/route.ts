import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function icsEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatIcsDate(date: Date) {
  // UTC format: YYYYMMDDTHHMMSSZ
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const origin = new URL(req.url).origin;
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

  const uid = `${event.id}@jobflow`;
  const dtstamp = formatIcsDate(new Date());
  const dtstart = formatIcsDate(event.startTime);
  const dtend = formatIcsDate(event.endTime ?? new Date(event.startTime.getTime() + 60 * 60 * 1000));

  const summaryBase = event.title;
  const summaryJob = event.job ? ` (${event.job.company})` : "";
  const summary = icsEscape(`${summaryBase}${summaryJob}`);

  const descriptionParts: string[] = [];
  if (event.job) {
    descriptionParts.push(`Job: ${event.job.company} – ${event.job.title}`);
    descriptionParts.push(`Link: ${origin}/jobs/${event.job.id}`);
  }
  if (event.description) descriptionParts.push(event.description);
  if (event.meetingLink) descriptionParts.push(`Meeting: ${event.meetingLink}`);
  const description = icsEscape(descriptionParts.join("\n"));

  const location = event.location ? `LOCATION:${icsEscape(event.location)}` : "";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JobFlow//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
    location,
    description ? `DESCRIPTION:${description}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n")
    .replace(/\r\n\r\n/g, "\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"event-${event.id}.ics\"`,
    },
  });
}

