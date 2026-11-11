import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryHref, getCategory, PRODUCT_CATEGORIES, productHref } from "@/lib/content/services";
import { getSiteSettings } from "@/lib/site-data";
import { PageHero } from "../../components/site/page-kit";
import { ProductBody } from "../../components/site/product";

type Props = { params: Promise<{ category: string }> };

// Only the five product categories (/mutual-funds, /trading, /invest, /wealth, /protect); any other
// top-level path that isn't its own page is a 404. Static pages such as /about always win over this route.
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCT_CATEGORIES.map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).category);
  return category ? { title: category.title, description: category.summary } : {};
}

/** Landing page for a product category; the copy lives in lib/content/services.ts. */
export default async function CategoryPage({ params }: Props) {
  const category = getCategory((await params).category);
  if (!category) notFound();
  const settings = await getSiteSettings();

  return (
    <main id="main">
      <PageHero
        crumbs={[...(category.ownTab ? [] : [{ label: "Services", href: "/services" }]), { label: category.title, href: "" }]}
        title={category.title}
        intro={category.summary}
      />
      <ProductBody
        content={category}
        cards={category.pages.map((page) => ({ title: page.title, summary: page.summary, href: productHref(category, page) }))}
        related={{
          title: "Other services",
          links: PRODUCT_CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => ({
            label: c.title,
            href: categoryHref(c),
          })),
        }}
        settings={settings}
      />
    </main>
  );
}
