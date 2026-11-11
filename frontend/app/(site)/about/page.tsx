import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-data";
import { CheckList, CtaBand, PageHero, Section } from "../../components/site/page-kit";

export const metadata: Metadata = {
  title: "About Planit",
  description:
    "PLANIT is a financial products distribution company connecting individuals, families and businesses with a diverse range of financial products and investment opportunities.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "About Us", href: "" }, { label: "About Planit", href: "" }]}
        title="Simplifying Financial Choices. Enabling Financial Growth."
        intro="PLANIT is a financial products distribution company committed to connecting individuals, families, and businesses with a diverse range of financial products and investment opportunities."
      />

      <Section tone="paper">
        <div className="two-col">
          <div className="prose">
            <p>
              We understand that every financial journey is different. Whether the goal is to build long-term wealth,
              create financial security, diversify investments, or protect loved ones, choosing the right financial
              products is an important step towards achieving those aspirations.
            </p>
            <p>
              Our endeavour is to make financial products more accessible, simplify the process of exploring available
              options, and help our clients navigate their financial journey with greater clarity and confidence.
            </p>
            <p>
              Through our growing range of financial product offerings and a relationship-driven approach, we strive to
              become a dependable partner for our clients at every stage of their financial journey.
            </p>
          </div>
          <div>
            <h2 className="section-title section-title--small">Why Planit?</h2>
            <CheckList
              items={[
                "A diverse range of financial product categories.",
                "A relationship-focused approach to client service.",
                "Convenient access to multiple financial product offerings.",
                "A commitment to transparency and product awareness.",
                "A growing platform focused on serving clients through every stage of their financial journey.",
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title="The Planit Promise">
        <div className="prose">
          <p>
            At Planit, we believe that every financial goal deserves thoughtful consideration and access to suitable
            choices.
          </p>
          <p>
            We aim to make your financial journey more organised, accessible, and informed by bringing financial
            products and opportunities closer to you.
          </p>
          <p>
            <strong>PLANIT — Connecting You to Financial Opportunities.</strong>
          </p>
        </div>
      </Section>

      <Section tone="paper" title="Learn more about us">
        <div className="card-grid">
          <Link className="card" href="/about/mission-and-values">
            <h3>Mission and Values</h3>
            <p>Our vision, our mission, and the principles behind every conversation.</p>
            <span className="card__more">Read more →</span>
          </Link>
          <Link className="card" href="/services">
            <h3>Products and Services</h3>
            <p>Mutual funds, trading, bonds, unlisted shares, PMS, AIFs and insurance.</p>
            <span className="card__more">Explore →</span>
          </Link>
          <Link className="card" href="/legal/registration-disclosure">
            <h3>Registration</h3>
            <p>Our registration with the Association of Mutual Funds in India (AMFI).</p>
            <span className="card__more">View details →</span>
          </Link>
        </div>
      </Section>

      <CtaBand cta={settings.cta} />
    </main>
  );
}
