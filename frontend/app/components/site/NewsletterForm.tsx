"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/lib/api";
import { ROUTES } from "@/lib/site";
import { applyServerError, FormAlert, SubmitButton } from "../form";
import { Captcha, CAPTCHA_ENABLED, type CaptchaHandle } from "./Captcha";

// Mirrors backend/app/schemas/newsletter_schema.py.
const newsletterSchema = z.object({
  email: z.string().trim().min(1, "Please enter your email.").pipe(z.email("Please enter a valid email address.")),
  consent: z.boolean().refine(Boolean, "Please tick the box to agree to receive our emails."),
  captcha: z
    .string()
    .nullable()
    .refine((token) => !CAPTCHA_ENABLED || Boolean(token), "Please complete the security check."),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const id = useId();
  const captchaRef = useRef<CaptchaHandle>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "", consent: false, captcha: null },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api.post("/newsletter", values);
      setDone(true);
    } catch (err) {
      applyServerError(err, ["email", "consent", "captcha"], setError, setFormError);
    } finally {
      setValue("captcha", null);
      captchaRef.current?.reset();
    }
  });

  if (done) {
    return (
      <p className="newsletter__done" role="status">
        Thanks for subscribing. Look out for the next Planit Brief in your inbox.
      </p>
    );
  }

  const emailError = errors.email?.message;
  const consentError = errors.consent?.message;

  return (
    <form className="newsletter__form" onSubmit={onSubmit} noValidate>
      <FormAlert message={formError} />
      <div className="newsletter__row">
        <label className="sr-only" htmlFor={`${id}-email`}>
          Email address
        </label>
        <input
          id={`${id}-email`}
          className="field__input"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? `${id}-email-error` : undefined}
          {...register("email")}
        />
        <SubmitButton pending={isSubmitting}>{isSubmitting ? "Subscribing…" : "Subscribe"}</SubmitButton>
      </div>
      {emailError && (
        <p id={`${id}-email-error`} className="field__error">
          {emailError}
        </p>
      )}

      <label className="check">
        <input
          type="checkbox"
          aria-invalid={consentError ? true : undefined}
          aria-describedby={consentError ? `${id}-consent-error` : undefined}
          {...register("consent")}
        />
        <span>
          I agree to receive the Planit Brief by email, and know I can ask to unsubscribe at any time. See our{" "}
          <Link href={ROUTES.privacyPolicy}>Privacy Policy</Link>.
        </span>
      </label>
      {consentError && (
        <p id={`${id}-consent-error`} className="field__error">
          {consentError}
        </p>
      )}

      <Captcha
        ref={captchaRef}
        onToken={(token) => setValue("captcha", token, { shouldValidate: isSubmitted })}
        error={errors.captcha?.message}
      />
    </form>
  );
}
