import type { AxiosRequestConfig } from "axios";
import { api, toApiError, type ApiEnvelope } from "./api";
import type { Announcement, Category, PostSummary, SiteSettings, TeamMember, Testimonial } from "./site-data";

/** Typed calls to the admin endpoints. Every failure is thrown as an ApiError (see lib/api.ts). */

export type PageMeta = { page: number; per_page: number; total: number; pages: number };

export type DashboardStats = {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  published_blog_posts: number;
  published_market_updates: number;
  total_users: number;
  new_enquiries: number;
  total_enquiries: number;
  newsletter_subscribers: number;
  active_announcements: number;
};

export type Enquiry = {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string | null;
  service: string | null;
  service_label: string | null;
  message: string | null;
  handled: boolean;
  handled_at: string | null;
  notified_at: string | null;
  created_at: string;
};

export type EnquiryStatus = "new" | "handled";
export type PostStatus = "draft" | "published";
export type PostType = PostSummary["post_type"];
export type Tag = { id: number; name: string; slug: string };

export type AdminPostSummary = PostSummary & { status: PostStatus; tags: Tag[] };
export type AdminPost = AdminPostSummary & { content: string; updated_at: string };

export type PostInput = {
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: PostStatus;
  post_type: PostType;
  category_id: number | null;
  tag_names: string[];
};

export type AdminAnnouncement = Announcement & { active: boolean; created_at: string; updated_at: string };
export type AnnouncementInput = Omit<AdminAnnouncement, "id" | "created_at" | "updated_at">;

export type AdminTeamMember = TeamMember & { sort_order: number; visible: boolean };
export type TeamMemberInput = Omit<AdminTeamMember, "id">;

export type AdminTestimonial = Testimonial & { sort_order: number; visible: boolean };
export type TestimonialInput = Omit<AdminTestimonial, "id">;

export type Subscriber = { id: number; email: string; consented_at: string; created_at: string };

/** Settings PATCH merges groups key by key, so any subset can be sent. */
export type SettingsInput = Partial<{
  [K in Exclude<keyof SiteSettings, "visible_sections">]: SiteSettings[K] extends unknown[]
    ? SiteSettings[K]
    : SiteSettings[K] extends object
      ? Partial<SiteSettings[K]>
      : SiteSettings[K];
}>;

/** A write's server message, for the toast. */
export type Saved<T = void> = { data: T; message: string };

async function call<T>(config: AxiosRequestConfig): Promise<ApiEnvelope<T>> {
  try {
    const res = await api.request<ApiEnvelope<T>>(config);
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

const read = <T>(url: string, params?: Record<string, unknown>) =>
  call<T>({ method: "get", url, params }).then((body) => body.data);

async function write<T>(method: "post" | "patch" | "delete", url: string, data?: unknown): Promise<Saved<T>> {
  const body = await call<T>({ method, url, data });
  return { data: body.data, message: body.message };
}

/** Drops empty filters so they don't reach the query string. */
function params(values: Record<string, string | number | null | undefined>) {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v !== null && v !== undefined && v !== ""));
}

/** CSV exports need the bearer token, so they're fetched as a blob and saved from memory. */
async function download(url: string, query: Record<string, unknown>, fallbackName: string) {
  try {
    const res = await api.get<Blob>(url, { params: query, responseType: "blob" });
    const disposition = String(res.headers["content-disposition"] ?? "");
    const name = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? fallbackName;
    const href = URL.createObjectURL(res.data);
    const link = Object.assign(document.createElement("a"), { href, download: name });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  } catch (err) {
    throw toApiError(err);
  }
}

