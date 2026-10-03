"use client";

import { createContext, useCallback, useContext, useEffect, useEffectEvent, useRef, useState } from "react";

export type SceneState = {
  /** 0 when the section's top reaches the bottom of the viewport, 1 when it reaches the top. */
  enter: number;
  /** Progress through the pinned stretch (0 for unpinned scenes). */
  hold: number;
  /** Drives the line-by-line text reveal. */
  reveal: number;
  /** Drives the section's main illustration. */
  v: number;
  /** Transition into the next section as the slide releases (the phone's screen swipe). */
  swipe: number;
  /** 0 while the slide fills the screen, 1 once it has scrolled completely off the top. */
  exit: number;
  /** The whole life of the section, from entering to fully leaving. */
  total: number;
};

type Listener = (s: SceneState) => void;

const SceneContext = createContext<((fn: Listener) => () => void) | null>(null);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/** Calls `fn` with the enclosing <Scene>'s progress every time it changes. */
export function useSceneFrame(fn: Listener) {
  const listen = useContext(SceneContext);
  const onFrame = useEffectEvent(fn);
  useEffect(() => listen?.((s) => onFrame(s)), [listen]);
}

/**
 * A full-screen "slide". With `hold > 0` its first child stays pinned for `hold` extra viewports of
 * scrolling while its animations play; scrolling back up plays them in reverse.
 * Progress is exposed as CSS custom properties (--enter, --hold, --reveal, --v, --swipe, --exit, --total)
 * and to JS via useSceneFrame.
 */
export function Scene({
  id,
  className,
  style,
  hold = 0,
  children,
}: {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  hold?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [listeners] = useState(() => new Set<Listener>());
  const listen = useCallback(
    (fn: Listener) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    [listeners],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let pinnedLength = 0;
    let heightVh = 1;
    const measure = () => {
      const pinned = el.firstElementChild && getComputedStyle(el.firstElementChild).position === "sticky";
      heightVh = el.offsetHeight / window.innerHeight;
      pinnedLength = pinned ? Math.max(0, heightVh - 1) : 0;
    };

    const apply = (u: number) => {
      const hL = pinnedLength;
      const s: SceneState = {
        enter: clamp01(u),
        hold: hL ? clamp01((u - 1) / hL) : u >= 1 ? 1 : 0,
        reveal: clamp01((u - 0.4) / (0.55 + 0.45 * hL)),
        v: clamp01((u - 0.25) / (0.75 + 0.8 * hL)),
        // u reaches heightVh when the section's bottom edge meets the bottom of the viewport.
        swipe: smooth((u - heightVh) / 0.4),
        exit: clamp01(u - heightVh),
        total: clamp01(u / (2 + hL)),
      };
      for (const [key, value] of Object.entries(s)) el.style.setProperty(`--${key}`, value.toFixed(4));
      listeners.forEach((fn) => fn(s));
    };

    // u = how far the section has scrolled into view, in viewport heights. Eased towards the
    // scroll position so wheel steps glide instead of jumping.
    let current: number | null = null;
    let target = 0;
    let raf = 0;
    const loop = () => {
      raf = 0;
      if (current === null) return;
      const diff = target - current;
      // Jumps of more than a viewport (anchor links, restored scroll) land immediately.
      current = Math.abs(diff) < 0.0005 || Math.abs(diff) > 1 ? target : current + diff * 0.14;
      apply(current);
      if (current !== target) raf = requestAnimationFrame(loop);
    };
    const update = () => {
      target = (window.innerHeight - el.getBoundingClientRect().top) / window.innerHeight;
      if (current === null) {
        current = target;
        apply(current);
      } else if (!raf) {
        raf = requestAnimationFrame(loop);
      }
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, [listeners]);

  return (
    <SceneContext value={listen}>
      <section
        ref={ref}
        id={id}
        className={`${hold > 0 ? "scene--pinned " : ""}${className ?? ""}`}
        style={{ ...style, ...(hold > 0 ? { "--hold-len": hold } : null) } as React.CSSProperties}
      >
        {children}
      </section>
    </SceneContext>
  );
}
