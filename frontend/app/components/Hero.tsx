"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { useMotion } from "./motion";

/** x/y: tile centre relative to the card centre, in card widths. s: tile width in card widths. ar: width / height. */
type Pos = { x: number; y: number; s: number; ar?: number };

// Footage in /public/hero (Mixkit Stock Video Free License: commercial use, no attribution needed).
// The six video tiles share one 3x2 grid video (tiles.mp4, 240px cells) so the browser decodes a single
// stream; each tile copies its `cell` onto a canvas. `still` tiles are too small to read as video.
// a: around the photo (top of the page), b: around the glass dashboard. Measured from the reference video.
const ATLAS = { cols: 3, rows: 2, cell: 240 };

const TILES: { cell?: number; still?: string; a: Pos; b: Pos; dur: number; delay: number }[] = [
  { cell: 0, a: { x: 0.39, y: -0.66, s: 0.24 }, b: { x: -1.11, y: 0.05, s: 0.31 }, dur: 7, delay: 0 },
  { cell: 1, a: { x: 0.68, y: -0.56, s: 0.1 }, b: { x: 0.81, y: -0.24, s: 0.12 }, dur: 8, delay: -2 },
  { cell: 2, a: { x: -0.53, y: 0.1, s: 0.13, ar: 0.32 }, b: { x: 0.28, y: -0.56, s: 0.29 }, dur: 9, delay: -1 },
  { cell: 3, a: { x: 0.6, y: 0.12, s: 0.11, ar: 0.35 }, b: { x: -0.42, y: 0.19, s: 0.26 }, dur: 6.5, delay: -3 },
  { cell: 4, a: { x: -0.89, y: 0.39, s: 0.27 }, b: { x: -0.78, y: 0.78, s: 0.26 }, dur: 7.5, delay: -4 },
  { cell: 5, a: { x: -0.58, y: 0.53, s: 0.14 }, b: { x: -1.45, y: 0.62, s: 0.05 }, dur: 8.5, delay: -1.5 },
  { still: "park-reading", a: { x: -1.34, y: 0.53, s: 0.06 }, b: { x: 0.95, y: -0.7, s: 0.04 }, dur: 7, delay: -2.5 },
  { still: "kids-fountain", a: { x: -1.18, y: 0.31, s: 0.05 }, b: { x: -1.6, y: 0.2, s: 0.04 }, dur: 9.5, delay: -0.5 },
];

/** Grid-video cell as a background, shown until the canvas has drawn its first frame. */
function cellPoster(cell: number): React.CSSProperties {
  const col = cell % ATLAS.cols;
  const row = Math.floor(cell / ATLAS.cols);
  return {
    backgroundImage: "url(/hero/tiles.jpg)",
    backgroundSize: `${ATLAS.cols * 100}% ${ATLAS.rows * 100}%`,
    backgroundPosition: `${(col / (ATLAS.cols - 1)) * 100}% ${(row / (ATLAS.rows - 1)) * 100}%`,
  };
}

/** Muted looping clip with its poster frame shown until the video can play. */
function Clip({ name, className }: { name: string; className?: string }) {
  return (
    <video
      className={className}
      src={`/hero/${name}.mp4`}
      poster={`/hero/${name}.jpg`}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      disablePictureInPicture
    />
  );
}

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
          <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
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

