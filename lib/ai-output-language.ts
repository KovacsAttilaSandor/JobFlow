/** Supported output languages for AI job features (summary, match, letter, prep). */

export const AI_OUTPUT_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hu", label: "Hungarian" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "it", label: "Italian" },
  { code: "pl", label: "Polish" },
  { code: "ro", label: "Romanian" },
  { code: "nl", label: "Dutch" },
] as const;

export type AiOutputLanguageCode = (typeof AI_OUTPUT_LANGUAGES)[number]["code"];

const CODE_SET = new Set<string>(AI_OUTPUT_LANGUAGES.map((l) => l.code));

export const DEFAULT_AI_OUTPUT_LANGUAGE: AiOutputLanguageCode = "en";

export function normalizeAiOutputLanguage(
  raw: string | null | undefined
): AiOutputLanguageCode {
  const c = (raw ?? DEFAULT_AI_OUTPUT_LANGUAGE).toLowerCase().trim();
  return (CODE_SET.has(c) ? c : DEFAULT_AI_OUTPUT_LANGUAGE) as AiOutputLanguageCode;
}

export function aiOutputLanguageEnglishName(code: string): string {
  const row = AI_OUTPUT_LANGUAGES.find((l) => l.code === code);
  return row?.label ?? "English";
}

/** Read `lang` from request URL (GET search params work for POST in Next.js). */
export function getAiOutputLanguageFromRequest(req: Request): AiOutputLanguageCode {
  try {
    const raw = new URL(req.url).searchParams.get("lang");
    return normalizeAiOutputLanguage(raw);
  } catch {
    return DEFAULT_AI_OUTPUT_LANGUAGE;
  }
}

/** Prompt line: all user-facing string values must be in this language. */
export function aiOutputLanguagePromptRule(lang: AiOutputLanguageCode): string {
  const name = aiOutputLanguageEnglishName(lang);
  return `All user-facing text (every string value meant for the candidate to read) must be written in ${name}. Keep JSON keys in English as specified.`;
}

export function buildAiGenerationQuery(opts: {
  regenerate: boolean;
  lang: string;
}): string {
  const p = new URLSearchParams();
  if (opts.regenerate) p.set("regenerate", "1");
  p.set("lang", normalizeAiOutputLanguage(opts.lang));
  return `?${p.toString()}`;
}

/** Legacy cover letters are plain text; new ones are JSON `{ text, outputLanguage }`. */
export function parseStoredCoverLetter(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  try {
    const j = JSON.parse(raw) as unknown;
    if (
      j &&
      typeof j === "object" &&
      "text" in j &&
      typeof (j as { text: unknown }).text === "string"
    ) {
      return (j as { text: string }).text;
    }
  } catch {
    /* plain text */
  }
  return raw;
}

export function serializeCoverLetterForStorage(
  text: string,
  lang: AiOutputLanguageCode
): string {
  return JSON.stringify({
    text,
    outputLanguage: lang,
  });
}

export function parseStoredCoverLetterMeta(raw: string | null | undefined): {
  text: string;
  outputLanguage: AiOutputLanguageCode;
} {
  if (!raw?.trim()) {
    return { text: "", outputLanguage: DEFAULT_AI_OUTPUT_LANGUAGE };
  }
  try {
    const j = JSON.parse(raw) as unknown;
    if (
      j &&
      typeof j === "object" &&
      "text" in j &&
      typeof (j as { text: unknown }).text === "string"
    ) {
      const o = j as { text: string; outputLanguage?: string };
      return {
        text: o.text,
        outputLanguage: normalizeAiOutputLanguage(o.outputLanguage),
      };
    }
  } catch {
    /* legacy */
  }
  return { text: raw, outputLanguage: DEFAULT_AI_OUTPUT_LANGUAGE };
}
