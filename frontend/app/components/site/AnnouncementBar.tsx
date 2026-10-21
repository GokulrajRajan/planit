"use client";

import { useSyncExternalStore } from "react";
import type { Announcement } from "@/lib/site-data";
import { SmartLink } from "./SmartLink";

// Dismissed announcement ids are remembered in this browser only; a new announcement shows again.
const STORAGE_KEY = "planit:dismissed-announcements";
const listeners = new Set<() => void>();
// Also kept in memory, so dismissing works even where storage is blocked.
const hiddenThisView = new Set<number>();

function readDismissed(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function dismiss(id: number) {
  const ids = new Set(readDismissed().split(",").filter(Boolean));
  ids.add(String(id));
  try {
    localStorage.setItem(STORAGE_KEY, [...ids].join(","));
  } catch {
    // Storage blocked (private mode): hiddenThisView still closes the bar until the next visit.
  }
  hiddenThisView.add(id);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function AnnouncementBar({ announcement }: { announcement: Announcement }) {
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => "");
  const isDismissed = hiddenThisView.has(announcement.id) || dismissed.split(",").includes(String(announcement.id));
  if (isDismissed) return null;

  return (
    <div className="announce" role="region" aria-label="Announcement">
      <p>
        {announcement.link ? (
          <SmartLink href={announcement.link}>{announcement.text}</SmartLink>
        ) : (
          announcement.text
        )}
      </p>
      <button
        type="button"
        className="announce__close"
        aria-label="Dismiss announcement"
        onClick={() => dismiss(announcement.id)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
