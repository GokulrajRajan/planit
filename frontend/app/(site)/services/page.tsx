import type { Metadata } from "next";
import Link from "next/link";
import { HOW_IT_WORKS, SERVICE_CONTENT } from "@/lib/content/services";
import { getSiteSettings } from "@/lib/site-data";
import { CtaBand, PageHero, Section, Steps } from "../../components/site/page-kit";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Mutual funds, SIP planning, goal planning, retirement planning, tax-saving investments and insurance reviews from Planit.",
};

export default async function ServicesPage() {
  const settings = await getSiteSettings();

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Services", href: "" }]}
        title="Everything you need to invest with a plan"
        intro="From your first SIP to planning your retirement income, we help you understand your options, choose suitable mutual funds and stay on track."
      />

      <Section tone="paper" title="Our services">
        <div className="card-grid">
          {SERVICE_CONTENT.map((service) => (
            <Link key={service.slug} className="card" href={`/services/${service.slug}`}>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
              <span className="card__more">Learn more →</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="How it works" intro="Four simple steps, at your pace.">
        <Steps steps={HOW_IT_WORKS} />
      </Section>

      <CtaBand cta={settings.cta} />
    </main>
  );
}
