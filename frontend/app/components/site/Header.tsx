"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navContains, ROUTES, type NavGroup } from "@/lib/site";
import type { Announcement } from "@/lib/site-data";
import { AnnouncementBar } from "./AnnouncementBar";
import { Logo } from "./Logo";

const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const ExternalArrow = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

/** Pie: the mutual fund folio. */
const FolioIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4v10.5zM14 3.5a8 8 0 0 1 6.5 6.5H14z" />
  </svg>
);

/** Candlesticks: the demat account. */
const DematIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 3v4M7 16v5M17 3v5M17 17v4M4.5 7h5v9h-5zM14.5 8h5v9h-5z" />
  </svg>
);

/**
 * One half of the highlighted capsule above the header bar: a link to another site, opened in a new tab.
 * Phones show the short label so both links fit side by side.
 */
function StripLink({
  href,
  icon,
  label,
  shortLabel,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  shortLabel: string;
}) {
  return (
    <a className="strip-link" href={href} target="_blank" rel="noopener noreferrer">
      <span className="strip-link__icon">{icon}</span>
      <span className="strip-link__full">{label}</span>
      <span className="strip-link__short">{shortLabel}</span>
      <span className="strip-link__arrow">
        <ExternalArrow />
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const groupId = (group: NavGroup) => group.label.toLowerCase().replace(/\s+/g, "-");
const isInGroup = (group: NavGroup, pathname: string) => navContains(group.links, pathname);

export function SiteHeader({
  nav,
  logoUrl,
  portalUrl,
  dematUrl,
  announcement,
}: {
  /** lib/site.ts headerNav(): the menu without links to hidden sections. */
  nav: NavGroup[];
  logoUrl: string | null;
  /** The client's MF folio portal; only passed while the link is set and switched on in site settings. */
  portalUrl: string | null;
  /** Where "Open a Free Demat Account" goes (site settings → Links); null hides it. */
  dematUrl: string | null;
  announcement: Announcement | null;
}) {
  const pathname = usePathname();
  // Each menu remembers the page it was opened on, so navigating away closes it.
  const [menuOpenedOn, setMenuOpenedOn] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState<{ label: string; on: string } | null>(null);
  const menuOpen = menuOpenedOn === pathname;
  const openDropdown = dropdown?.on === pathname ? dropdown.label : null;

  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const pointerType = useRef("mouse");

  const closeAll = () => {
    setDropdown(null);
    setMenuOpenedOn(null);
  };

  // Escape (returning focus to the button that opened the menu) and clicks outside close any open menu.
  useEffect(() => {
    if (!menuOpen && !openDropdown) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      headerRef.current?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')?.focus();
      closeAll();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeAll();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen, openDropdown]);

  // Mouse users get hover menus; touch and keyboard users toggle with a tap or Enter.
  const hoverOpen = (label: string) => (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    setDropdown({ label, on: pathname });
  };
  const hoverClose = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => setDropdown(null), 150);
  };
  const clickTrigger = (label: string, event: React.MouseEvent) => {
    const fromMouse = event.detail > 0 && pointerType.current === "mouse";
    // A mouse click lands on a menu the hover already opened: keep it open rather than toggling it shut.
    if (fromMouse) setDropdown({ label, on: pathname });
    else setDropdown(openDropdown === label ? null : { label, on: pathname });
  };

  return (
    <div className="site-top">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {announcement && <AnnouncementBar announcement={announcement} />}

      <header className="header" ref={headerRef}>
        {(portalUrl || dematUrl) && (
          <div className="header__strip">
            <div className="strip-links">
              {portalUrl && (
                <StripLink href={portalUrl} icon={<FolioIcon />} label="View Your MF Folio" shortLabel="View MF Folio" />
              )}
              {dematUrl && (
                <StripLink href={dematUrl} icon={<DematIcon />} label="Open a Free Demat Account" shortLabel="Free Demat Account" />
              )}
            </div>
          </div>
        )}
        <div className="header__bar">
          <Logo logoUrl={logoUrl} className="header__logo" />

          <nav className="header__nav" aria-label="Main">
            <ul className="header__nav-list">
              {nav.map((group) => {
                const open = openDropdown === group.label;
                return (
                  <li
                    key={group.label}
                    className="header__nav-item"
                    onPointerEnter={hoverOpen(group.label)}
                    onPointerLeave={hoverClose}
                  >
                    <button
                      type="button"
                      className="header__nav-trigger"
                      aria-expanded={open}
                      aria-controls={`nav-${groupId(group)}`}
                      data-active={isInGroup(group, pathname) || undefined}
                      onPointerDown={(event) => (pointerType.current = event.pointerType)}
                      onClick={(event) => clickTrigger(group.label, event)}
                    >
                      {group.label}
                      <Chevron />
                    </button>
                    <div id={`nav-${groupId(group)}`} className="header__dropdown" hidden={!open}>
                      <ul>
                        {group.links.map((link) => (
                          // A link with sub-links opens a fly-out on hover or keyboard focus (CSS only).
                          <li key={link.href || link.label} className={link.links ? "header__has-sub" : undefined}>
                            {link.href ? (
                              <Link
                                href={link.href}
                                aria-current={link.href === pathname ? "page" : undefined}
                                data-active={(link.links && navContains(link.links, pathname)) || undefined}
                                onClick={() => setDropdown(null)}
                              >
                                {link.label}
                                {link.links && <ChevronRight />}
                              </Link>
                            ) : (
                              // A heading with no page of its own: focusable, so keyboard users can open its fly-out.
                              <button
                                type="button"
                                className="header__sub-label"
                                data-active={(link.links && navContains(link.links, pathname)) || undefined}
                              >
                                {link.label}
                                <ChevronRight />
                              </button>
                            )}
                            {link.links && (
                              <ul className="header__sub" aria-label={link.label}>
                                {link.links.map((sub) => (
                                  <li key={sub.href}>
                                    <Link
                                      href={sub.href}
                                      aria-current={sub.href === pathname ? "page" : undefined}
                                      onClick={() => setDropdown(null)}
                                    >
                                      {sub.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="header__actions">
            <Link className="pill pill--dark header__cta" href={ROUTES.contact}>
              <span className="header__cta-full">Book a Free Consultation</span>
              <span className="header__cta-short">Free Consultation</span>
            </Link>
            <button
              type="button"
              className="icon-btn header__menu-btn"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpenedOn(menuOpen ? null : pathname)}
            >
              {menuOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M5 9h14M5 15h14" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <nav id="mobile-menu" className="header__mobile" aria-label="Main" hidden={!menuOpen}>
          {nav.map((group) => (
            <details key={group.label} className="header__group" open={isInGroup(group, pathname) || undefined}>
              <summary>
                {group.label}
                <Chevron />
              </summary>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href || link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        aria-current={link.href === pathname ? "page" : undefined}
                        onClick={() => setMenuOpenedOn(null)}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="header__group-label">{link.label}</span>
                    )}
                    {link.links && (
                      <ul className="header__group-sub">
                        {link.links.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              aria-current={sub.href === pathname ? "page" : undefined}
                              onClick={() => setMenuOpenedOn(null)}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          ))}
          <div className="header__mobile-actions">
            <Link className="pill pill--dark pill--lg" href={ROUTES.contact} onClick={() => setMenuOpenedOn(null)}>
              Book a Free Consultation
            </Link>
          </div>
        </nav>
      </header>
    </div>
  );
}
