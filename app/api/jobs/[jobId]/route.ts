import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function normalizeOptionalString(value: unknown) {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}

function normalizeOptionalInt(value: unknown) {
    if (value === null) return null;
    if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;
        const parsed = Number.parseInt(trimmed, 10);
        if (Number.isFinite(parsed)) return parsed;
        return null;
    }
    return undefined;
}

function normalizeTags(value: unknown) {
    if (!Array.isArray(value)) return undefined;
    const tags = value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .map((item) => item.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .map((item) => item.toLowerCase())
        .slice(0, 12);
    return tags;
}

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
        include: {
            tags: {
                include: {
                    tag: { select: { name: true } },
                },
            },
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
            title: typeof body.title === "string" ? body.title : existingJob.title,
            company: typeof body.company === "string" ? body.company : existingJob.company,
            location: normalizeOptionalString(body.location) ?? existingJob.location,
            source: normalizeOptionalString(body.source) ?? existingJob.source,
            jobUrl: normalizeOptionalString(body.jobUrl) ?? existingJob.jobUrl,
            currency: normalizeOptionalString(body.currency) ?? existingJob.currency,
            salaryMin: normalizeOptionalInt(body.salaryMin) ?? existingJob.salaryMin,
            salaryMax: normalizeOptionalInt(body.salaryMax) ?? existingJob.salaryMax,
            description: normalizeOptionalString(body.description) ?? existingJob.description,
            status: body.status ?? existingJob.status,
            ...(normalizeTags(body.tags) !== undefined
                ? {
                    tags: {
                        deleteMany: {},
                        create: normalizeTags(body.tags)!.map((name) => ({
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