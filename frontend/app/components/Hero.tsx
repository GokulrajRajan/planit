"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { ROUTES } from "@/lib/site";
import { pauseClip, playClip, useMotion } from "./motion";
import { SmartLink } from "./site/SmartLink";

type HeroClip = {
  name: string;
  /** Width / height. */
  ar: number;
  /** At the top of the page: centre from the middle of the stage, and height, in --u (the middle clip's height). */
  a: { x: number; y: number; h: number };
  /** Around the glass dashboard: centre from the middle of the stage, and width, in card widths. */
  b: { x: number; y: number; w: number };
  dur: number;
  delay: number;
};

// The client's clips in /public/hero: silent, with their ends faded into their starts so they loop smoothly.
// Third-party clips: their use depends on the client holding the owners' permission (confirmed Nov 2026).
// market-chart is cut to the chart only; the rest of that video shows trade calls and an advert.
const CLIPS: HeroClip[] = [
  { name: "market-chart", ar: 9 / 16, a: { x: -0.58, y: 0.05, h: 0.78 }, b: { x: -1.02, y: -0.26, w: 0.4 }, dur: 8, delay: -2 },
  { name: "bull-bear", ar: 420 / 626, a: { x: 0.63, y: 0.04, h: 0.78 }, b: { x: 1.04, y: 0.1, w: 0.46 }, dur: 7, delay: -4 },
  { name: "savings", ar: 9 / 16, a: { x: 0, y: 0, h: 1 }, b: { x: -0.88, y: 0.46, w: 0.34 }, dur: 9, delay: -1 },
];
const MIDDLE = CLIPS.length - 1;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
/** Maps v from [a, b] onto [0, 1]. */
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const jag = (x: number, t: number) =>
  Math.sin(x * 0.019 + t * 0.5) * 0.5 +
  Math.sin(x * 0.047 - t * 0.7) * 0.28 +
  Math.abs(Math.sin(x * 0.11 + t * 0.9)) * 0.22 +
  Math.sin(x * 0.29 - t * 0.4) * 0.06;

const ROLL = Array.from({ length: 30 }, (_, i) => i % 10);

/**
 * Mechanical-counter digits. With `scrub`, each column rolls through two full cycles as the
 * inherited --od custom property goes from 0 to 1.
 */
export function Odometer({ value, scrub = false }: { value: string; scrub?: boolean }) {
  const chars = [...value];
  return (
    <>
      <span className="sr-only">{value}</span>
      <span className="odo" aria-hidden="true">
        {chars.map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="odo__col">
              <span
                className={scrub ? "odo__strip odo__strip--scrub" : "odo__strip"}
                style={
                  scrub
                    ? ({ "--t": 20 + Number(ch), "--k": (1 + (chars.length - i) * 0.08).toFixed(2) } as React.CSSProperties)
                    : { transform: `translateY(${-Number(ch)}em)` }
                }
              >
                {ROLL.map((d, k) => (
                  <span key={k}>{d}</span>
                ))}
              </span>
            </span>
          ) : (
            <span key={i}>{ch}</span>
          ),
        )}
      </span>
    </>
  );
}

// Uptrend stock line in a 100 x 60 box (y grows downwards): a steady climb with two pullbacks.
const TREND = Array.from({ length: 45 }, (_, i) => {
  const t = i / 44;
  const dip = Math.exp(-(((t - 0.36) / 0.07) ** 2)) * 0.14 + Math.exp(-(((t - 0.7) / 0.05) ** 2)) * 0.1;
  const noise = (Math.sin(i * 1.73) * 0.55 + Math.sin(i * 0.61 + 1.1) * 0.3 + Math.sin(i * 3.91 + 0.4) * 0.15) * (1 - t * 0.5);
  return [Number((t * 100).toFixed(1)), Number(((0.9 - Math.pow(t, 1.3) * 0.78 + dip + noise * 0.07) * 60).toFixed(2))];
});
const TREND_LINE = TREND.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
const [TREND_X, TREND_Y] = TREND[TREND.length - 1];

/** Line chart that draws itself in, then keeps a glint running up the line and a pulse on the latest value. */
function TrendChart() {
  const fill = useId();
  return (
    <svg className="glass__chart" viewBox="0 0 100 60">
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f69322" stopOpacity="0.22" />
          <stop offset="1" stopColor="#f69322" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[12, 30, 48].map((y) => (
        <line key={y} className="glass__chart-grid" x1="0" x2="100" y1={y} y2={y} />
      ))}
      <g className="glass__chart-plot">
        <path d={`${TREND_LINE}L100 60L0 60Z`} fill={`url(#${fill})`} />
        <path className="glass__chart-line" d={TREND_LINE} />
        <path className="glass__chart-glint" d={TREND_LINE} pathLength={1} />
      </g>
      <circle className="glass__chart-pulse" cx={TREND_X} cy={TREND_Y} r="2.2" />
      <circle className="glass__chart-dot" cx={TREND_X} cy={TREND_Y} r="2.2" />
    </svg>
  );
}