/** Frosted "Reads" dashboard card; sized by the `--card-w` custom property on an ancestor. */
export function GlassReads({ reads, scrub = false, chart = false }: { reads: number; scrub?: boolean; chart?: boolean }) {
  return (
    <div className="hero__glass">
      <div className="glass__top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4" />
        </svg>
        <span>Reads</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="10" r="3" />
          <path d="M6.5 17.5c1.5-2 3.4-3 5.5-3s4 1 5.5 3" />
        </svg>
      </div>
      <div className="glass__value">
        <Odometer value={Math.floor(reads).toLocaleString("en-US")} scrub={scrub} />
        <small>reads</small>
      </div>
      <div className="glass__delta">+ 18,234 (+6.34%) past month →</div>
      {chart && <TrendChart />}
      <div className="glass__ranges">
        {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((r) => (
          <span key={r} className={r === "ALL" ? "is-active" : undefined}>
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Pinned for one extra viewport of scrolling. That scroll drives the whole intro: the photo shrinks
 * into a tile, the glass dashboard grows in, its number rolls, the line becomes a stock chart and the
 * tiles regroup. Only the line's gentle wiggle and the background drift run on their own.
 */
export function Hero() {
  const { paused } = useMotion();
  const sceneRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const timeRef = useRef(0);
  const progressRef = useRef<number | null>(null);
  const atlasRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const hero = heroRef.current;
    const card = cardRef.current;
    const path = pathRef.current;
    const svg = svgRef.current;
    const atlas = atlasRef.current;
    if (!scene || !hero || !card || !path || !svg || !atlas) return;

    const tileCanvases = [...hero.querySelectorAll<HTMLCanvasElement>("canvas[data-cell]")].map((canvas) => ({
      ctx: canvas.getContext("2d"),
      sx: (Number(canvas.dataset.cell) % ATLAS.cols) * ATLAS.cell,
      sy: Math.floor(Number(canvas.dataset.cell) / ATLAS.cols) * ATLAS.cell,
    }));
    let atlasTime = -1;
    const drawTiles = () => {
      if (atlas.readyState < 2 || atlas.currentTime === atlasTime) return;
      atlasTime = atlas.currentTime;
      for (const { ctx, sx, sy } of tileCanvases) {
        ctx?.drawImage(atlas, sx, sy, ATLAS.cell, ATLAS.cell, 0, 0, ATLAS.cell, ATLAS.cell);
      }
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const g = { cl: 0, ct: 0, cw: 0, ch: 0 };
    const measure = () => {
      const hr = hero.getBoundingClientRect();
      // offsetLeft ignores the card's translateX(-50%), so correct for it.
      g.cw = card.offsetWidth;
      g.ch = card.offsetHeight;
      g.cl = card.offsetLeft - g.cw / 2;
      g.ct = card.offsetTop;
      svg.setAttribute("viewBox", `0 0 ${hr.width} ${hr.height}`);
    };

    const scrollProgress = () => {
      if (reduced) return 1;
      const r = scene.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? clamp01(-r.top / span) : 0;
    };

    const apply = (h: number) => {
      hero.style.setProperty("--ph", smooth(seg(h, 0.05, 0.6)).toFixed(4));
      hero.style.setProperty("--gl", smooth(seg(h, 0.25, 0.8)).toFixed(4));
      hero.style.setProperty("--tl", smooth(seg(h, 0.1, 0.75)).toFixed(4));
      hero.style.setProperty("--od", seg(h, 0.35, 0.95).toFixed(4));
      hero.style.setProperty("--bgp", h.toFixed(4));
    };

    const draw = (t: number, mix: number) => {
      const { cl, ct, cw, ch } = g;
      if (!cw) return;

      // At the top: square photo centred on the card.
      const ps = cw * 0.95;
      const pl = cl + (cw - ps) / 2;
      const pt = ct + (ch - ps) / 2;
      const xEnd = pl + ps * 0.78 + (cl + cw * 0.93 - (pl + ps * 0.78)) * mix;

      let d = "";
      for (let x = -12; x <= xEnd; x += 6) {
        // Smooth deep waves that flatten towards the photo, then climb into a spike inside it.
        const k = clamp01(x / pl);
        const wave =
          (Math.sin(x * 0.0105 + t * 0.55) * 0.62 + Math.sin(x * 0.024 - t * 0.85 + 1.3) * 0.38) *
          ps *
          0.62 *
          Math.pow(1 - k, 0.65);
        const u = clamp01((x - pl) / (ps * 0.78));
        const spike = smooth((x - pl + 40) / 80) * ps * (0.52 * Math.pow(u, 2.4) + 0.05 * Math.sin(x * 0.08 + t * 1.6));
        const yPhoto = pt + ps * 0.62 + wave - spike;

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
    let applied = -1;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!paused) timeRef.current += dt;

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
      drawTiles();
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    // Clips only decode while the hero is on screen and motion isn't paused.
    const videos = [...hero.querySelectorAll("video")];
    const syncVideos = () => {
      for (const v of videos) {
        v.muted = true;
        if (visible && !paused) v.play().catch(() => {});
        else v.pause();
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

        <div ref={cardRef} className="hero__card" aria-hidden="true">
          <GlassReads reads={300050} scrub />
          <div className="hero__photo">
            <Clip name="kids-fountain" className="hero__media" />
          </div>
        </div>

        <video
          ref={atlasRef}
          className="hero__atlas"
          src="/hero/tiles.mp4"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
        />

        {TILES.map((tile, i) => (
          <div
            key={i}
            className="hero__tile"
            aria-hidden="true"
            style={
              {
                "--ax": tile.a.x,
                "--ay": tile.a.y,
                "--as": tile.a.s,
                "--aar": tile.a.ar ?? 1,
                "--bx": tile.b.x,
                "--by": tile.b.y,
                "--bs": tile.b.s,
                "--bar": tile.b.ar ?? 1,
                "--dur": `${tile.dur}s`,
                "--delay": `${tile.delay}s`,
              } as React.CSSProperties
            }
          >
            <div className="hero__bob">
              {tile.still ? (
                <span className="hero__media" style={{ backgroundImage: `url(/hero/${tile.still}.jpg)` }} />
              ) : (
                <canvas
                  className="hero__media"
                  data-cell={tile.cell}
                  width={ATLAS.cell}
                  height={ATLAS.cell}
                  style={cellPoster(tile.cell ?? 0)}
                />
              )}
            </div>
          </div>
        ))}

        <svg ref={svgRef} className="hero__line" aria-hidden="true" preserveAspectRatio="none">
          <path ref={pathRef} pathLength={1} />
        </svg>

        <div className="hero__copy">
          <h1 className="hero__title">Write more. Reach more.</h1>
          <p className="hero__sub">Being better than a blog means more of everything.</p>
          <Link href="/register" className="pill pill--light pill--lg">
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
