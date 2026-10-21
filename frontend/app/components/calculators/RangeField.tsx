"use client";

import { useId, useState } from "react";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A number box and a slider for the same value. Typing outside the range snaps back on blur. */
export function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  unit,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  /** Read out after the label by screen readers, e.g. "rupees" or "percent a year". */
  unit: string;
}) {
  const id = useId();
  // What the visitor is typing, kept separately so a half-typed number isn't clamped mid-keystroke.
  const [draft, setDraft] = useState<string | null>(null);
  const fill = ((clamp(value, min, max) - min) / (max - min)) * 100;

  const commit = (raw: string) => {
    const parsed = Number(raw);
    onChange(raw.trim() === "" || !Number.isFinite(parsed) ? min : clamp(parsed, min, max));
    setDraft(null);
  };

  return (
    <div className="calc-field">
      <div className="calc-field__head">
        <label htmlFor={id}>
          {label}
          <span className="sr-only"> ({unit})</span>
        </label>
        <span className="calc-field__input">
          {prefix && <span aria-hidden="true">{prefix}</span>}
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={draft ?? String(value)}
            onChange={(event) => {
              const raw = event.target.value;
              setDraft(raw);
              const parsed = Number(raw);
              if (raw.trim() !== "" && Number.isFinite(parsed) && parsed >= min && parsed <= max) onChange(parsed);
            }}
            onBlur={(event) => commit(event.target.value)}
          />
          {suffix && <span aria-hidden="true">{suffix}</span>}
        </span>
      </div>
      <input
        className="calc-field__range"
        type="range"
        aria-label={`${label} (${unit})`}
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
        onChange={(event) => {
          setDraft(null);
          onChange(Number(event.target.value));
        }}
      />
    </div>
  );
}
