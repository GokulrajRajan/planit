import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryHref, getProduct, PRODUCT_CATEGORIES, productHref } from "@/lib/content/services";
import { getSiteSettings } from "@/lib/site-data";
import { PageHero } from "../../../components/site/page-kit";
import { ProductBody } from "../../../components/site/product";

type Props = { params: Promise<{ category: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCT_CATEGORIES.flatMap((category) =>
    category.pages.map((page) => ({ category: category.slug, slug: page.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const found = getProduct(category, slug);
  return found ? { title: found.page.title, description: found.page.summary } : {};
}

/** One template for every product page (e.g. /trading/ipo); the copy lives in lib/content/services.ts. */
export default async function ProductPage({ params }: Props) {
  const { category: categorySlug, slug } = await params;
  const found = getProduct(categorySlug, slug);
  if (!found) notFound();
  const { category, page } = found;
  const settings = await getSiteSettings();

  return (
    <main id="main">
      <PageHero
        crumbs={[
          ...(category.ownTab ? [] : [{ label: "Services", href: "/services" }]),
          { label: category.title, href: categoryHref(category) },
          { label: page.title, href: "" },
        ]}
        title={page.title}
        intro={page.summary}
      />
      <ProductBody
        content={page}
        related={{
          title: `More in ${category.title}`,
          links: [
            { label: `${category.title} overview`, href: categoryHref(category) },
            ...category.pages
              .filter((p) => p.slug !== page.slug)
              .map((p) => ({ label: p.title, href: productHref(category, p) })),
          ],
        }}
        settings={settings}
      />
    </main>
  );
}
