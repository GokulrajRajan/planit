"use client";

import {
  ArrowRight,
  Bell,
  ChartNoAxesColumn,
  ChevronDown,
  ChevronLeft,
  CircleUserRound,
  Compass,
  Ellipsis,
  EyeOff,
  Gift,
  House,
  SquarePen,
  User,
} from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { pauseClip, playClip, useMotion } from "./motion";
import { useSceneFrame } from "./scene";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

const fmt = (n: number) => Math.floor(n).toLocaleString("en-US");

/* ───────────── Phone ───────────── */

const POSTS = [
  { title: "Notes on slow living", emoji: "🌿", cat: "Essays", reads: "4,820" },
  { title: "A year of Sunday walks", emoji: "🚶", cat: "Journal", reads: "4,231" },
  { title: "How I plan a week", emoji: "🗓️", cat: "Productivity", reads: "3,906" },
  { title: "Letters to my editor", emoji: "✉️", cat: "Essays", reads: "2,118" },
];

const PRO_ROWS = [
  { title: "Supporters", emoji: "💛", sub: "+12 this week", value: "314" },
  { title: "Tips", emoji: "☕", sub: "This month", value: "$412.50" },
  { title: "Paid posts", emoji: "🔒", sub: "Published", value: "18" },
  { title: "Next payout", emoji: "🏦", sub: "Automatic", value: "Oct 1" },
  { title: "Newsletter", emoji: "📮", sub: "Subscribers", value: "1,204" },
  { title: "Referrals", emoji: "🤝", sub: "This year", value: "$96.00" },
];

function PhoneTabBar() {
  return (
    <div className="phone__tabs">
      <House className="is-active" />
      <Compass />
      <SquarePen />
      <ChartNoAxesColumn />
      <User />
    </div>
  );
}

/**
 * Totals count up with the slide's reveal. As the slide releases, the screen swipes (--swipe) to the
 * Pro screen, whose content then scrolls up inside the phone (--exit), leading into the card slide.
 */
