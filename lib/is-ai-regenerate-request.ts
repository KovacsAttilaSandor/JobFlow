/** True when POST includes ?regenerate=1 (or true/yes) — skip DB cache and call the model. */
export function isAiRegenerateRequest(req: Request): boolean {
  try {
    const v = new URL(req.url).searchParams.get("regenerate");
    return v === "1" || v === "true" || v === "yes";
  } catch {
    return false;
  }
}
