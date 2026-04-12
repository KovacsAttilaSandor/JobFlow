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

const responseFromAiSchema = z.object({
  questions: z.array(z.string()).min(5).max(20),
  talkingPoints: z.array(z.string()).min(5).max(20),
  checklist: z.array(z.string()).min(5).max(20),
  pitch30s: z.string().min(40).max(800),
});

const responseStoredSchema = responseFromAiSchema.extend({
  outputLanguage: z.string().optional(),
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

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return JSON.parse(fencedMatch[1].trim());
  }

  const genericFencedMatch = trimmed.match(/```\s*([\s\S]*?)\s*```/i);
  if (genericFencedMatch?.[1]) {
    return JSON.parse(genericFencedMatch[1].trim());
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const possibleJson = trimmed.slice(firstBrace, lastBrace + 1);
    return JSON.parse(possibleJson);
  }

  throw new Error("No valid JSON found in AI response.");
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

    // RATE LIMIT
    const { success } = await ratelimit.limit(`interview-prep:${user.id}`);

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

    if (!job.description?.trim()) {
      return NextResponse.json(
        { error: "Job description is missing." },
        { status: 400 }
      );
    }

    const cv = await prisma.cv.findUnique({
      where: { userId: user.id },
    });

    if (!cv?.rawText?.trim()) {
      return NextResponse.json(
        { error: "CV not found. Upload your CV first." },
        { status: 400 }
      );
    }

    const regenerate = isAiRegenerateRequest(req);
    const outputLang = getAiOutputLanguageFromRequest(req);

    if (!regenerate && job.aiInterviewPrep) {
      try {
        const cached = JSON.parse(job.aiInterviewPrep);
        const cachedParsed = responseStoredSchema.safeParse(cached);

        if (cachedParsed.success) {
          const cachedLang = cachedParsed.data.outputLanguage ?? "en";
          if (cachedLang === outputLang) {
            const { outputLanguage: _, ...rest } = cachedParsed.data;
            return NextResponse.json(rest);
          }
        }
      } catch (error) {
        console.error("INTERVIEW_PREP_CACHE_PARSE_ERROR:", error);
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
You are preparing a candidate for an interview based on their CV and a job description.

Return ONLY valid JSON with this exact shape:
{
  "questions": string[],
  "talkingPoints": string[],
  "checklist": string[],
  "pitch30s": string
}

Rules:
- questions: 8 to 14 realistic interview questions tailored to this job (mix: technical + behavioral + role-specific)
- talkingPoints: 8 to 14 bullet-style items of what the candidate should emphasize (based only on CV)
- checklist: 8 to 14 practical prep items (research, portfolio, questions to ask, logistics)
- pitch30s: 4-7 sentences, plain text, no markdown
- no markdown
- no extra text before or after the JSON
- do not invent experience not present in the CV
- ${langRule}

JOB TITLE:
${job.title || "N/A"}

COMPANY:
${job.company || "N/A"}

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
      console.error("INTERVIEW_PREP_PARSE_ERROR:", text);
      return NextResponse.json(
        { error: "AI response could not be parsed." },
        { status: 500 }
      );
    }

    const parsed = responseFromAiSchema.safeParse(json);

    if (!parsed.success) {
      console.error("INTERVIEW_PREP_SCHEMA_ERROR:", parsed.error.issues, json);
      return NextResponse.json(
        { error: "AI response shape invalid." },
        { status: 500 }
      );
    }

    const stored = { ...parsed.data, outputLanguage: outputLang };

    await prisma.job.update({
      where: { id: job.id },
      data: {
        aiInterviewPrep: JSON.stringify(stored),
        aiInterviewPrepUpdatedAt: new Date(),
      },
    });

    const { outputLanguage: _, ...clientPayload } = stored;
    return NextResponse.json(clientPayload);
  } catch (error) {
    console.error("INTERVIEW_PREP_ERROR:", error);

    return NextResponse.json(
      { error: "Interview prep generation failed." },
      { status: 500 }
    );
  }
}