export function PhoneMockup() {
  const totalRef = useRef<HTMLSpanElement>(null);
  const publishedRef = useRef<HTMLSpanElement>(null);

  useSceneFrame((s) => {
    const k = 1 - Math.pow(1 - s.reveal, 3);
    if (totalRef.current) totalRef.current.textContent = fmt(304980 + (312155 - 304980) * k);
    if (publishedRef.current) publishedRef.current.textContent = String(Math.round(198 + 16 * k));
  });

  return (
    <div className="phone" aria-hidden="true">
      <div className="phone__bezel">
        <div className="phone__screen">
          <div className="phone__island">
            <i />
          </div>
          <div className="phone__track">
            <div className="phone__page">
              <div className="phone__head">
                <span className="phone__dot-icon">
                  <Bell />
                </span>
                <span className="phone__pager">
                  <i />
                  <span>Home</span>
                  <i />
                </span>
                <span className="phone__head-right">
                  <span className="phone__dot-icon">
                    <Gift />
                  </span>
                  <CircleUserRound />
                </span>
              </div>

              <div className="phone__balance">
                <span ref={totalRef}>{fmt(312155)}</span>
                <span className="phone__eye">
                  <EyeOff />
                </span>
              </div>
              <p className="phone__balance-label">total reads, all time</p>

              <div className="phone__grid">
                <div className="phone__card">
                  <p>Drafts</p>
                  <strong>12 posts</strong>
                  <span className="phone__tag">+3 this week</span>
                </div>
                <div className="phone__card">
                  <p>Published</p>
                  <strong>
                    <span ref={publishedRef}>214</span> posts
                  </strong>
                  <span className="phone__tag">+14.02% all time</span>
                </div>
              </div>

              <div className="phone__row phone__row--muted">
                <span className="phone__stack">
                  <i style={{ background: "#141414" }}>E</i>
                  <i style={{ background: "#f0645a" }}>J</i>
                  <i style={{ background: "#7d9cf0" }}>T</i>
                </span>
                <span className="phone__row-title">12 categories</span>
                <ArrowRight className="phone__row-end" />
              </div>

              <div className="phone__row">
                <span className="phone__logo">P</span>
                <span className="phone__row-title">Planit Pro</span>
                <span className="phone__row-end phone__amount">
                  $2,235.09
                  <small>$314.46 in tips</small>
                </span>
              </div>

              <div className="phone__group">
                <div className="phone__group-head">
                  <span>Posts</span>
                  <span className="phone__row-end">
                    214
                    <span className="phone__chev">
                      <ChevronDown />
                    </span>
                  </span>
                </div>
                {POSTS.map((p) => (
                  <div key={p.title} className="phone__item">
                    <span>
                      {p.title} <span className="phone__emoji">{p.emoji}</span>
                      <small>{p.cat}</small>
                    </span>
                    <span>{p.reads}</span>
                  </div>
                ))}
              </div>
              <PhoneTabBar />
            </div>

            <div className="phone__page phone__page--pro">
              <div className="phone__scroll">
                <div className="phone__head">
                  <ChevronLeft />
                  <span className="phone__pager">
                    <span>Pro</span>
                  </span>
                  <Ellipsis />
                </div>
                <div className="phone__pro-top">
                  <span>Earned this month</span>
                  <strong>$2,235.09</strong>
                </div>
                <div className="phone__minicard">
                  <span className="phone__minicard-mark">P</span>
                  <span className="phone__minicard-label">PRO</span>
                  <span className="phone__minicard-num">•••• 2026</span>
                </div>
                <div className="phone__group">
                  {PRO_ROWS.map((r) => (
                    <div key={r.title} className="phone__item">
                      <span>
                        {r.title} <span className="phone__emoji">{r.emoji}</span>
                        <small>{r.sub}</small>
                      </span>
                      <span>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <PhoneTabBar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Pro card ───────────── */

export function ProCard() {
  return (
    <div className="procard-stage" aria-hidden="true">
      <div className="procard__glow" />
      <div className="procard__floor" />
      <div className="procard">
        <div className="procard__chip" />
        <div className="procard__mark">P</div>
        <div className="procard__network">
          PRO
          <small>Planit Membership</small>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Geometric facade ───────────── */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GEO_COLORS = [
  ["#f4f3ee", "#dcdad2"],
  ["#eceae2", "#c9c6bb"],
  ["#c9d7c0", "#a6bb9b"],
  ["#9dbb8f", "#6f9a62"],
  ["#5f9a55", "#3f7a39"],
  ["#ff6a2b", "#e9531a"],
  ["#d8d1b8", "#b9b195"],
  ["#e6efe1", "#c2d3ba"],
];
const GEO_WEIGHTS = [4, 3, 3, 2, 1.4, 1.2, 2, 2];

type Block = { left: number; top: number; width: number; height: number; c: string[] };

function buildFacade(): Block[][] {
  const rand = mulberry32(11);
  const pick = () => {
    const total = GEO_WEIGHTS.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    for (let i = 0; i < GEO_WEIGHTS.length; i++) {
      r -= GEO_WEIGHTS[i];
      if (r <= 0) return GEO_COLORS[i];
    }
    return GEO_COLORS[0];
  };
  const layers: Block[][] = [[], [], []];
  for (let layer = 0; layer < 3; layer++) {
    let x = -6 + rand() * 4;
    while (x < 104) {
      const w = 6 + rand() * 7;
      let y = -10 - rand() * 10;
      while (y < 110) {
        const h = 10 + rand() * 26;
        if (rand() > 0.28 - layer * 0.06) {
          layers[layer].push({ left: x + (rand() - 0.5) * 2, top: y, width: w, height: h, c: pick() });
        }
        y += h + rand() * 3;
      }
      x += w + (layer === 0 ? 0 : 3 + rand() * 9);
    }
  }
  return layers;
}

const FACADE = buildFacade();
const LAYER_SPEED = [0.08, 0.2, 0.36];
const LAYER_FILTER = ["blur(3px) brightness(0.96)", "blur(0.6px)", "none"];

export function GeoBlocks() {
  return (
    <div className="geo" aria-hidden="true">
      {FACADE.map((blocks, li) => (
        <div
          key={li}
          className="geo__layer"
          style={{ filter: LAYER_FILTER[li], "--speed": LAYER_SPEED[li] } as React.CSSProperties}
        >
          {blocks.map((b, bi) => (
            <div
              key={bi}
              className="geo__block"
              style={{
                left: `${b.left.toFixed(2)}%`,
                top: `${b.top.toFixed(2)}%`,
                width: `${b.width.toFixed(2)}%`,
                height: `${b.height.toFixed(2)}%`,
                background: `linear-gradient(90deg, ${b.c[1]} 0%, ${b.c[0]} 22%, ${b.c[0]} 70%, ${b.c[1]} 100%)`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ───────────── Mountain ───────────── */

const NARROW_QUERY = "(max-width: 900px)";

function subscribeNarrow(onChange: () => void) {
  const mq = window.matchMedia(NARROW_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Looping sunrise time-lapse of Ama Dablam (Pixabay 277097, Pixabay Content License), cropped to the summit,
 * mirrored and graded. Its sky is pre-filled with the slide's gradient for the exact position the video takes
 * in each layout (summit.mp4 desktop, summit-m.mp4 narrow), so the frame edge disappears into the background.
 */
export function Mountain() {
  const { paused } = useMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW_QUERY).matches, () => false);
  const name = narrow ? "summit-m" : "summit";

  // Only decode while on screen and while motion isn't paused. Re-runs when the source switches to the
  // narrow cut after hydration, since a new src stops playback.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !paused) playClip(video);
      else pauseClip(video);
    });
    io.observe(video);
    return () => io.disconnect();
  }, [paused, name]);

  return (
    <video
      ref={ref}
      className="mountain"
      src={`/hero/${name}.mp4`}
      poster={`/hero/${name}.jpg`}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      aria-hidden="true"
    />
  );
}

/* ───────────── 3D pie ───────────── */

type Slice = { from: number; to: number; top: string; edge: string; explode: number };

const SLICES: Slice[] = [
  { from: 100, to: 268, top: "url(#pie-coral)", edge: "#e57f72", explode: 26 },
  { from: 272, to: 352, top: "url(#pie-peach)", edge: "#e9b27b", explode: 16 },
  { from: 356, to: 392, top: "url(#pie-gold)", edge: "#e5be4f", explode: 34 },
  { from: 396, to: 456, top: "url(#pie-iris)", edge: "#9fb9e6", explode: 22 },
];

const PIE = { cx: 300, cy: 230, r: 220, k: 0.52, depth: 52, glass: 16 };
const PIE_LAYERS: number[] = [];
for (let d = PIE.depth; d > 0; d -= 2) PIE_LAYERS.push(d);

const rad = (a: number) => (a * Math.PI) / 180;

function wedge(s: Slice, angle: number, explode: number, dy: number) {
  const from = s.from + angle;
  const to = s.to + angle;
  const mid = rad((from + to) / 2);
  const cx = PIE.cx + Math.cos(mid) * s.explode * explode;
  const cy = PIE.cy + Math.sin(mid) * s.explode * explode * PIE.k + dy;
  const p = (a: number) => [cx + PIE.r * Math.cos(rad(a)), cy + PIE.r * PIE.k * Math.sin(rad(a))];
  const [x1, y1] = p(from);
  const [x2, y2] = p(to);
  const large = to - from > 180 ? 1 : 0;
  return `M${cx.toFixed(1)} ${cy.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}A${PIE.r} ${(PIE.r * PIE.k).toFixed(1)} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}Z`;
}

/** Back-to-front order so nearer slices paint over farther ones. */
function depthOrder(angle: number) {
  return SLICES.map((s, i) => ({ i, y: Math.sin(rad((s.from + s.to) / 2 + angle)) }))
    .sort((a, b) => a.y - b.y)
    .map((o) => o.i);
}

const INITIAL_ORDER = depthOrder(0);

export function Pie() {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupsRef = useRef<(SVGGElement | null)[]>([]);

  // Turns as the slide scrolls past and drifts its slices apart as it comes in.
  useSceneFrame((s) => {
    const svg = svgRef.current;
    if (!svg) return;
    const angle = -30 + s.total * 220;
    const explode = 0.2 + 0.8 * smooth(s.enter);
    for (const i of depthOrder(angle)) {
      const g = groupsRef.current[i];
      if (!g) continue;
      const paths = g.children;
      PIE_LAYERS.forEach((d, li) => paths[li].setAttribute("d", wedge(SLICES[i], angle, explode, d)));
      paths[PIE_LAYERS.length].setAttribute("d", wedge(SLICES[i], angle, explode, 0));
      svg.appendChild(g);
    }
  });

  return (
    <svg ref={svgRef} className="pie" viewBox="0 0 600 540" aria-hidden="true">
      <defs>
        <linearGradient id="pie-coral" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f9b2a5" />
          <stop offset="1" stopColor="#f28a7c" />
        </linearGradient>
        <linearGradient id="pie-peach" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe0bf" />
          <stop offset="1" stopColor="#f3bf8c" />
        </linearGradient>
        <linearGradient id="pie-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbeaa6" />
          <stop offset="1" stopColor="#f1c94f" />
        </linearGradient>
        <linearGradient id="pie-iris" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c8dcff" />
          <stop offset="0.5" stopColor="#e9f3f6" />
          <stop offset="1" stopColor="#f6e2b0" />
        </linearGradient>
        <radialGradient id="pie-shadow">
          <stop offset="0" stopColor="#5a4f48" stopOpacity="0.28" />
          <stop offset="1" stopColor="#5a4f48" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={PIE.cx + 10} cy={PIE.cy + PIE.depth + 40} rx={PIE.r * 1.15} ry={PIE.r * PIE.k * 0.9} fill="url(#pie-shadow)" />
      {INITIAL_ORDER.map((i) => {
        const s = SLICES[i];
        return (
          <g
            key={i}
            ref={(g) => {
              groupsRef.current[i] = g;
            }}
          >
            {PIE_LAYERS.map((d) => (
              <path key={d} d={wedge(s, 0, 1, d)} fill={d <= PIE.glass ? s.edge : d > PIE.depth - 6 ? "#cfcac5" : "#e8e4e0"} />
            ))}
            <path d={wedge(s, 0, 1, 0)} fill={s.top} />
          </g>
        );
      })}
    </svg>
  );
}

/* ───────────── Line-art icon ───────────── */

export function InkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 100" fill="none" stroke="#1b1917" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <path d={`M62 ${78 - i * 10} h44 a6 6 0 0 1 0 12 h-44 a6 6 0 0 1 0 -12z`} fill={i % 2 ? "#8a8784" : "#fff"} />
        </g>
      ))}
      <path d="M58 30 h50 a6 6 0 0 1 6 6 v0 a6 6 0 0 1 -6 6 h-50 z" fill="#fff" />
      <path d="M6 58 c6 -10 14 -16 24 -18 l24 -4 c4 0 6 3 4 6 l-12 4 h14 c4 0 5 5 1 6 l-22 6 c-6 2 -12 6 -18 12 l-8 8 c-6 0 -10 -10 -7 -20z" fill="#fff" />
      <path d="M22 46 l-6 -24 c-1 -4 4 -6 6 -2 l8 20" fill="#fff" />
      <path d="M42 18 L72 46" strokeWidth="5" />
      <path d="M72 46 l4 4" strokeWidth="2" />
    </svg>
  );
}
