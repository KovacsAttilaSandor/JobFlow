import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(
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

  try {
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