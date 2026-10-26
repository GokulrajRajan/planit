import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts, getSiteSettings } from "@/lib/site-data";
import { Note, PageHero, Section } from "../../components/site/page-kit";
import { MARKET_UPDATE_NOTE, PostList } from "../../components/site/posts";

export const metadata: Metadata = {
  title: "Market Update",
  description: "Regular notes on what is happening in the markets and what it may mean for mutual fund investors.",
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function MarketUpdatePage({ searchParams }: Props) {
  const { page } = await searchParams;
  const [settings, data] = await Promise.all([
    getSiteSettings(),
    getPosts({ type: "market_update", page: Math.max(1, Number(page) || 1), perPage: 9 }),
  ]);
  // Hidden until the admin publishes the first update (or if they switch the section off).
  if (!settings.visible_sections.market_update) notFound();

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Knowledge Center", href: "" }, { label: "Market Update", href: "" }]}
        title="Market Update"
        intro="What's happening in the markets, explained in plain language."
      />
      <Section tone="paper">
        <PostList
          data={data}
          basePath="/market-update"
          emptyText="The first market update will be published here soon."
        />
        <Note>{MARKET_UPDATE_NOTE}</Note>
      </Section>
    </main>
  );
}
