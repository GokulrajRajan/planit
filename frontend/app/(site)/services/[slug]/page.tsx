import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, HOW_IT_WORKS, SERVICE_CONTENT } from "@/lib/content/services";
import { getSiteSettings } from "@/lib/site-data";
import { EnquiryForm } from "../../../components/site/EnquiryForm";
import { CheckList, FaqList, Note, PageHero, Section, Steps } from "../../../components/site/page-kit";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_CONTENT.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getService((await params).slug);
  return service ? { title: service.title, description: service.summary } : {};
}

/** One template for all six service pages; the copy lives in lib/content/services.ts. */
export default async function ServicePage({ params }: Props) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const settings = await getSiteSettings();
  const others = SERVICE_CONTENT.filter((s) => s.slug !== service.slug);

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Services", href: "/services" }, { label: service.title, href: "" }]}
        title={service.title}
        intro={service.summary}
      />

      <Section tone="paper">
        <div className="two-col">
          <div className="prose">
            {service.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {service.note && <Note>{service.note}</Note>}
          </div>
          <div>
            <h2 className="section-title section-title--small">How we help</h2>
            <CheckList items={service.helpWith} />
          </div>
        </div>
      </Section>

      <Section title="Who it's for">
        <CheckList items={service.goodFor} />
        {service.calculator && (
          <p className="section-link">
            Try our <Link href={service.calculator.href}>{service.calculator.label}</Link> to see an illustrative
            estimate.
          </p>
        )}
      </Section>

      <Section tone="paper" title="How it works">
        <Steps steps={HOW_IT_WORKS} />
      </Section>

      <Section title="Questions we often hear">
        <FaqList faqs={service.faqs} />
      </Section>

      <Section tone="paper" id="enquiry" title={`Talk to us about ${service.title.toLowerCase()}`}>
        <div className="two-col">
          <EnquiryForm defaultService={service.enquiryValue} />
          <aside className="side-links">
            <h3>Other services</h3>
            <ul>
              {others.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
            {settings.visible_sections.client_login && settings.portal_url && (
              <p>
                Already a client?{" "}
                <a href={settings.portal_url} target="_blank" rel="noopener noreferrer">
                  Log in to your portal
                </a>
                .
              </p>
            )}
          </aside>
        </div>
      </Section>
    </main>
  );
}
