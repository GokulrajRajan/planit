"use client";

import { useEffect, useEffectEvent, useImperativeHandle, useRef, useState, type Ref } from "react";

type Turnstile = {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

// Cloudflare Turnstile, matching the API's default CAPTCHA_VERIFY_URL. Switching to hCaptcha or
// reCAPTCHA means changing this file and the API's CAPTCHA_VERIFY_URL together.
const SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY ?? "";
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Without a site key (local development) no widget is shown, and the API skips the check too. */
export const CAPTCHA_ENABLED = SITE_KEY !== "";

let loading: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
  loading ??= new Promise<Turnstile>((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile unavailable")));
    script.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(script);
  }).catch((err) => {
    loading = null; // let the next form on the page try again
    throw err;
  });
  return loading;
}

export type CaptchaHandle = { reset: () => void };

export function Captcha({
  onToken,
  error,
  ref,
}: {
  /** Receives a fresh token, or null once it expires or the check fails. */
  onToken: (token: string | null) => void;
  error?: string;
  ref?: Ref<CaptchaHandle>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const handleToken = useEffectEvent(onToken);

  useEffect(() => {
    if (!CAPTCHA_ENABLED) return;
    let cancelled = false;
    loadTurnstile().then(
      (turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetRef.current = turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          size: "flexible",
          theme: "light",
          callback: (token: string) => handleToken(token),
          "expired-callback": () => handleToken(null),
          "error-callback": () => handleToken(null),
        });
      },
      () => {
        if (!cancelled) setLoadFailed(true);
      },
    );
    return () => {
      cancelled = true;
      if (widgetRef.current) window.turnstile?.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, []);

  // Tokens are single-use, so the form resets the widget after every submission.
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetRef.current) window.turnstile?.reset(widgetRef.current);
    },
  }));

  if (!CAPTCHA_ENABLED) return null;
  return (
    <div className="captcha">
      <div ref={containerRef} />
      {loadFailed ? (
        <p className="field__error">We couldn&rsquo;t load the security check. Please refresh the page, or call us instead.</p>
      ) : (
        error && <p className="field__error">{error}</p>
      )}
    </div>
  );
}
