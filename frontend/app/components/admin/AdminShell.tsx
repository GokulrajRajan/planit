"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ExternalLinkIcon,
  FolderIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MailIcon,
  MegaphoneIcon,
  MenuIcon,
  NewspaperIcon,
  QuoteIcon,
  SettingsIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api";
import { logout, useAuth, type User } from "@/lib/auth";
import logo from "@/public/brand/planit-logo.png";

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/enquiries", label: "Enquiries", icon: InboxIcon },
  { href: "/admin/blog", label: "Blog posts", icon: NewspaperIcon },
  { href: "/admin/market-update", label: "Market Update", icon: TrendingUpIcon },
  { href: "/admin/categories", label: "Categories", icon: FolderIcon },
  { href: "/admin/announcements", label: "Announcements", icon: MegaphoneIcon },
  { href: "/admin/team", label: "Team", icon: UsersIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: QuoteIcon },
  { href: "/admin/newsletter", label: "Newsletter", icon: MailIcon },
  { href: "/admin/settings", label: "Site settings", icon: SettingsIcon },
] as const;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Retry only failures that might go away (network, server errors), never 4xx answers.
        retry: (count, error) => count < 2 && (!(error instanceof ApiError) || error.status === 0 || error.status >= 500),
      },
    },
  });
}

/** Everything under /admin: signs the admin in (or sends them to /login), then the sidebar layout. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "anonymous") router.replace("/login");
  }, [auth.status, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="admin min-h-dvh bg-muted/40 font-sans text-foreground">
        {auth.status === "authenticated" && auth.user.role === "admin" ? (
          <Frame user={auth.user} onLogout={() => queryClient.clear()}>
            {children}
          </Frame>
        ) : auth.status === "authenticated" ? (
          <NotAnAdmin />
        ) : (
          <Loading />
        )}
      </div>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}

function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6" aria-busy="true" aria-label="Loading the admin panel">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function NotAnAdmin() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-4 p-6 pt-24">
      <h1 className="text-xl font-semibold">This account can&apos;t manage the website</h1>
      <p className="text-sm text-muted-foreground">Sign in with an admin account to use the admin panel.</p>
      <Button onClick={() => logout()}>Sign out</Button>
    </div>
  );
}

function Frame({ user, onLogout, children }: { user: User; onLogout: () => void; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const signOut = async () => {
    await logout();
    onLogout();
  };

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r bg-background lg:block">
        <div className="sticky top-0 flex h-dvh flex-col">
          <Sidebar user={user} onSignOut={signOut} />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4 lg:hidden">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Admin menu</SheetTitle>
            <Sidebar user={user} onSignOut={signOut} onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <AdminBrand />
      </header>

      <main id="main" className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** The Planit logo and an "admin" label, linking to the dashboard. */
function AdminBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/admin" className="flex items-center gap-2" onClick={onNavigate}>
      <Image src={logo} alt="Planit" width={86} height={32} />
      <span className="text-sm text-muted-foreground">admin</span>
    </Link>
  );
}

function Sidebar({ user, onSignOut, onNavigate }: { user: User; onSignOut: () => void; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <div className="flex h-14 items-center border-b px-5">
        <AdminBrand onNavigate={onNavigate} />
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="space-y-1 border-t p-3 text-sm">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-foreground/80 hover:bg-muted hover:text-foreground"
        >
          <ExternalLinkIcon className="size-4" aria-hidden />
          View website
        </a>
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-foreground/80 hover:bg-muted hover:text-foreground"
        >
          <LogOutIcon className="size-4" aria-hidden />
          Sign out
        </button>
        <p className="truncate px-3 pt-1 text-xs text-muted-foreground" title={user.email}>
          Signed in as {user.name}
        </p>
      </div>
    </>
  );
}
