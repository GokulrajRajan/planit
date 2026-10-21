import type { ApiEnvelope } from "./api";

/** Mirrors backend/app/schemas/settings_schema.py. Every field is empty until the client supplies it. */
export type SiteSettings = {
  branding: { logo_url: string | null; primary_color: string | null; accent_color: string | null };
  office: {
    legal_name: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    phone: string | null;
    email: string | null;
    hours: string | null;
    map_embed_url: string | null;
    google_business_url: string | null;
  };
  registration: {
    arn: string | null;
    arn_valid_from: string | null;
    arn_valid_until: string | null;
    euin: string | null;
    euin_valid_until: string | null;
    cin: string | null;
  };
  grievance_officer: {
    name: string | null;
    designation: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  social_links: Record<SocialNetwork, string | null>;
  portal_url: string | null;
  cta: { start_sip_url: string | null; open_account_url: string | null };
  stats: { label: string; value: string; note: string | null }[];
  sections: Record<SectionKey, boolean>;
  /** Switched on by the admin *and* backed by real data: the only flags pages should check. */
  visible_sections: Record<SectionKey, boolean>;
};

export type SocialNetwork = "facebook" | "instagram" | "linkedin" | "x" | "youtube";

export type SectionKey =
  | "announcement_bar"
  | "stats"
  | "testimonials"
  | "team"
  | "newsletter"
  | "faq"
  | "market_update"
  | "registration_details"
  | "grievance_officer"
  | "office_map"
  | "social_links"
  | "client_login";

export type Announcement = {
  id: number;
  text: string;
  link: string | null;
  placement: "announcement_bar" | "banner" | "notice";
  starts_at: string | null;
  ends_at: string | null;
};

const SECTION_KEYS: SectionKey[] = [
  "announcement_bar",
  "stats",
  "testimonials",
  "team",
  "newsletter",
  "faq",
  "market_update",
  "registration_details",
  "grievance_officer",
  "office_map",
  "social_links",
  "client_login",
];

const allSections = (value: boolean) =>
  Object.fromEntries(SECTION_KEYS.map((key) => [key, value])) as Record<SectionKey, boolean>;

/** Used when the API can't be reached: everything that depends on client data stays hidden. */
const EMPTY_SETTINGS: SiteSettings = {
  branding: { logo_url: null, primary_color: null, accent_color: null },
  office: {
    legal_name: null,
    address_line1: null,
    address_line2: null,
    city: null,
    state: null,
    pincode: null,
    phone: null,
    email: null,
    hours: null,
    map_embed_url: null,
    google_business_url: null,
  },
  registration: { arn: null, arn_valid_from: null, arn_valid_until: null, euin: null, euin_valid_until: null, cin: null },
  grievance_officer: { name: null, designation: null, email: null, phone: null, address: null },
  social_links: { facebook: null, instagram: null, linkedin: null, x: null, youtube: null },
  portal_url: null,
  cta: { start_sip_url: null, open_account_url: null },
  stats: [],
  sections: allSections(true),
  visible_sections: allSections(false),
};

// Server-side calls go straight to Flask; the browser goes through the /api rewrite in next.config.ts.
const API_URL = process.env.API_URL ?? "http://localhost:5000";
// Admin edits show up on the public site within this many seconds.
const REVALIDATE_SECONDS = 60;

async function getData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiEnvelope<T>;
    return body.data;
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await getData<{ settings: SiteSettings }>("/settings");
  return data?.settings ?? EMPTY_SETTINGS;
}

export async function getAnnouncements(placement: Announcement["placement"]): Promise<Announcement[]> {
  const data = await getData<{ announcements: Announcement[] }>(`/announcements?placement=${placement}`);
  return data?.announcements ?? [];
}

export type Category = { id: number; name: string; slug: string };

export type PostSummary = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  post_type: "blog" | "market_update";
  author: { id: number; name: string };
  category: Category | null;
  published_at: string | null;
  created_at: string;
};

export type Post = PostSummary & { content: string; updated_at: string };

export type PostPage = {
  posts: PostSummary[];
  meta: { page: number; per_page: number; total: number; pages: number };
};

export async function getPosts(options: {
  type: PostSummary["post_type"];
  category?: string;
  page?: number;
  perPage?: number;
}): Promise<PostPage> {
  const params = new URLSearchParams({ type: options.type, page: String(options.page ?? 1) });
  if (options.category) params.set("category", options.category);
  if (options.perPage) params.set("per_page", String(options.perPage));
  const data = await getData<PostPage>(`/posts?${params}`);
  return data ?? { posts: [], meta: { page: 1, per_page: 10, total: 0, pages: 0 } };
}

/** A published post, or null if it doesn't exist (drafts are never returned to the public site). */
export async function getPost(slug: string): Promise<Post | null> {
  const data = await getData<{ post: Post }>(`/posts/${encodeURIComponent(slug)}`);
  return data?.post ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const data = await getData<{ categories: Category[] }>("/categories");
  return data?.categories ?? [];
}

export type TeamMember = {
  id: number;
  name: string;
  designation: string | null;
  qualifications: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
};

export async function getTeam(): Promise<TeamMember[]> {
  const data = await getData<{ team: TeamMember[] }>("/team");
  return data?.team ?? [];
}

export type Testimonial = { id: number; author_name: string; author_detail: string | null; content: string };

export async function getTestimonials(): Promise<Testimonial[]> {
  const data = await getData<{ testimonials: Testimonial[] }>("/testimonials");
  return data?.testimonials ?? [];
}
