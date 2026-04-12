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

const jobSummaryFromAiSchema = z.object({
  summary: z.string().min(10).max(2000),
  responsibilities: z.array(z.string()).min(3).max(6),
  requirements: z.array(z.string()).min(3).max(6),
  techStack: z.array(z.string()).min(3).max(8),
});

const jobSummaryStoredSchema = jobSummaryFromAiSchema.extend({
  outputLanguage: z.string().optional(),
});

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

    const { success } = await ratelimit.limit(`job-summary:${user.id}`);

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

    const regenerate = isAiRegenerateRequest(req);
    const outputLang = getAiOutputLanguageFromRequest(req);

    if (!regenerate && job.aiSummary) {
      try {
        const cached = JSON.parse(job.aiSummary);
        const validatedCached = jobSummaryStoredSchema.safeParse(cached);

        if (validatedCached.success) {
          const cachedLang = validatedCached.data.outputLanguage ?? "en";
          if (cachedLang === outputLang) {
            const { outputLanguage: _, ...rest } = validatedCached.data;
            return NextResponse.json(rest);
          }
        }
      } catch (error) {
        console.error("JOB_SUMMARY_CACHE_PARSE_ERROR:", error);
      }
    }

    const langRule = aiOutputLanguagePromptRule(outputLang);

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
- ${langRule}

JOB DESCRIPTION:
${job.description}
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
      console.error("GEMINI_SUMMARY_PARSE_ERROR:", text);
      return NextResponse.json(
        { error: "AI response could not be parsed." },
        { status: 500 }
      );
    }

    const parsed = jobSummaryFromAiSchema.safeParse(json);

    if (!parsed.success) {
      console.error("GEMINI_JOB_SUMMARY_SCHEMA_ERROR:", parsed.error.issues, json);
      return NextResponse.json(
        { error: "AI response shape invalid." },
        { status: 500 }
      );
    }

    const stored = { ...parsed.data, outputLanguage: outputLang };

    await prisma.job.update({
      where: {
        id: job.id,
      },
      data: {
        aiSummary: JSON.stringify(stored),
        aiSummaryUpdatedAt: new Date(),
      },
    });

    const { outputLanguage: _, ...clientPayload } = stored;
    return NextResponse.json(clientPayload);
  } catch (error) {
    console.error("GEMINI_JOB_SUMMARY_ERROR:", error);

    return NextResponse.json(
      { error: "Job summary generation failed." },
      { status: 500 }
    );
  }
}