import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
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

    const job = await prisma.job.findFirst({
        where: {
            id: jobId,
            userId: user.id,
        },
    });

    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
}

export async function PUT(
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
            title: body.title ?? existingJob.title,
            company: body.company ?? existingJob.company,
            location: body.location ?? existingJob.location,
            jobUrl: body.jobUrl ?? existingJob.jobUrl,
            description: body.description ?? existingJob.description,
            status: body.status ?? existingJob.status,
        },
    });

    return NextResponse.json(updatedJob);
}

export async function DELETE(
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

    const existingJob = await prisma.job.findFirst({
        where: {
            id: jobId,
            userId: user.id,
        },
    });

    if (!existingJob) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await prisma.jobStatusHistory.deleteMany({
        where: { jobId },
    });

    await prisma.event.deleteMany({
        where: { jobId },
    });

    await prisma.matchScore.deleteMany({
        where: { jobId },
    });

    await prisma.job.delete({
        where: { id: jobId },
    });

    return NextResponse.json({ success: true });
}