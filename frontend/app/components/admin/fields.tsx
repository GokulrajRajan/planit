"use client";

import { useId } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseFormRegisterReturn,
  type UseFormSetError,
} from "react-hook-form";
import { toast } from "sonner";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ApiError } from "@/lib/api";

/**
 * Puts server validation errors on the matching fields (names may be dotted, e.g. "office.pincode").
 * Returns true when at least one landed on a field; otherwise the message is shown as a toast.
 */
export function placeFieldErrors<T extends FieldValues>(error: ApiError, setError: UseFormSetError<T>) {
  const entries = Object.entries(error.fieldErrors);
  entries.forEach(([field, message], i) => setError(field as FieldPath<T>, { message }, { shouldFocus: i === 0 }));
  if (entries.length) toast.error("Please fix the highlighted fields.");
  return entries.length > 0;
}

type Common = { label: string; hint?: React.ReactNode; error?: string; optional?: boolean; className?: string };

function Label({ htmlFor, label, optional }: { htmlFor: string; label: string; optional?: boolean }) {
  return (
    <FieldLabel htmlFor={htmlFor}>
      {label}
      {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
    </FieldLabel>
  );
}

function Messages({ id, hint, error }: { id: string; hint?: React.ReactNode; error?: string }) {
  return (
    <>
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </>
  );
}

const describedBy = (id: string, hint?: React.ReactNode, error?: string) =>
  [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;

export function TextField({
  label,
  hint,
  error,
  optional,
  className,
  registration,
  ...input
}: Common & { registration: UseFormRegisterReturn } & Omit<React.ComponentProps<"input">, "name">) {
  const id = useId();
  return (
    <Field data-invalid={!!error || undefined} className={className}>
      <Label htmlFor={id} label={label} optional={optional} />
      <Input
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...input}
        {...registration}
      />
      <Messages id={id} hint={hint} error={error} />
    </Field>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  optional,
  className,
  registration,
  ...textarea
}: Common & { registration: UseFormRegisterReturn } & Omit<React.ComponentProps<"textarea">, "name">) {
  const id = useId();
  return (
    <Field data-invalid={!!error || undefined} className={className}>
      <Label htmlFor={id} label={label} optional={optional} />
      <Textarea
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...textarea}
        {...registration}
      />
      <Messages id={id} hint={hint} error={error} />
    </Field>
  );
}

export type Option = { value: string; label: string };

/** A select whose empty choice maps to null in the form value. */
export function SelectField<T extends FieldValues>({
  label,
  hint,
  error,
  optional,
  className,
  control,
  name,
  options,
  placeholder = "Choose…",
}: Common & { control: Control<T>; name: FieldPath<T>; options: Option[]; placeholder?: string }) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field data-invalid={!!error || undefined} className={className}>
          <Label htmlFor={id} label={label} optional={optional} />
          <Select
            items={options}
            value={field.value ?? null}
            onValueChange={(value) => field.onChange(value)}
            name={field.name}
          >
            <SelectTrigger
              id={id}
              ref={field.ref}
              onBlur={field.onBlur}
              className="w-full"
              aria-invalid={!!error || undefined}
              aria-describedby={describedBy(id, hint, error)}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Messages id={id} hint={hint} error={error} />
        </Field>
      )}
    />
  );
}

export function SwitchField<T extends FieldValues>({
  label,
  hint,
  control,
  name,
}: {
  label: string;
  hint?: React.ReactNode;
  control: Control<T>;
  name: FieldPath<T>;
}) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field orientation="horizontal" className="items-start">
          <Switch
            id={id}
            checked={!!field.value}
            onCheckedChange={(checked) => field.onChange(checked)}
            onBlur={field.onBlur}
            aria-describedby={hint ? `${id}-hint` : undefined}
            className="mt-0.5"
          />
          <div className="space-y-0.5">
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
          </div>
        </Field>
      )}
    />
  );
}

/** Turns empty strings into null before sending, so cleared optional fields are saved as empty. */
export function nullIfEmpty<T extends Record<string, unknown>>(values: T): T {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, typeof value === "string" && value.trim() === "" ? null : value]),
  ) as T;
}
