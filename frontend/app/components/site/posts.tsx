import Link from "next/link";
import type { Category, Post, PostPage } from "@/lib/site-data";
import { formatDate, PostBody } from "./page-kit";

/** Builds a listing URL, keeping the category filter when paging. */
const listHref = (basePath: string, category: string | undefined, page: number) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
};

export function CategoryFilter({
  basePath,
  categories,
  active,
}: {
  basePath: string;
  categories: Category[];
  active?: string;
}) {
  if (!categories.length) return null;
  return (
    <nav className="chips" aria-label="Filter by category">
      <Link className="chip" href={basePath} aria-current={!active ? "page" : undefined}>
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          className="chip"
          href={listHref(basePath, category.slug, 1)}
          aria-current={active === category.slug ? "page" : undefined}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}

export function PostList({
  data,
  basePath,
  category,
  emptyText,
}: {
  data: PostPage;
  basePath: string;
  category?: string;
  emptyText: string;
}) {
  const { posts, meta } = data;
  if (!posts.length) return <p className="empty-state">{emptyText}</p>;

  return (
    <>
      <ul className="post-grid">
        {posts.map((post) => (
          <li key={post.id}>
            <Link className="card post-card" href={`${basePath}/${post.slug}`}>
              {post.cover_image_url && (
                // Cover images can be hosted anywhere the admin chooses.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.cover_image_url} alt="" loading="lazy" />
              )}
              <p className="post-card__meta">
                {post.category && <span className="tag">{post.category.name}</span>}
                <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
              </p>
              <h3>{post.title}</h3>
              {post.excerpt && <p>{post.excerpt}</p>}
              <span className="card__more">Read more →</span>
            </Link>
          </li>
        ))}
      </ul>

      {meta.pages > 1 && (
        <nav className="pagination" aria-label="Pages">
          {meta.page > 1 ? (
            <Link className="pill pill--outline" href={listHref(basePath, category, meta.page - 1)} rel="prev">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {meta.page} of {meta.pages}
          </span>
          {meta.page < meta.pages ? (
            <Link className="pill pill--outline" href={listHref(basePath, category, meta.page + 1)} rel="next">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}

export function PostArticle({ post, backHref, backLabel, note }: { post: Post; backHref: string; backLabel: string; note: string }) {
  return (
    <article className="article">
      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="article__cover" src={post.cover_image_url} alt="" />
      )}
      <PostBody content={post.content} />
      <p className="note">{note}</p>
      <p className="section-link">
        <Link href={backHref}>← {backLabel}</Link>
      </p>
    </article>
  );
}

export const POST_NOTE =
  "This article is for general information and education only. It is not a recommendation to buy, sell or hold any investment. Please read all scheme related documents carefully before investing.";

export const MARKET_UPDATE_NOTE =
  "Market updates describe conditions at the time of writing and are for information only. They are not investment advice or a recommendation, and past performance is not indicative of future returns.";
