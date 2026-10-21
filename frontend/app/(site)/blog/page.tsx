import type { Metadata } from "next";
import { getCategories, getPosts } from "@/lib/site-data";
import { PageHero, Section } from "../../components/site/page-kit";
import { CategoryFilter, PostList } from "../../components/site/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Plain-language articles on mutual funds, SIPs, goal planning and money habits.",
};

type Props = { searchParams: Promise<{ category?: string; page?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const { category, page } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);
  const [data, categories] = await Promise.all([
    getPosts({ type: "blog", category, page: pageNumber, perPage: 9 }),
    getCategories(),
  ]);

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Knowledge Center", href: "" }, { label: "Blog", href: "" }]}
        title="Blog"
        intro="Plain-language guides to mutual funds, SIPs, goal planning and building good money habits."
      >
        <CategoryFilter basePath="/blog" categories={categories} active={category} />
      </PageHero>
      <Section tone="paper">
        <PostList data={data} basePath="/blog" category={category} emptyText="No articles here yet. Please check back soon." />
      </Section>
    </main>
  );
}
