"use client";

import { Fragment, useEffect, useRef } from "react";

/**
 * Staggers its text line by line against the enclosing <Scene>'s --reveal progress.
 * Order: every `[data-lines]` text (one step per rendered line) and `[data-block]` element in DOM order,
 * then any `[data-block="late"]` elements last. Each step gets a start threshold in --s.
 */
export function Reveal({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const assignThresholds = () => {
      const steps: HTMLElement[][] = [];
      const late: HTMLElement[] = [];
      el.querySelectorAll<HTMLElement>("[data-lines], [data-block]").forEach((node) => {
        if (node.hasAttribute("data-block")) {
          if (node.dataset.block === "late") late.push(node);
          else steps.push([node]);
          return;
        }
        let lineTop: number | null = null;
        node.querySelectorAll<HTMLElement>(".lr-word").forEach((word) => {
          if (lineTop === null || Math.abs(word.offsetTop - lineTop) > 4) {
            lineTop = word.offsetTop;
            steps.push([]);
          }
          steps[steps.length - 1].push(word);
        });
      });
      late.forEach((node) => steps.push([node]));

      const last = Math.max(1, steps.length - 1);
      steps.forEach((group, i) => {
        const start = ((i / last) * 0.7).toFixed(3);
        group.forEach((node) => node.style.setProperty("--s", start));
      });
    };

    assignThresholds();
    const ro = new ResizeObserver(assignThresholds);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} id={id}>
      {children}
    </div>
  );
}

/** Splits text into word spans so <Reveal> can group them into rendered lines. */
export function Lines({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span data-lines="">
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="lr-word">{w}</span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
