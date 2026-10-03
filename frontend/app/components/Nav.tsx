"use client";

import Link from "next/link";
import { useState } from "react";
import { logout, useAuth } from "@/lib/auth";

const MENU = [
  { title: "Product", links: ["Editor", "Categories", "Tags", "Dashboard"] },
  { title: "Community", links: ["Discover", "Comments", "Writers", "Newsletter"] },
  { title: "Learn", links: ["Guides", "Blog", "Changelog", "Help centre"] },
  { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const auth = useAuth();

  return (
    <header className="nav">
      <div className="nav__bar">
        <Link href="/" className="wordmark nav__logo" aria-label="Planit home">
          Planit
        </Link>
        <div className="nav__actions">
          <button type="button" className="icon-btn nav__search" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
          </button>
          {auth.status === "authenticated" ? (
            <>
              <span className="nav__user" title={auth.user.email}>
                Hi, {auth.user.name.split(" ")[0]}
              </span>
              <button type="button" className="pill pill--outline" onClick={() => logout()}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="pill pill--outline nav__login">
                Log in
              </Link>
              <Link href="/register" className="pill pill--dark">
                Get started
              </Link>
            </>
          )}
          <button
            type="button"
            className="icon-btn"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
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
      {open && (
        <nav className="nav__menu" aria-label="Main">
          {MENU.map((group) => (
            <div key={group.title}>
              <h4>{group.title}</h4>
              <ul>
                {group.links.map((l) => (
                  <li key={l}>
                    <a href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setOpen(false)}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
