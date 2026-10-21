import type { Metadata } from "next";
import Link from "next/link";
import { CALCULATORS } from "@/lib/content/calculators";
import { getSiteSettings } from "@/lib/site-data";
import { CtaBand, Note, PageHero, Section } from "../../components/site/page-kit";

export const metadata: Metadata = {
  title: "Calculators",
  description: "SIP, lumpsum, retirement, goal and tax-saving calculators. Illustrative estimates to help you plan.",
};

export default async function CalculatorsPage() {
  const settings = await getSiteSettings();

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Calculators", href: "" }]}
        title="Calculators"
        intro="Quick, illustrative estimates to help you think about how much to invest and for how long."
      />
      <Section tone="paper">
        <div className="card-grid">
          {CALCULATORS.map((calculator) => (
            <Link key={calculator.slug} className="card" href={`/calculators/${calculator.slug}`}>
              <h3>{calculator.title}</h3>
              <p>{calculator.summary}</p>
              <span className="card__more">Open calculator →</span>
            </Link>
          ))}
        </div>
        <Note>
          Results are illustrative only and are not a guarantee of returns. They assume a constant rate of return,
          which real investments do not deliver. Mutual Fund investments are subject to market risks, read all scheme
          related documents carefully.
        </Note>
      </Section>
      <CtaBand cta={settings.cta} />
    </main>
  );
}
