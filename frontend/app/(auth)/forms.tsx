"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "@/lib/auth";
import { applyServerError, Field, FormAlert, SubmitButton } from "../components/form";

// Mirrors backend/app/schemas/auth_schema.py so most mistakes are caught before a round trip.
const loginSchema = z.object({
  email: z.string().trim().min(1, "Please enter your email.").pipe(z.email("Please enter a valid email address.")),
  password: z.string().min(1, "Please enter your password."),
});

type LoginValues = z.infer<typeof loginSchema>;

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
      <h1 className="auth__title">Admin login</h1>
      <p className="auth__sub">Sign in to manage the Planit website.</p>

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
        <SubmitButton pending={isSubmitting} className="auth__submit">
          {isSubmitting ? "Logging in…" : "Log in"}
        </SubmitButton>
      </form>
    </div>
  );
}
