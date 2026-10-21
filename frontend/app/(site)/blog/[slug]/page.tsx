import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/site-data";
import { formatDate, PageHero, Section } from "../../../components/site/page-kit";
import { POST_NOTE, PostArticle } from "../../../components/site/posts";

type Props = { params: Promise<{ slug: string }> };

async function findBlogPost(slug: string) {
  const post = await getPost(slug);
  return post?.post_type === "blog" ? post : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await findBlogPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt ?? undefined } : {};
}

export default async function BlogPostPage({ params }: Props) {
  const post = await findBlogPost((await params).slug);
  if (!post) notFound();

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Blog", href: "/blog" }, ...(post.category ? [{ label: post.category.name, href: `/blog?category=${post.category.slug}` }] : [])]}
        title={post.title}
        intro={post.excerpt ?? undefined}
      >
        <p className="page-hero__meta">
          {post.author.name} · <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
        </p>
      </PageHero>
      <Section tone="paper">
        <PostArticle post={post} backHref="/blog" backLabel="All articles" note={POST_NOTE} />
      </Section>
    </main>
  );
}
