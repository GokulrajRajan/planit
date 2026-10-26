"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, CircleCheckIcon, CircleDashedIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi, adminKeys, type DashboardStats } from "@/lib/admin-api";
import type { SectionKey } from "@/lib/site-data";
import { SECTION_INFO } from "./sections";
import { EmptyState, formatDateTime, PageHeader, QueryState } from "./ui";

const TILES: { key: keyof DashboardStats; label: string; href: string; highlight?: boolean }[] = [
  { key: "new_enquiries", label: "New enquiries", href: "/admin/enquiries", highlight: true },
  { key: "newsletter_subscribers", label: "Newsletter subscribers", href: "/admin/newsletter" },
  { key: "published_blog_posts", label: "Published blog posts", href: "/admin/blog" },
  { key: "published_market_updates", label: "Published market updates", href: "/admin/market-update" },
  { key: "draft_posts", label: "Drafts", href: "/admin/blog" },
  { key: "active_announcements", label: "Live announcements", href: "/admin/announcements" },
];

export function Dashboard() {
  const stats = useQuery({ queryKey: adminKeys.stats, queryFn: adminApi.stats });

  return (
    <>
      <PageHeader title="Dashboard" description="What's new on the website, and what still needs setting up." />

      <QueryState isPending={stats.isPending} error={stats.error} onRetry={() => stats.refetch()} rows={2}>
        {stats.data && (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {TILES.map((tile) => (
              <li key={tile.key}>
                <Link
                  href={tile.href}
                  className="block h-full rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/25"
                >
                  <span className="block text-sm text-muted-foreground">{tile.label}</span>
                  <span className="mt-1 flex items-center gap-2 text-3xl font-semibold tabular-nums">
                    {stats.data[tile.key]}
                    {tile.highlight && stats.data[tile.key] > 0 && <Badge>Needs a reply</Badge>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </QueryState>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RecentEnquiries />
        <SetupChecklist />
      </div>
    </>
  );
}

function RecentEnquiries() {
  const enquiries = useQuery({
    queryKey: [...adminKeys.enquiries, { page: 1, status: "new" }],
    queryFn: () => adminApi.enquiries({ page: 1, status: "new" }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>New enquiries</CardTitle>
        <CardDescription>The latest messages that haven&apos;t been marked as handled.</CardDescription>
      </CardHeader>
      <CardContent>
        <QueryState isPending={enquiries.isPending} error={enquiries.error} onRetry={() => enquiries.refetch()} rows={3}>
          {enquiries.data?.enquiries.length ? (
            <ul className="divide-y">
              {enquiries.data.enquiries.slice(0, 5).map((enquiry) => (
                <li key={enquiry.id} className="flex items-baseline justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{enquiry.name}</p>
                    <p className="truncate text-muted-foreground">{enquiry.service_label ?? "General enquiry"}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(enquiry.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="You're all caught up">New enquiries from the website will appear here.</EmptyState>
          )}
          <Link href="/admin/enquiries" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
            All enquiries <ArrowRightIcon className="size-3.5" aria-hidden />
          </Link>
        </QueryState>
      </CardContent>
    </Card>
  );
}

/** Sections that are switched on but still hidden because the content they need isn't there yet. */
function SetupChecklist() {
  const settings = useQuery({ queryKey: adminKeys.settings, queryFn: adminApi.settings });
  const keys = Object.keys(SECTION_INFO) as SectionKey[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website setup</CardTitle>
        <CardDescription>
          Sections stay hidden until they have real content, so nothing on the site is a placeholder.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QueryState isPending={settings.isPending} error={settings.error} onRetry={() => settings.refetch()} rows={3}>
          {settings.data && (
            <ul className="divide-y">
              {keys
                .filter((key) => SECTION_INFO[key].needs && settings.data.sections[key])
                .map((key) => {
                  const info = SECTION_INFO[key];
                  const live = settings.data.visible_sections[key];
                  return (
                    <li key={key} className="flex items-start gap-3 py-2.5">
                      {live ? (
                        <CircleCheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                      ) : (
                        <CircleDashedIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {info.label} <span className="sr-only">{live ? "(showing)" : "(hidden)"}</span>
                        </p>
                        {!live && <p className="text-muted-foreground">Hidden until you add {info.needs}.</p>}
                      </div>
                      {!live && (
                        <Link href={info.fixHref} className="shrink-0 text-sm font-medium text-primary">
                          Add
                        </Link>
                      )}
                    </li>
                  );
                })}
            </ul>
          )}
        </QueryState>
      </CardContent>
    </Card>
  );
}
