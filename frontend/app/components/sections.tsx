import Link from "next/link";
import { Lines, Reveal } from "./reveal";
import { Scene } from "./scene";
import { InkIcon } from "./visuals";

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export function WordStack({ words }: { words: string[] }) {
  return (
    <section className="words" aria-label="What you can do with Planit">
      <ul>
        {words.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </section>
  );
}

export function FeaturePanel({
  id,
  product,
  title,
  href,
  textTone,
  background,
  bleed,
  visual,
  visualClassName,
  hold = 0.6,
}: {
  id: string;
  product: string;
  title: string;
  href: string;
  textTone: "light" | "dark";
  background?: string;
  bleed?: React.ReactNode;
  visual?: React.ReactNode;
  visualClassName?: string;
  /** Extra viewports the slide stays pinned for; 0 scrolls straight through. */
  hold?: number;
}) {
  return (
    <Scene id={id} hold={hold}>
      <div className={`panel panel--${textTone}-text`} style={background ? { background } : undefined}>
        {bleed}
        <div className="panel__inner">
          <Reveal>
            <p className="panel__eyebrow" data-block="late">
              <span className="wordmark">Planit</span>
              <span>{product}</span>
            </p>
            <h2 className="panel__title">
              <Lines text={title} />
            </h2>
            <div data-block="late">
              <Link href={href} className="arrow-btn" aria-label={`Learn more about Planit ${product}`}>
                <ArrowIcon />
              </Link>
            </div>
          </Reveal>
          {visual && <div className={`panel__visual ${visualClassName ?? ""}`}>{visual}</div>}
        </div>
      </div>
    </Scene>
  );
}

export function Manifesto() {
  return (
    <Scene id="about" hold={0.5}>
      <div className="manifesto">
        <Reveal className="container">
          <InkIcon className="manifesto__icon" />
          <h2 className="manifesto__title">
            <Lines text="Welcome to the future of writing" />
          </h2>
          <p className="manifesto__body">
            <Lines text="Why are we here? Because we knew there was a better way. To write more, publish faster, organize smarter, and actually hear from the people reading you. Welcome to the calmest home for your words. Built for what comes next." />
          </p>
          <p className="manifesto__note" data-block="late">
            Reading figures shown on this page are illustrative examples of the Planit dashboard and do not represent
            real accounts.
          </p>
        </Reveal>
      </div>
    </Scene>
  );
}

export function Newsletter() {
  return (
    <Scene className="newsletter" id="newsletter">
      <div className="container">
        <Reveal className="newsletter__card">
          <h2 className="newsletter__title" data-block="">
            TLDR
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <defs>
                <radialGradient id="tldr-face" cx="0.35" cy="0.3" r="0.8">
                  <stop offset="0" stopColor="#ffe68a" />
                  <stop offset="0.6" stopColor="#f6c533" />
                  <stop offset="1" stopColor="#d99a12" />
                </radialGradient>
              </defs>
              <circle cx="32" cy="32" r="30" fill="url(#tldr-face)" />
              <path d="M17 26c2-4 8-4 10 0M37 26c2-4 8-4 10 0" stroke="#5a3a08" strokeWidth="3.2" fill="none" strokeLinecap="round" />
              <path d="M19 38c6 9 20 9 26 0" stroke="#5a3a08" strokeWidth="3.2" fill="#7a3d0c" strokeLinecap="round" />
              <ellipse cx="22" cy="18" rx="7" ry="4" fill="#fff" opacity="0.45" />
            </svg>
          </h2>
          <p className="newsletter__body">
            <Lines text="A weekly dose of writing, culture, and enough publishing news to make you sound smart at parties" />
          </p>
          <div data-block="late">
            <Link href="#newsletter" className="pill pill--outline pill--lg">
              Read the latest newsletter
            </Link>
          </div>
        </Reveal>
      </div>
    </Scene>
  );
}

const STATS = [
  { value: "2.4M", title: "Monthly reads", body: "Stories discovered through categories, tags and search every month." },
  { value: "18,000+", title: "Published posts", body: "From weekend journals to long-form essays, all in one calm editor." },
  { value: "4.9", title: "Average rating", body: "Writers love how quiet, fast and focused the whole experience feels." },
];

export function Trusted() {
  return (
    <Scene className="trusted">
      <div className="container">
        <Reveal>
          <h2 className="trusted__title">
            <Lines text="Trusted by over 40,000 writers" />
          </h2>
        </Reveal>
        <Reveal className="stats">
          {STATS.map((s) => (
            <div key={s.title} data-block="">
              <strong>{s.value}</strong>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </Reveal>
        <div className="trusted__cta">
          <Link href="/register" className="pill pill--dark pill--lg">
            Start writing for free
          </Link>
        </div>
      </div>
    </Scene>
  );
}

const FOOTER = [
  { title: "Product", links: ["Editor", "Categories", "Tags", "Dashboard"] },
  { title: "Community", links: ["Discover", "Writers", "Newsletter", "Events"] },
  { title: "Resources", links: ["Guides", "Help centre", "Changelog", "Status"] },
  { title: "Company", links: ["About", "Careers", "Privacy", "Terms"] },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <span className="wordmark">Planit</span>
            <p>The calm, beautiful home for everything you write and publish.</p>
          </div>
          {FOOTER.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer__legal">
          <span>© {new Date().getFullYear()} Planit. All rights reserved.</span>
          <span>Made for people who write.</span>
        </div>
      </div>
    </footer>
  );
}
