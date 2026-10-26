import { brandStyle } from "@/lib/brand";
import { resolveLogoUrl } from "@/lib/logo";
import { headerNav } from "@/lib/site";
import { getAnnouncements, getSiteSettings } from "@/lib/site-data";
import { SiteFooter } from "../components/site/Footer";
import { SiteHeader } from "../components/site/Header";

/** Every public page: announcement bar, header, the page, then the footer with the risk disclaimer. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, announcements] = await Promise.all([getSiteSettings(), getAnnouncements("announcement_bar")]);
  const visible = settings.visible_sections;
  const logoUrl = resolveLogoUrl(settings.branding.logo_url);

  return (
    <div className="landing site" style={brandStyle(settings.branding)}>
      <SiteHeader
        nav={headerNav({ marketUpdate: visible.market_update })}
        logoUrl={logoUrl}
        portalUrl={visible.client_login ? settings.portal_url : null}
        announcement={visible.announcement_bar ? (announcements[0] ?? null) : null}
      />
      {children}
      <SiteFooter settings={settings} logoUrl={logoUrl} />
    </div>
  );
}
