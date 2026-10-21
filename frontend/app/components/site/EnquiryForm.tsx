"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/lib/api";
import { ENQUIRY_SERVICE_OPTIONS, ROUTES } from "@/lib/site";
import { applyServerError, Field, FormAlert, SelectField, SubmitButton, TextAreaField } from "../form";
import { Captcha, CAPTCHA_ENABLED, type CaptchaHandle } from "./Captcha";

const isPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").length;
  return /^\+?[0-9][0-9 ()-]*$/.test(value) && digits >= 7 && digits <= 15;
};

// Mirrors backend/app/schemas/enquiry_schema.py so most mistakes are caught before a round trip.
const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120, "Please keep it under 120 characters."),
  phone: z.string().trim().min(1, "Please enter your phone number.").refine(isPhone, "Please enter a valid phone number."),
  email: z.string().trim().min(1, "Please enter your email.").pipe(z.email("Please enter a valid email address.")),
  city: z.string().trim().max(80, "Please keep it under 80 characters."),
  service: z.string(),
  message: z.string().trim().max(2000, "Please keep your message under 2,000 characters."),
  captcha: z
    .string()
    .nullable()
    .refine((token) => !CAPTCHA_ENABLED || Boolean(token), "Please complete the security check."),
});

type EnquiryValues = z.infer<typeof enquirySchema>;

const FIELDS = ["name", "phone", "email", "city", "service", "message", "captcha"] as const;

/** The site-wide enquiry form. `defaultService` pre-selects a service (e.g. on a service page). */
export function EnquiryForm({ defaultService = "" }: { defaultService?: string }) {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", email: "", city: "", service: defaultService, message: "", captcha: null },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api.post("/enquiries", values);
      reset();
      setSent(true);
    } catch (err) {
      applyServerError(err, [...FIELDS], setError, setFormError);
    } finally {
      // A captcha token works once, so ask for a fresh one whatever happened.
      setValue("captcha", null);
      captchaRef.current?.reset();
    }
  });

  if (sent) {
    return (
      <div className="enquiry__done" role="status">
        <h3>Thank you</h3>
        <p>We&rsquo;ve received your enquiry and will get back to you shortly.</p>
        <button type="button" className="pill pill--outline" onClick={() => setSent(false)}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form className="enquiry" onSubmit={onSubmit} noValidate>
      <FormAlert message={formError} />
      <div className="enquiry__grid">
        <Field label="Full name" autoComplete="name" registration={register("name")} error={errors.name?.message} />
        <Field
          label="Phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          registration={register("phone")}
          error={errors.phone?.message}
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
          label="City"
          optional
          autoComplete="address-level2"
          registration={register("city")}
          error={errors.city?.message}
        />
        <SelectField
          className="enquiry__full"
          label="What would you like help with?"
          optional
          placeholder="Choose a service"
          options={ENQUIRY_SERVICE_OPTIONS}
          registration={register("service")}
          error={errors.service?.message}
        />
        <TextAreaField
          className="enquiry__full"
          label="Message"
          optional
          placeholder="Tell us a little about your goals or questions."
          registration={register("message")}
          error={errors.message?.message}
        />
      </div>

      <Captcha
        ref={captchaRef}
        onToken={(token) => setValue("captcha", token, { shouldValidate: isSubmitted })}
        error={errors.captcha?.message}
      />

      <p className="enquiry__note">
        By sending this form you agree that Planit may contact you about your enquiry. See our{" "}
        <Link href={ROUTES.privacyPolicy}>Privacy Policy</Link>.
      </p>
      <SubmitButton pending={isSubmitting} className="enquiry__submit">
        {isSubmitting ? "Sending…" : "Send enquiry"}
      </SubmitButton>
    </form>
  );
}
