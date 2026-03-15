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

  if (!job.description?.trim()) {
    return NextResponse.json(
      { error: "Job description is missing." },
      { status: 400 }
    );
  }

  const prompt = `
Analyze the following job description.

Return ONLY valid JSON with this exact shape:
{
  "summary": string,
  "responsibilities": string[],
  "requirements": string[],
  "techStack": string[]
}

Rules:
- summary: 2-4 concise sentences
- responsibilities: 3 to 6 short bullet-style items
- requirements: 3 to 6 short bullet-style items
- techStack: 3 to 8 short technology names
- no markdown
- no extra text before or after the JSON

JOB DESCRIPTION:
${job.description}
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

    let parsed: {
      summary: string;
      responsibilities: string[];
      requirements: string[];
      techStack: string[];
    };

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      console.error("GEMINI_SUMMARY_PARSE_ERROR:", text);
      return NextResponse.json(
        { error: "AI response could not be parsed." },
        { status: 500 }
      );
    }

    await prisma.job.update({
      where: {
        id: job.id,
      },
      data: {
        aiSummary: JSON.stringify(parsed),
        aiSummaryUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GEMINI_JOB_SUMMARY_ERROR:", error);

    return NextResponse.json(
      { error: "Job summary generation failed." },
      { status: 500 }
    );
  }
}
