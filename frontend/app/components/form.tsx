"use client";

import { useId, useState } from "react";
import type { FieldValues, Path, UseFormRegisterReturn, UseFormSetError } from "react-hook-form";
import { toApiError } from "@/lib/api";

/** Routes server-side errors to the matching field where possible, otherwise to the form-level alert. */
export function applyServerError<T extends FieldValues>(
  err: unknown,
  fields: Path<T>[],
  setError: UseFormSetError<T>,
  setFormError: (msg: string) => void,
) {
  const e = toApiError(err);
  let placed = false;
  for (const field of fields) {
    const message = e.fieldErrors[field];
    if (message) {
      setError(field, { message });
      placed = true;
    }
  }
  if (!placed) setFormError(e.message);
}

type ControlProps = { id: string; "aria-invalid"?: true; "aria-describedby"?: string };

/** Label, error and hint wiring shared by every field type. */
function FieldFrame({
  label,
  optional,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: (control: ControlProps) => React.ReactNode;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={`field ${className ?? ""}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="field__optional"> (optional)</span>}
      </label>
      <div className="field__control">
        {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      </div>
      {error ? (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="field__hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

type CommonFieldProps = {
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  registration: UseFormRegisterReturn;
};

export function Field({
  label,
  optional,
  error,
  hint,
  className,
  type = "text",
  registration,
  ...input
}: CommonFieldProps & {
  type?: "text" | "email" | "password" | "tel";
  autoComplete: string;
  placeholder?: string;
  autoFocus?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const [visible, setVisible] = useState(false);

  return (
    <FieldFrame label={label} optional={optional} error={error} hint={hint} className={className}>
      {(control) => (
        <>
          <input
            className="field__input"
            type={type === "password" && visible ? "text" : type}
            {...control}
            {...input}
            {...registration}
          />
          {type === "password" && (
            <button
              type="button"
              className="field__toggle"
              aria-label={visible ? "Hide password" : "Show password"}
              aria-pressed={visible}
              onClick={() => setVisible((v) => !v)}
            >
              {visible ? "Hide" : "Show"}
            </button>
          )}
        </>
      )}
    </FieldFrame>
  );
}

export function SelectField({
  label,
  optional,
  error,
  hint,
  className,
  registration,
  options,
  placeholder,
}: CommonFieldProps & { options: { label: string; value: string }[]; placeholder: string }) {
  return (
    <FieldFrame label={label} optional={optional} error={error} hint={hint} className={className}>
      {(control) => (
        <select className="field__input field__input--select" {...control} {...registration}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldFrame>
  );
}

export function TextAreaField({
  label,
  optional,
  error,
  hint,
  className,
  registration,
  rows = 4,
  placeholder,
}: CommonFieldProps & { rows?: number; placeholder?: string }) {
  return (
    <FieldFrame label={label} optional={optional} error={error} hint={hint} className={className}>
      {(control) => (
        <textarea
          className="field__input field__input--textarea"
          rows={rows}
          placeholder={placeholder}
          {...control}
          {...registration}
        />
      )}
    </FieldFrame>
  );
}

export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="auth__alert" role="alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5v.01" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

export function SubmitButton({
  pending,
  className = "",
  children,
}: {
  pending: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="submit" className={`pill pill--dark pill--lg ${className}`} disabled={pending} aria-busy={pending}>
      {pending && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
