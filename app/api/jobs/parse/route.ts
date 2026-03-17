import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  jobText: z.string().min(50),
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

export async function POST(req: Request) {
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

  const body = await req.json();
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

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (error) {
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

    const data = parsedRes.data;
    return NextResponse.json(data);
  } catch (error) {
    console.error("JOB_PARSE_ERROR:", error);
    return NextResponse.json(
      { error: "Job parsing failed." },
      { status: 500 }
    );
  }
}

