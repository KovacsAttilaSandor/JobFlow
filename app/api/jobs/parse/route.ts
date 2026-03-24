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

const requestSchema = z.object({
  jobText: z.string().min(50).max(30000),
  jobUrl: z.string().url().optional().nullable(),
});

const responseSchema = z.object({
  title: z.string().min(2).max(200).nullable(),
  company: z.string().min(2).max(200).nullable(),
  location: z.string().max(200).nullable(),
  source: z.string().max(200).nullable(),
  salaryMin: z.number().int().min(0).nullable(),
  salaryMax: z.number().int().min(0).nullable(),
  currency: z.string().max(10).nullable(),
  description: z.string().nullable(),
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

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { success } = await ratelimit.limit(`job-parse:${user.id}`);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Érvénytelen JSON kérés." },
        { status: 400 }
      );
    }

    const parsedReq = requestSchema.safeParse(body);

    if (!parsedReq.success) {
      return NextResponse.json(
        { error: "Érvénytelen adatok.", issues: parsedReq.error.issues },
        { status: 400 }
      );
    }

    const { jobText, jobUrl } = parsedReq.data;

    const prompt = `
Extract structured fields from the following job ad text.

Return ONLY valid JSON with this exact shape:
{
  "title": string | null,
  "company": string | null,
  "location": string | null,
  "source": string | null,
  "salaryMin": number | null,
  "salaryMax": number | null,
  "currency": string | null,
  "description": string | null
}

Rules:
- If a field is not present, return null.
- salaryMin/salaryMax: monthly gross if possible; otherwise return the best numeric range you can infer, but do not guess.
- currency: "HUF" | "EUR" | "USD" if possible; otherwise null.
- description: return a cleaned, readable version of the ad text (keep sections, remove boilerplate if obvious).
- no markdown
- no extra text before or after the JSON
- language: Hungarian (field values can be original language)

JOB URL (optional):
${jobUrl || "N/A"}

JOB TEXT:
${jobText}
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
    } catch {
      console.error("JOB_PARSE_JSON_ERROR:", text);
      return NextResponse.json(
        { error: "AI response could not be parsed." },
        { status: 500 }
      );
    }

    const parsedRes = responseSchema.safeParse(json);

    if (!parsedRes.success) {
      console.error("JOB_PARSE_SCHEMA_ERROR:", parsedRes.error.issues, json);
      return NextResponse.json(
        { error: "AI response shape invalid." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedRes.data);
  } catch (error) {
    console.error("JOB_PARSE_ERROR:", error);

    return NextResponse.json(
      { error: "Job parsing failed." },
      { status: 500 }
    );
  }
}