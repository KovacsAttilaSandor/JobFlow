"use client";

import { useEffect, useState } from "react";
import {
  AI_OUTPUT_LANGUAGES,
  DEFAULT_AI_OUTPUT_LANGUAGE,
  normalizeAiOutputLanguage,
} from "@/lib/ai-output-language";

const STORAGE_KEY = "jobflow-ai-output-lang";

export function useAiOutputLanguage() {
  const [lang, setLangState] = useState(DEFAULT_AI_OUTPUT_LANGUAGE);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setLangState(normalizeAiOutputLanguage(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (code: string) => {
    const n = normalizeAiOutputLanguage(code);
    setLangState(n);
    try {
      localStorage.setItem(STORAGE_KEY, n);
    } catch {
      /* ignore */
    }
  };

  return { lang, setLang };
}

type SelectProps = {
  id: string;
  lang: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  /** Tailwind-friendly classes for the <select> element */
  selectClassName?: string;
  labelClassName?: string;
};

export function AiOutputLanguageSelect({
  id,
  lang,
  onChange,
  disabled,
  selectClassName,
  labelClassName,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={
          labelClassName ??
          "text-[11px] font-medium uppercase tracking-wide text-slate-500"
        }
      >
        Output language
      </label>
      <select
        id={id}
        value={lang}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={
          selectClassName ??
          "w-full min-w-[140px] rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
        }
      >
        {AI_OUTPUT_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
