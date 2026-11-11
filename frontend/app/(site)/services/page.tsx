import type { Metadata } from "next";
import Link from "next/link";
import { categoryHref, PRODUCT_CATEGORIES, productHref } from "@/lib/content/services";
import { getSiteSettings } from "@/lib/site-data";
import { CtaBand, PageHero, Section } from "../../components/site/page-kit";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Mutual funds, trading and Demat, IPOs, loans against securities, bonds, unlisted shares, PMS, AIFs and insurance from Planit.",
};

export default async function ServicesPage() {
  const settings = await getSiteSettings();

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Services", href: "" }]}
        title="Our products and services"
        intro="From your first SIP to trading, fixed income, specialised portfolios and insurance, we help you explore a diverse range of financial products in one place."
      />

      {PRODUCT_CATEGORIES.map((category, i) => (
        <Section key={category.slug} tone={i % 2 === 0 ? "paper" : "cream"} title={category.title} intro={category.summary}>
          <div className="card-grid">
            {category.pages.map((page) => (
              <Link key={page.slug} className="card" href={productHref(category, page)}>
                <h3>{page.title}</h3>
                <p>{page.summary}</p>
                <span className="card__more">Learn more →</span>
              </Link>
            ))}
          </div>
          <p className="section-link">
            <Link href={categoryHref(category)}>All about {category.title.toLowerCase()} →</Link>
          </p>
        </Section>
      ))}

      <CtaBand cta={settings.cta} />
    </main>
  );
}
