"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

type MotionState = { paused: boolean; toggle: () => void };

const MotionContext = createContext<MotionState>({ paused: false, toggle: () => {} });

export function useMotion() {
  return useContext(MotionContext);
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const [override, setOverride] = useState<boolean | null>(null);
  const paused = override ?? reduced;

  return (
    <MotionContext.Provider value={{ paused, toggle: () => setOverride(!paused) }}>
      <div data-motion={paused ? "paused" : "running"}>{children}</div>
    </MotionContext.Provider>
  );
}

export function FloatingControls() {
  const { paused, toggle } = useMotion();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {chatOpen && (
        <div className="chat-pop" role="dialog" aria-label="Help">
          <h3>Hi there. How can we help?</h3>
          <p>Questions about writing, publishing or your account — our team usually replies within a day.</p>
          <a className="pill pill--dark" href="mailto:hello@planit.app">
            Message us
          </a>
        </div>
      )}
      <div className="floating">
        <button
          type="button"
          className="icon-btn"
          aria-label={chatOpen ? "Close help" : "Open help"}
          aria-expanded={chatOpen}
          onClick={() => setChatOpen((o) => !o)}
        >
          {chatOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
              <path d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.4-1.1A8.5 8.5 0 1 0 12 3.5z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={paused ? "Play animations" : "Pause animations"}
          aria-pressed={paused}
          onClick={toggle}
        >
          {paused ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4.5v15l12.5-7.5z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8.5 5v14M15.5 5v14" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
