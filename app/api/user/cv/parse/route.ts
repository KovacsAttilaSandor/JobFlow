import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST() {
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

  const cv = await prisma.cv.findUnique({
    where: { userId: user.id },
  });

  if (!cv?.rawText?.trim()) {
    return NextResponse.json(
      { error: "CV not found. Upload your CV first." },
      { status: 400 }
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
      headline: string;
      summary: string;
      skills: string[];
      technologies: string[];
      experience: string[];
      education: string[];
      languages: string[];
      highlights: string[];
    };

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      console.error("CV_PARSE_JSON_ERROR:", text);
      return NextResponse.json(
        { error: "AI response could not be parsed." },
        { status: 500 }
      );
    }

    await prisma.cv.update({
      where: { userId: user.id },
      data: {
        parsedData: JSON.stringify(parsed),
        parsedUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("CV_PARSE_ERROR:", error);
    return NextResponse.json(
      { error: "CV parsing failed." },
      { status: 500 }
    );
  }
}