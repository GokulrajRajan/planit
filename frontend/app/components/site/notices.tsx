import type { Announcement } from "@/lib/site-data";
import { SmartLink } from "./SmartLink";

/** The newest live "banner" announcement, under the home page hero. Nothing renders without one. */
export function HomeBanner({ banner }: { banner: Announcement | undefined }) {
  if (!banner) return null;
  return (
    <section className="home-banner" aria-label="Announcement">
      <div className="container home-banner__inner">
        <p className="home-banner__text">{banner.text}</p>
        {banner.link && (
          <SmartLink href={banner.link} className="pill pill--dark">
            Find out more
          </SmartLink>
        )}
      </div>
    </section>
  );
}

/** Live "notice" announcements, newest first (Investor Help Desk). */
export function NoticeList({ notices }: { notices: Announcement[] }) {
  return (
    <ul className="notice-list">
      {notices.map((notice) => (
        <li key={notice.id} className="notice">
          <p>{notice.text}</p>
          {notice.link && (
            <SmartLink href={notice.link} className="notice__link">
              Read more <span aria-hidden="true">→</span>
            </SmartLink>
          )}
        </li>
      ))}
    </ul>
  );
}
