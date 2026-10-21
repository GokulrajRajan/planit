import type { SiteSettings, SocialNetwork } from "@/lib/site-data";

const NETWORKS: { key: SocialNetwork; label: string; icon: React.ReactNode }[] = [
  {
    key: "facebook",
    label: "Facebook",
    icon: <path d="M14.5 8.5h2V5h-2.5C11.3 5 10 6.6 10 9v2H8v3.5h2V21h3.5v-6.5H16l.5-3.5h-3V9.5c0-.6.4-1 1-1z" />,
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.2 6.8v.01" />
      </>
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
        <path d="M8 10.5V16.5M8 7.5v.01M11.5 16.5v-6M11.5 13c0-1.7 1-2.7 2.5-2.7s2.5 1 2.5 2.7v3.5" />
      </>
    ),
  },
  {
    key: "x",
    label: "X (Twitter)",
    icon: <path d="M4.5 4.5l15 15M19.5 4.5l-15 15" />,
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10.5 9.5v5l4.2-2.5z" />
      </>
    ),
  },
];

/** Icon links for whichever networks the admin has filled in. */
export function SocialLinks({ links }: { links: SiteSettings["social_links"] }) {
  const filled = NETWORKS.filter(({ key }) => links[key]);
  if (!filled.length) return null;

  return (
    <ul className="social">
      {filled.map(({ key, label, icon }) => (
        <li key={key}>
          <a className="icon-btn" href={links[key]!} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {icon}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
