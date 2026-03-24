import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/gemini";
import { NextResponse } from "next/server";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "1 m"), // 1 req / perc / user
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
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

    //  RATE LIMIT
    const { success } = await ratelimit.limit(user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
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

    const cv = await prisma.cv.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!cv?.rawText) {
      return NextResponse.json(
        { error: "CV not found. Upload your CV first." },
        { status: 400 }
      );
    }

    if (!job.description?.trim()) {
      return NextResponse.json(
        { error: "Job description is missing." },
        { status: 400 }
      );
    }

    // 🧠 DUPLICATION VÉDELEM
    if (job.aiCoverLetter && job.aiCoverLetterUpdatedAt) {
      return NextResponse.json({
        coverLetter: job.aiCoverLetter,
      });
    }

    // ⏱️ COOLDOWN (30 sec)
    const cooldown = 30 * 1000;

    if (
      job.aiCoverLetterUpdatedAt &&
      Date.now() - job.aiCoverLetterUpdatedAt.getTime() < cooldown
    ) {
      return NextResponse.json(
        { error: "Please wait before regenerating." },
        { status: 429 }
      );
    }

    const prompt = `
Write a concise, professional, personalized cover letter for this job application.

Rules:
- Output plain text only
- 200 to 300 words
- Friendly but professional tone
- Mention relevant skills from the CV
- Tailor it to the job description
- Do not invent fake experience
- Do not use placeholders like [Company Name]
- Language: Hungarian

Candidate name:
${user.name || "The candidate"}

JOB TITLE:
${job.title}

COMPANY:
${job.company}

JOB DESCRIPTION:
${job.description}

CV:
${cv.rawText}
`;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "AI did not return any content." },
        { status: 500 }
      );
    }

    await prisma.job.update({
      where: {
        id: job.id,
      },
      data: {
        aiCoverLetter: text,
        aiCoverLetterUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      coverLetter: text,
    });
  } catch (error) {
    console.error("GEMINI_COVER_LETTER_ERROR:", error);

    return NextResponse.json(
      { error: "Cover letter generation failed." },
      { status: 500 }
    );
  }
}