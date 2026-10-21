import Link from "next/link";
import type { Faq } from "@/lib/content/services";
import { ROUTES } from "@/lib/site";
import { Odometer } from "./Hero";
import { Lines, Reveal } from "./reveal";
import { Scene } from "./scene";
import { EnquiryForm } from "./site/EnquiryForm";
import { NewsletterForm } from "./site/NewsletterForm";
import { FaqList } from "./site/page-kit";
import { InkIcon } from "./visuals";

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export function WordStack({ words }: { words: string[] }) {
  return (
    <section className="words" aria-label="What Planit helps you do">
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

/** "Why choose Planit". */
export function Manifesto() {
  return (
    <Scene id="why-planit" hold={0.5}>
      <div className="manifesto">
        <Reveal className="container">
          <InkIcon className="manifesto__icon" />
          <h2 className="manifesto__title">
            <Lines text="Investing, made clear" />
          </h2>
          <p className="manifesto__body">
            <Lines text="Why Planit? Because investing should feel clear, not confusing. We help you choose mutual funds that fit your goals, set up SIPs that suit your budget, and review your plan as life changes. Plain language, regular check-ins, and commissions that are fully disclosed." />
          </p>
          <p className="manifesto__note" data-block="late">
            Figures shown on this page are illustrative examples. They are not real accounts and not a promise or
            guarantee of returns.
          </p>
        </Reveal>
      </div>
    </Scene>
  );
}

export function HowItWorks({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <Scene className="home-section home-section--paper" id="how-it-works">
      <div className="container">
        <Reveal>
          <h2 className="home-section__title">
            <Lines text="How it works" />
          </h2>
          <ol className="steps">
            {steps.map((step) => (
              <li key={step.title} data-block="">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </Scene>
  );
}

export function WhoWeServe({ groups }: { groups: { title: string; headline: string; href: string }[] }) {
  return (
    <Scene className="home-section" id="who-we-serve">
      <div className="container">
        <Reveal>
          <h2 className="home-section__title">
            <Lines text="Who we serve" />
          </h2>
          <div className="card-grid">
            {groups.map((group) => (
              <Link key={group.href} className="card" href={group.href} data-block="">
                <h3>{group.title}</h3>
                <p>{group.headline}</p>
                <span className="card__more">See how we help →</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </Scene>
  );
}

/** Rendered only once the admin has entered real figures (see visible_sections.stats). */
export function Stats({ stats }: { stats: { label: string; value: string; note: string | null }[] }) {
  return (
    <Scene className="trusted" id="stats">
      <div className="container">
        <Reveal className="stats">
          {stats.map((stat) => (
            <div key={stat.label} data-block="">
              <strong>
                <Odometer value={stat.value} />
              </strong>
              <h3>{stat.label}</h3>
              {stat.note && <p>{stat.note}</p>}
            </div>
          ))}
        </Reveal>
      </div>
    </Scene>
  );
}

/** Rendered only once real testimonials are published (see visible_sections.testimonials). */
export function Testimonials({ testimonials }: { testimonials: { id: number; author_name: string; author_detail: string | null; content: string }[] }) {
  return (
    <Scene className="home-section home-section--paper" id="testimonials">
      <div className="container">
        <Reveal>
          <h2 className="home-section__title">
            <Lines text="What our clients say" />
          </h2>
          <ul className="quotes">
            {testimonials.map((t) => (
              <li key={t.id} data-block="">
                <blockquote>
                  <p>&ldquo;{t.content}&rdquo;</p>
                  <footer>
                    <strong>{t.author_name}</strong>
                    {t.author_detail && <span>{t.author_detail}</span>}
                  </footer>
                </blockquote>
              </li>
            ))}
          </ul>
          <p className="manifesto__note" data-block="late">
            Testimonials reflect individual experiences of our service. They are not an indication of future
            performance or of returns.
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
            The Planit Brief
          </h2>
          <p className="newsletter__body">
            <Lines text="A short monthly note on markets, mutual funds and money habits, in plain language" />
          </p>
          <div data-block="late">
            <NewsletterForm />
          </div>
        </Reveal>
      </div>
    </Scene>
  );
}

export function HomeFaq({ faqs }: { faqs: Faq[] }) {
  return (
    <Scene className="home-section" id="faq">
      <div className="container">
        <Reveal>
          <h2 className="home-section__title">
            <Lines text="Questions, answered" />
          </h2>
          <div data-block="">
            <FaqList faqs={faqs} />
          </div>
          <p className="section-link" data-block="late">
            <Link href={ROUTES.faqs}>See all FAQs →</Link>
          </p>
        </Reveal>
      </div>
    </Scene>
  );
}

export function HomeEnquiry() {
  return (
    <Scene className="home-section home-section--paper" id="enquiry">
      <div className="container">
        <Reveal className="two-col">
          <div>
            <h2 className="home-section__title">
              <Lines text="Book a free consultation" />
            </h2>
            <p className="section-intro" data-block="">
              Tell us a little about yourself and what you&rsquo;d like help with. We&rsquo;ll get back to you to
              find a time that suits you. No obligation, no jargon.
            </p>
          </div>
          <div data-block="late">
            <EnquiryForm />
          </div>
        </Reveal>
      </div>
    </Scene>
  );
}