export const adminApi = {
  stats: () => read<{ stats: DashboardStats }>("/dashboard/stats").then((d) => d.stats),

  enquiries: (query: { page: number; status: EnquiryStatus | null }) =>
    read<{ enquiries: Enquiry[]; meta: PageMeta }>("/enquiries", params({ page: query.page, status: query.status })),
  setEnquiryHandled: (id: number, handled: boolean) =>
    write<{ enquiry: Enquiry }>("patch", `/enquiries/${id}`, { handled }),
  exportEnquiries: (status: EnquiryStatus | null) =>
    download("/enquiries/export", params({ status }), "enquiries.csv"),

  posts: (query: { page: number; type: PostType; status: PostStatus | null; search: string }) =>
    read<{ posts: AdminPostSummary[]; meta: PageMeta }>("/posts/mine", params(query)),
  post: (id: number) => read<{ post: AdminPost }>(`/posts/id/${id}`).then((d) => d.post),
  createPost: (input: PostInput) => write<{ post: AdminPost }>("post", "/posts", input),
  updatePost: (id: number, input: Partial<PostInput>) => write<{ post: AdminPost }>("patch", `/posts/${id}`, input),
  deletePost: (id: number) => write("delete", `/posts/${id}`),

  categories: () => read<{ categories: Category[] }>("/categories").then((d) => d.categories),
  createCategory: (name: string) => write<{ category: Category }>("post", "/categories", { name }),
  updateCategory: (id: number, name: string) => write<{ category: Category }>("patch", `/categories/${id}`, { name }),
  deleteCategory: (id: number) => write("delete", `/categories/${id}`),

  announcements: () =>
    read<{ announcements: AdminAnnouncement[] }>("/announcements/all").then((d) => d.announcements),
  createAnnouncement: (input: AnnouncementInput) =>
    write<{ announcement: AdminAnnouncement }>("post", "/announcements", input),
  updateAnnouncement: (id: number, input: Partial<AnnouncementInput>) =>
    write<{ announcement: AdminAnnouncement }>("patch", `/announcements/${id}`, input),
  deleteAnnouncement: (id: number) => write("delete", `/announcements/${id}`),

  team: () => read<{ team: AdminTeamMember[] }>("/team/all").then((d) => d.team),
  createTeamMember: (input: TeamMemberInput) => write<{ team_member: AdminTeamMember }>("post", "/team", input),
  updateTeamMember: (id: number, input: Partial<TeamMemberInput>) =>
    write<{ team_member: AdminTeamMember }>("patch", `/team/${id}`, input),
  deleteTeamMember: (id: number) => write("delete", `/team/${id}`),

  testimonials: () => read<{ testimonials: AdminTestimonial[] }>("/testimonials/all").then((d) => d.testimonials),
  createTestimonial: (input: TestimonialInput) =>
    write<{ testimonial: AdminTestimonial }>("post", "/testimonials", input),
  updateTestimonial: (id: number, input: Partial<TestimonialInput>) =>
    write<{ testimonial: AdminTestimonial }>("patch", `/testimonials/${id}`, input),
  deleteTestimonial: (id: number) => write("delete", `/testimonials/${id}`),

  subscribers: (page: number) => read<{ subscribers: Subscriber[]; meta: PageMeta }>("/newsletter", { page }),
  deleteSubscriber: (id: number) => write("delete", `/newsletter/${id}`),
  exportSubscribers: () => download("/newsletter/export", {}, "newsletter-subscribers.csv"),

  settings: () => read<{ settings: SiteSettings }>("/settings").then((d) => d.settings),
  updateSettings: (input: SettingsInput) => write<{ settings: SiteSettings }>("patch", "/settings", input),
};

/** Query keys, grouped so a write can invalidate everything that shows the same data. */
export const adminKeys = {
  stats: ["admin", "stats"] as const,
  enquiries: ["admin", "enquiries"] as const,
  posts: ["admin", "posts"] as const,
  // Not under "posts", so deleting a post can refresh the lists without refetching the deleted post.
  post: (id: number) => ["admin", "post", id] as const,
  categories: ["admin", "categories"] as const,
  announcements: ["admin", "announcements"] as const,
  team: ["admin", "team"] as const,
  testimonials: ["admin", "testimonials"] as const,
  subscribers: ["admin", "subscribers"] as const,
  settings: ["admin", "settings"] as const,
};
