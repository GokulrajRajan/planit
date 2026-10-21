import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvestorCategory, INVESTOR_CONTENT } from "@/lib/content/investors";
import { SERVICE_CONTENT } from "@/lib/content/services";
import { getSiteSettings } from "@/lib/site-data";
import { CheckList, CtaBand, Note, PageHero, Section } from "../../../components/site/page-kit";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return INVESTOR_CONTENT.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getInvestorCategory((await params).slug);
  return category ? { title: `For ${category.title}`, description: category.intro[0] } : {};
}

/** One template for the five investor categories; the copy lives in lib/content/investors.ts. */
export default async function InvestorCategoryPage({ params }: Props) {
  const category = getInvestorCategory((await params).slug);
  if (!category) notFound();
  const settings = await getSiteSettings();
  const services = SERVICE_CONTENT.filter((s) => category.relatedServices.includes(s.slug));

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Investor Category", href: "" }, { label: category.title, href: "" }]}
        title={category.headline}
        intro={`For ${category.title.toLowerCase()}`}
      />

      <Section tone="paper">
        <div className="two-col">
          <div className="prose">
            {category.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {category.note && <Note>{category.note}</Note>}
          </div>
          <div>
            <h2 className="section-title section-title--small">How we can help</h2>
            <CheckList items={category.points} />
          </div>
        </div>
      </Section>

      <Section title="Services that fit">
        <div className="card-grid">
          {services.map((service) => (
            <Link key={service.slug} className="card" href={`/services/${service.slug}`}>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
              <span className="card__more">Learn more →</span>
            </Link>
          ))}
        </div>
      </Section>

      <CtaBand cta={settings.cta} />
    </main>
  );
}
