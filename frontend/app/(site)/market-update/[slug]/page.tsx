import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/site-data";
import { formatDate, PageHero, Section } from "../../../components/site/page-kit";
import { MARKET_UPDATE_NOTE, PostArticle } from "../../../components/site/posts";

type Props = { params: Promise<{ slug: string }> };

async function findUpdate(slug: string) {
  const post = await getPost(slug);
  return post?.post_type === "market_update" ? post : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await findUpdate((await params).slug);
  return post ? { title: post.title, description: post.excerpt ?? undefined } : {};
}

export default async function MarketUpdatePostPage({ params }: Props) {
  const post = await findUpdate((await params).slug);
  if (!post) notFound();

  return (
    <main id="main">
      <PageHero crumbs={[{ label: "Market Update", href: "/market-update" }]} title={post.title} intro={post.excerpt ?? undefined}>
        <p className="page-hero__meta">
          {post.author.name} · <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
        </p>
      </PageHero>
      <Section tone="paper">
        <PostArticle post={post} backHref="/market-update" backLabel="All market updates" note={MARKET_UPDATE_NOTE} />
      </Section>
    </main>
  );
}
