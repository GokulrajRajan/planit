import Link from "next/link";
import type { LegalSection } from "@/lib/content/legal";
import type { Faq } from "@/lib/content/services";
import { ROUTES, type NavLink } from "@/lib/site";
import type { SiteSettings } from "@/lib/site-data";
import { SmartLink } from "./SmartLink";

/**
 * Building blocks for inner pages. Motion here is limited to light CSS fades (`fade-in` on load,
 * `reveal-on-scroll` where the browser supports scroll-driven animations); the full motion system
 * stays on the home page.
 */

export function PageHero({
  crumbs = [],
  title,
  intro,
  children,
}: {
  crumbs?: NavLink[];
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-hero">
      <div className="container fade-in">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="crumbs">
              <li>
                <Link href={ROUTES.home}>Home</Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label}>{crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}</li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="page-hero__title">{title}</h1>
        {intro && <p className="page-hero__intro">{intro}</p>}
        {children}
      </div>
    </header>
  );
}

export function Section({
  title,
  intro,
  tone = "cream",
  id,
  children,
}: {
  title?: string;
  intro?: string;
  tone?: "cream" | "paper";
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`page-section page-section--${tone}`} id={id}>
      <div className="container reveal-on-scroll">
        {title && <h2 className="section-title">{title}</h2>}
        {intro && <p className="section-intro">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="steps">
      {steps.map((step) => (
        <li key={step.title}>
          <h3>{step.title}</h3>
          <p>{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="faq">
      {faqs.map((faq) => (
        <details key={faq.q}>
          <summary>{faq.q}</summary>
          <p>{faq.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return <p className="note">{children}</p>;
}

/** "Book a Free Consultation", plus Start a SIP / Open Your Account once their links are set. */
export function CtaBand({
  cta,
  title = "Ready to start?",
  body = "Book a free consultation. No obligation, no jargon, just a clear plan for what to do next.",
}: {
  cta: SiteSettings["cta"];
  title?: string;
  body?: string;
}) {
  return (
    <section className="page-section page-section--cream">
      <div className="container">
        <div className="cta-band reveal-on-scroll">
          <h2>{title}</h2>
          <p>{body}</p>
          <div className="cta-band__actions">
            <Link className="pill pill--accent pill--lg" href={ROUTES.contact}>
              Book a Free Consultation
            </Link>
            {cta.start_sip_url && (
              <SmartLink className="pill pill--light pill--lg" href={cta.start_sip_url}>
                Start a SIP
              </SmartLink>
            )}
            {cta.open_account_url && (
              <SmartLink className="pill pill--light pill--lg" href={cta.open_account_url}>
                Open Your Account
              </SmartLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Client-supplied legal text. */
export function Prose({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="prose">
      {sections.map((section, i) => (
        <div key={section.heading ?? i}>
          {section.heading && <h2>{section.heading}</h2>}
          {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.list && (
            <ul>
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/** Post bodies are plain text from the admin editor: blank lines separate paragraphs. */
export function PostBody({ content }: { content: string }) {
  const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className="prose">
      {paragraphs.map((paragraph, i) => (
        <p key={i}>
          {paragraph.split("\n").map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

export const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })
    : "";