/**
 * Frosted sample portfolio dashboard; sized by the `--card-w` custom property on an ancestor.
 * Every figure on it is made up, so it always carries the "Illustrative example" label.
 */
export function GlassPortfolio({ value, scrub = false, chart = false }: { value: number; scrub?: boolean; chart?: boolean }) {
  return (
    <div className="hero__glass">
      <div className="glass__top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4" />
        </svg>
        <span>Portfolio</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="10" r="3" />
          <path d="M6.5 17.5c1.5-2 3.4-3 5.5-3s4 1 5.5 3" />
        </svg>
      </div>
      <div className="glass__tag">Illustrative example</div>
      <div className="glass__value">
        <Odometer value={`₹${Math.floor(value).toLocaleString("en-IN")}`} scrub={scrub} />
      </div>
      <div className="glass__delta">Sample portfolio value · not real returns</div>
      {chart && <TrendChart />}
      <div className="glass__ranges">
        {["1M", "3M", "6M", "1Y", "3Y", "ALL"].map((r) => (
          <span key={r} className={r === "ALL" ? "is-active" : undefined}>
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Pinned for one extra viewport of scrolling. That scroll drives the whole intro: the clips shrink and
 * move aside, the glass dashboard grows in between them, its number rolls and the line becomes a stock
 * chart. Only the clips, the line's gentle wiggle and the background drift run on their own.
 */
export function Hero({ startSipUrl }: { startSipUrl: string | null }) {
  const { paused } = useMotion();
  const sceneRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const timeRef = useRef(0);
  const progressRef = useRef<number | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const hero = heroRef.current;
    const stage = stageRef.current;
    const card = cardRef.current;
    const path = pathRef.current;
    const svg = svgRef.current;
    if (!scene || !hero || !stage || !card || !path || !svg) return;

    // dx, dy and scale take each clip from its place at the top of the page to its place by the dashboard.
    const clips = [...hero.querySelectorAll<HTMLElement>("[data-clip]")].map((el) => ({
      el,
      b: CLIPS[Number(el.dataset.clip)].b,
      dx: 0,
      dy: 0,
      scale: 1,
    }));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let applied = -1;
    // The card (c…) and the middle clip (p…), in px from the hero's top left.
    const g = { cl: 0, ct: 0, cw: 0, ch: 0, pl: 0, pt: 0, pw: 0, ph: 0 };
    const measure = () => {
      const hr = hero.getBoundingClientRect();
      // The card and the clips are placed by their centres; offsets ignore the transforms that centre them.
      const cx = stage.offsetLeft + stage.offsetWidth / 2;
      const cy = stage.offsetTop + stage.offsetHeight / 2;
      g.cw = card.offsetWidth;
      g.ch = card.offsetHeight;
      g.cl = cx - g.cw / 2;
      g.ct = cy - g.ch / 2;
      clips.forEach((clip, i) => {
        const x = stage.offsetLeft + clip.el.offsetLeft;
        const y = stage.offsetTop + clip.el.offsetTop;
        const w = clip.el.offsetWidth;
        const h = clip.el.offsetHeight;
        clip.dx = cx + clip.b.x * g.cw - x;
        clip.dy = cy + clip.b.y * g.cw - y;
        clip.scale = w ? (clip.b.w * g.cw) / w : 1;
        if (i === MIDDLE) Object.assign(g, { pl: x - w / 2, pt: y - h / 2, pw: w, ph: h });
      });
      svg.setAttribute("viewBox", `0 0 ${hr.width} ${hr.height}`);
      // Re-place the clips on the next frame.
      applied = -1;
    };

    const scrollProgress = () => {
      const r = scene.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? clamp01(-r.top / span) : 0;
    };

    const apply = (h: number) => {
      const t = smooth(seg(h, 0.08, 0.7));
      for (const { el, dx, dy, scale } of clips) {
        el.style.transform = `translate(-50%, -50%) translate(${(dx * t).toFixed(1)}px, ${(dy * t).toFixed(1)}px) scale(${(1 + (scale - 1) * t).toFixed(4)})`;
      }
      hero.style.setProperty("--gl", smooth(seg(h, 0.25, 0.8)).toFixed(4));
      hero.style.setProperty("--od", seg(h, 0.35, 0.95).toFixed(4));
      hero.style.setProperty("--bgp", h.toFixed(4));
    };

    const draw = (t: number, mix: number) => {
      const { cl, ct, cw, ch, pl, pt, pw, ph } = g;
      if (!cw) return;

      // At the top, the line runs in from the left and climbs across the middle clip.
      const ps = ph * 0.67;
      const xEnd = pl + pw * 0.8 + (cl + cw * 0.93 - (pl + pw * 0.8)) * mix;

      let d = "";
      for (let x = -12; x <= xEnd; x += 6) {
        // Smooth deep waves that flatten towards the middle clip, then climb into a spike inside it.
        const k = clamp01(x / pl);
        const wave =
          (Math.sin(x * 0.0105 + t * 0.55) * 0.62 + Math.sin(x * 0.024 - t * 0.85 + 1.3) * 0.38) *
          ps *
          0.62 *
          Math.pow(1 - k, 0.65);
        const u = clamp01((x - pl) / (pw * 0.8));
        const spike = smooth((x - pl + 40) / 80) * ps * (0.52 * Math.pow(u, 2.4) + 0.05 * Math.sin(x * 0.08 + t * 1.6));
        const yPhoto = pt + ph * 0.66 + wave - spike;

        // Jagged stock line rising from the lower left into the dashboard's chart band.
        const r = clamp01(x / cl);
        const low = ct + ch * 1.05;
        const band = ct + ch * 0.52;
        const trend = low + (band - low) * Math.pow(r, 0.4);
        const inCard = x > cl ? (-(x - cl) / cw) * ch * 0.1 : 0;
        const yStock = trend + jag(x, t) * ch * (0.22 * Math.pow(1 - r, 1.4) + 0.05) + inCard;

        const y = yPhoto + (yStock - yPhoto) * mix;
        d += `${d ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      path.setAttribute("d", d);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);

    let raf = 0;
    let visible = true;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // The line's idle wiggle is a self-running loop, so reduced motion holds it still.
      if (!paused && !reduced) timeRef.current += dt;

      // Ease towards the scroll position so wheel steps glide instead of jumping.
      const target = scrollProgress();
      const prev = progressRef.current ?? target;
      const h = Math.abs(target - prev) < 0.0005 ? target : prev + (target - prev) * 0.12;
      progressRef.current = h;

      // Custom properties restyle the whole hero, so only touch them when the progress moved.
      if (h !== applied) {
        apply(h);
        applied = h;
      }
      draw(timeRef.current, smooth(seg(h, 0.1, 0.8)));
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    // Clips only decode while the hero is on screen and motion isn't paused.
    const videos = [...hero.querySelectorAll("video")];
    const syncVideos = () => {
      for (const v of videos) {
        if (visible && !paused) playClip(v);
        else pauseClip(v);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncVideos();
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(scene);
    syncVideos();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [paused]);

  return (
    <section ref={sceneRef} className="hero-scene" aria-label="Introduction">
      <div ref={heroRef} className="hero">
        <div className="hero__bg" aria-hidden="true" />

        <div ref={stageRef} className="hero__stage" aria-hidden="true">
          <div ref={cardRef} className="hero__card">
            <GlassPortfolio value={1248350} scrub />
          </div>

          {CLIPS.map((clip, i) => (
            <div
              key={clip.name}
              className="hero__clip"
              data-clip={i}
              style={
                {
                  "--ax": clip.a.x,
                  "--ay": clip.a.y,
                  "--ah": clip.a.h,
                  "--ar": clip.ar,
                  "--dur": `${clip.dur}s`,
                  "--delay": `${clip.delay}s`,
                } as React.CSSProperties
              }
            >
              <div className="hero__bob">
                {/* Muted and looping, with its poster frame shown until it can play. */}
                <video
                  className="hero__media"
                  src={`/hero/${clip.name}.mp4`}
                  poster={`/hero/${clip.name}.jpg`}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="auto"
                  disablePictureInPicture
                />
              </div>
            </div>
          ))}
        </div>

        <svg ref={svgRef} className="hero__line" aria-hidden="true" preserveAspectRatio="none">
          <path ref={pathRef} pathLength={1} />
        </svg>

        <div className="hero__copy">
          <h1 className="hero__title">Start early. Invest with a plan.</h1>
          <p className="hero__sub">
            Mutual funds, SIPs and goal planning, explained simply and reviewed regularly.
            {/* HIDDEN_LEGAL: the line ended: , with every commission disclosed. */}
          </p>
          <div className="hero__actions">
            <Link href={ROUTES.contact} className="pill pill--dark pill--lg">
              Book a Free Consultation
            </Link>
            {startSipUrl && (
              <SmartLink href={startSipUrl} className="pill pill--outline pill--lg">
                Start a SIP
              </SmartLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
