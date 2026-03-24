import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "1 m"), // 1 kérés / perc / user
});

const cvProfileSchema = z.object({
  headline: z.string().min(2).max(200),
  summary: z.string().min(10).max(2000),
  skills: z.array(z.string()).min(4).max(10),
  technologies: z.array(z.string()).min(4).max(12),
  experience: z.array(z.string()).min(2).max(6),
  education: z.array(z.string()).min(1).max(4),
  languages: z.array(z.string()).min(1).max(6),
  highlights: z.array(z.string()).min(3).max(6),
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

export async function POST() {
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

    const { success } = await ratelimit.limit(`cv-parse:${user.id}`);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
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

    if (cv.parsedData) {
      try {
        const cached = JSON.parse(cv.parsedData);
        const validatedCached = cvProfileSchema.safeParse(cached);

        if (validatedCached.success) {
          return NextResponse.json(validatedCached.data);
        }
      } catch (error) {
        console.error("CV_PARSE_CACHE_ERROR:", error);
      }
    }

    const cooldown = 30 * 1000;

    if (
      cv.parsedUpdatedAt &&
      Date.now() - cv.parsedUpdatedAt.getTime() < cooldown
    ) {
      return NextResponse.json(
        { error: "Please wait before regenerating." },
        { status: 429 }
      );
    }

    const prompt = `
Analyze the following CV text.

Return ONLY valid JSON with this exact shape:
{
  "headline": string,
  "summary": string,
  "skills": string[],
  "technologies": string[],
  "experience": string[],
  "education": string[],
  "languages": string[],
  "highlights": string[]
}

Rules:
- headline: a short professional title
- summary: 2-4 concise sentences
- skills: 4 to 10 short items
- technologies: 4 to 12 short items
- experience: 2 to 6 short bullet-style items
- education: 1 to 4 short bullet-style items
- languages: 1 to 6 short items
- highlights: 3 to 6 short bullet-style items
- no markdown
- no extra text before or after the JSON
- do not invent facts not present in the CV
- language: hungarian

CV TEXT:
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
      console.error("CV_PARSE_JSON_ERROR:", text);
      return NextResponse.json(
        { error: "AI response could not be parsed." },
        { status: 500 }
      );
    }

    const parsed = cvProfileSchema.safeParse(json);

    if (!parsed.success) {
      console.error("CV_PARSE_SCHEMA_ERROR:", parsed.error.issues, json);
      return NextResponse.json(
        { error: "AI response shape invalid." },
        { status: 500 }
      );
    }

    await prisma.cv.update({
      where: { userId: user.id },
      data: {
        parsedData: JSON.stringify(parsed.data),
        parsedUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error("CV_PARSE_ERROR:", error);

    return NextResponse.json(
      { error: "CV parsing failed." },
      { status: 500 }
    );
  }
}