import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
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

  const { jobId } = await params;
  const body = await req.json();
  const newStatus = body.status;

  if (!newStatus) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  const existingJob = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId: user.id,
    },
  });

  if (!existingJob) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const updatedJob = await prisma.job.update({
    where: {
      id: jobId,
    },
    data: {
      status: newStatus,
    },
  });

  await prisma.jobStatusHistory.create({
    data: {
      jobId: existingJob.id,
      fromStatus: existingJob.status,
      toStatus: newStatus,
    },
  });

  return NextResponse.json(updatedJob);
}