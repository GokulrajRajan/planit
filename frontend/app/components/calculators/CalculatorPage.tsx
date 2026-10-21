import Link from "next/link";
import { CALCULATORS, getCalculator, type CalculatorSlug } from "@/lib/content/calculators";
import { getSiteSettings } from "@/lib/site-data";
import { CtaBand, PageHero, Section } from "../site/page-kit";

/** Shared frame for the five calculator pages: light motion only, as for the legal pages. */
export async function CalculatorPage({ slug, children }: { slug: CalculatorSlug; children: React.ReactNode }) {
  const calculator = getCalculator(slug);
  const settings = await getSiteSettings();
  const others = CALCULATORS.filter((c) => c.slug !== slug);

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Calculators", href: "/calculators" }, { label: calculator.title, href: "" }]}
        title={calculator.title}
        intro={calculator.summary}
      />
      <Section tone="paper">{children}</Section>
      <Section title="Other calculators">
        <div className="card-grid">
          {others.map((other) => (
            <Link key={other.slug} className="card" href={`/calculators/${other.slug}`}>
              <h3>{other.title}</h3>
              <p>{other.summary}</p>
              <span className="card__more">Open →</span>
            </Link>
          ))}
        </div>
        <p className="section-link">
          Want help putting numbers like these into a real plan? Read about{" "}
          <Link href={calculator.service.href}>{calculator.service.label}</Link>.
        </p>
      </Section>
      <CtaBand
        cta={settings.cta}
        title="Turn the estimate into a plan"
        body="A calculator gives you a starting point. Book a free consultation and we'll help you choose suitable funds and amounts."
      />
    </main>
  );
}
