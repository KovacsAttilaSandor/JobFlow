import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/gemini";
import { NextResponse } from "next/server";

type ParsedCvProfile = {
  headline: string;
  summary: string;
  skills: string[];
  technologies: string[];
  experience: string[];
  education: string[];
  languages: string[];
  highlights: string[];
};

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

  let parsedCv: ParsedCvProfile | null = null;

  if (cv.parsedData) {
    try {
      parsedCv = JSON.parse(cv.parsedData);
    } catch (error) {
      console.error("PARSED_CV_JSON_ERROR", error);
    }
  }

  const parsedCvSection = parsedCv
    ? `
STRUCTURED CV PROFILE:
Headline: ${parsedCv.headline || "N/A"}

Summary:
${parsedCv.summary || "N/A"}

Skills:
${parsedCv.skills?.join(", ") || "N/A"}

Technologies:
${parsedCv.technologies?.join(", ") || "N/A"}

Experience:
${parsedCv.experience?.join("\n- ") || "N/A"}

Education:
${parsedCv.education?.join("\n- ") || "N/A"}

Languages:
${parsedCv.languages?.join(", ") || "N/A"}

Highlights:
${parsedCv.highlights?.join("\n- ") || "N/A"}
`
    : "STRUCTURED CV PROFILE: Not available.";

  const prompt = `
You are evaluating how well a candidate CV matches a job description.

Return ONLY valid JSON with this exact shape:
{
  "score": number,
  "summary": string,
  "strengths": string[],
  "gaps": string[]
}

Rules:
- score must be between 0 and 100
- strengths: 3 to 6 short bullet-style strings
- gaps: 3 to 6 short bullet-style strings
- summary: 2-4 concise sentences
- no markdown
- no extra text before or after the JSON
- prefer the structured CV profile when available
- use the raw CV text as supporting context
- be realistic and do not invent experience
- language: hungarian

JOB DESCRIPTION:
${job.description}

${parsedCvSection}

RAW CV TEXT:
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

    let parsed: {
      score: number;
      summary: string;
      strengths: string[];
      gaps: string[];
    };

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      console.error("GEMINI_PARSE_ERROR:", text);
      return NextResponse.json(
        { error: "AI response could not be parsed." },
        { status: 500 }
      );
    }

    await prisma.matchScore.deleteMany({
      where: {
        jobId: job.id,
        userId: user.id,
      },
    });

    await prisma.matchScore.create({
      data: {
        jobId: job.id,
        userId: user.id,
        score: parsed.score,
        summary: parsed.summary,
        strengths: JSON.stringify(parsed.strengths),
        gaps: JSON.stringify(parsed.gaps),
      },
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GEMINI_MATCH_SCORE_ERROR:", error);

    return NextResponse.json(
      { error: "AI analysis failed." },
      { status: 500 }
    );
  }
}