"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type FieldValues, type Path, type UseFormRegisterReturn, type UseFormSetError } from "react-hook-form";
import { z } from "zod";
import { toApiError } from "@/lib/api";
import { login, register as registerAccount } from "@/lib/auth";

// Mirrors backend/app/schemas/auth_schema.py so most mistakes are caught before a round trip.
const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter at least 2 characters.").max(120, "Please keep it under 120 characters."),
  email: z.string().trim().min(1, "Please enter your email.").pipe(z.email("Please enter a valid email address.")),
  password: z.string().min(8, "Use at least 8 characters.").max(128, "Please keep it under 128 characters."),
});

const loginSchema = z.object({
  email: z.string().trim().min(1, "Please enter your email.").pipe(z.email("Please enter a valid email address.")),
  password: z.string().min(1, "Please enter your password."),
});

type RegisterValues = z.infer<typeof registerSchema>;
type LoginValues = z.infer<typeof loginSchema>;

/** Routes server-side errors to the matching field where possible, otherwise to the form-level alert. */
function applyServerError<T extends FieldValues>(
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
  if (e.status === 409 && fields.includes("email" as Path<T>)) {
    setError("email" as Path<T>, { message: `${e.message}.` });
    placed = true;
  }
  if (!placed) setFormError(e.message);
}

function Field({
  label,
  error,
  hint,
  type = "text",
  registration,
  ...input
}: {
  label: string;
  error?: string;
  hint?: string;
  type?: "text" | "email" | "password";
  registration: UseFormRegisterReturn;
  autoComplete: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        <input
          id={id}
          className="field__input"
          type={type === "password" && visible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
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

function FormAlert({ message }: { message: string | null }) {
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

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" className="pill pill--dark pill--lg auth__submit" disabled={pending} aria-busy={pending}>
      {pending && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), mode: "onTouched" });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerAccount(values);
      router.push("/");
    } catch (err) {
      applyServerError(err, ["name", "email", "password"], setError, setFormError);
    }
  });

  return (
    <div className="auth__card">
      <h1 className="auth__title">Let&rsquo;s get started</h1>
      <p className="auth__sub">Create your free Planit account. It takes less than a minute.</p>

      <form onSubmit={onSubmit} noValidate>
        <FormAlert message={formError} />
        <Field
          label="Full name"
          autoComplete="name"
          placeholder="Jane Doe"
          autoFocus
          registration={register("name")}
          error={errors.name?.message}
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          registration={register("email")}
          error={errors.email?.message}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          registration={register("password")}
          error={errors.password?.message}
        />
        <SubmitButton pending={isSubmitting}>{isSubmitting ? "Creating your account…" : "Create account"}</SubmitButton>
        <p className="auth__legal">By creating an account, you agree to Planit&rsquo;s Terms of Service and Privacy Policy.</p>
      </form>

      <p className="auth__switch">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values);
      router.push("/");
    } catch (err) {
      applyServerError(err, ["email", "password"], setError, setFormError);
    }
  });

  return (
    <div className="auth__card">
      <h1 className="auth__title">Welcome back</h1>
      <p className="auth__sub">Log in to keep writing.</p>

      <form onSubmit={onSubmit} noValidate>
        <FormAlert message={formError} />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          autoFocus
          registration={register("email")}
          error={errors.email?.message}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          registration={register("password")}
          error={errors.password?.message}
        />
        <SubmitButton pending={isSubmitting}>{isSubmitting ? "Logging in…" : "Log in"}</SubmitButton>
      </form>

      <p className="auth__switch">
        New to Planit? <Link href="/register">Create an account</Link>
      </p>
    </div>
  );
}
