import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/gemini";
import {
  aiOutputLanguagePromptRule,
  getAiOutputLanguageFromRequest,
} from "@/lib/ai-output-language";
import { isAiRegenerateRequest } from "@/lib/is-ai-regenerate-request";
import { NextResponse } from "next/server";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "1 m"), // 1 request / min / user
});

const matchScoreSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string().min(10).max(2000),
  strengths: z.array(z.string()).min(3).max(6),
  gaps: z.array(z.string()).min(3).max(6),
});

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

function extractJson(text: string) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {}

  const fencedJsonMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedJsonMatch?.[1]) {
    return JSON.parse(fencedJsonMatch[1].trim());
  }

  const fencedMatch = trimmed.match(/```\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return JSON.parse(fencedMatch[1].trim());
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }

  throw new Error("No valid JSON found.");
}

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

    const { success } = await ratelimit.limit(`match-score:${user.id}`);

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

    if (!cv?.rawText?.trim()) {
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

    const existingMatch = await prisma.matchScore.findFirst({
      where: {
        jobId: job.id,
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const regenerate = isAiRegenerateRequest(req);
    const outputLang = getAiOutputLanguageFromRequest(req);

    if (!regenerate && existingMatch) {
      try {
        const cachedLang = existingMatch.outputLanguage ?? "en";
        if (cachedLang === outputLang) {
          const cached = {
            score: existingMatch.score,
            summary: existingMatch.summary,
            strengths: JSON.parse(existingMatch.strengths),
            gaps: JSON.parse(existingMatch.gaps),
          };

          const validatedCached = matchScoreSchema.safeParse(cached);

          if (validatedCached.success) {
            return NextResponse.json(validatedCached.data);
          }
        }
      } catch (error) {
        console.error("MATCH_SCORE_CACHE_PARSE_ERROR:", error);
      }
    }

    let parsedCv: ParsedCvProfile | null = null;

    if (cv.parsedData) {
      try {
        parsedCv = JSON.parse(cv.parsedData);
      } catch (error) {
        console.error("PARSED_CV_JSON_ERROR:", error);
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
${parsedCv.experience?.length ? `- ${parsedCv.experience.join("\n- ")}` : "N/A"}

Education:
${parsedCv.education?.length ? `- ${parsedCv.education.join("\n- ")}` : "N/A"}

Languages:
${parsedCv.languages?.join(", ") || "N/A"}

Highlights:
${parsedCv.highlights?.length ? `- ${parsedCv.highlights.join("\n- ")}` : "N/A"}
`
      : "STRUCTURED CV PROFILE: Not available.";

    const langRule = aiOutputLanguagePromptRule(outputLang);

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
- ${langRule}

JOB DESCRIPTION:
${job.description}

${parsedCvSection}

RAW CV TEXT:
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

    let json: unknown;

    try {
      json = extractJson(text);
    } catch (error) {
      console.error("GEMINI_PARSE_ERROR:", text);
      return NextResponse.json(
        { error: "AI response could not be parsed." },
        { status: 500 }
      );
    }

    const parsed = matchScoreSchema.safeParse(json);

    if (!parsed.success) {
      console.error("GEMINI_MATCH_SCORE_SCHEMA_ERROR:", parsed.error.issues, json);
      return NextResponse.json(
        { error: "AI response shape invalid." },
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
        score: parsed.data.score,
        summary: parsed.data.summary,
        strengths: JSON.stringify(parsed.data.strengths),
        gaps: JSON.stringify(parsed.data.gaps),
        outputLanguage: outputLang,
      },
    });

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error("GEMINI_MATCH_SCORE_ERROR:", error);

    return NextResponse.json(
      { error: "AI analysis failed." },
      { status: 500 }
    );
  }
}