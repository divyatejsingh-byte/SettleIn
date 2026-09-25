"use client";

import { useState } from "react";

interface NumberFieldProps {
  id: string;
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * A number input that allows transient empty/partial text while typing and
 * only commits valid values upward. Shows the committed value when not editing.
 */
export default function NumberField({
  id,
  value,
  onCommit,
  min = 0,
  step = 1,
  prefix,
  suffix,
  className = "",
  "aria-label": ariaLabel,
}: NumberFieldProps) {
  // `base` is the committed value the draft text belongs to. If the value changes
  // from outside (e.g. "Load Roommate Defaults"), the stale draft is ignored.
  const [draft, setDraft] = useState<{ text: string; base: number } | null>(null);
  const shown = draft !== null && draft.base === value ? draft.text : String(value);

  return (
    <div
      className={`flex items-center rounded-xl border border-stone-200 bg-white px-3 transition focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 ${className}`}
    >
      {prefix && <span className="mr-1 text-sm text-stone-400">{prefix}</span>}
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        step={step}
        aria-label={ariaLabel}
        value={shown}
        onChange={(event) => {
          const text = event.target.value;
          const parsed = Number(text);
          const valid = text.trim() !== "" && Number.isFinite(parsed) && parsed >= min;
          setDraft({ text, base: valid ? parsed : value });
          if (valid) onCommit(parsed);
        }}
        onBlur={() => setDraft(null)}
        className="w-full min-w-0 bg-transparent py-2 text-sm font-semibold text-stone-800 outline-none"
      />
      {suffix && <span className="ml-1 whitespace-nowrap text-xs text-stone-400">{suffix}</span>}
    </div>
  );
}
