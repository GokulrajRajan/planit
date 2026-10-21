import Link from "next/link";
import { OFFICIAL_LINKS } from "@/lib/official-links";
import { FOOTER_QUICK_LINKS, LEGAL_NAV, MF_RISK_WARNING, ROUTES } from "@/lib/site";
import type { SiteSettings } from "@/lib/site-data";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

function OfficialLink({ name }: { name: keyof typeof OFFICIAL_LINKS }) {
  const link = OFFICIAL_LINKS[name];
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer" title={link.label}>
      {link.name}
    </a>
  );
}

/** Site footer. Contact, registration and grievance details appear only once they're filled in. */
export function SiteFooter({ settings, logoUrl }: { settings: SiteSettings; logoUrl: string | null }) {
  const { office, registration, grievance_officer: officer, visible_sections: visible } = settings;
  const firmName = office.legal_name ?? "Planit";
  const cityLine = [office.city, office.state].filter(Boolean).join(", ");
  const address = [office.address_line1, office.address_line2, [cityLine, office.pincode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  const hasContact = Boolean(address || office.phone || office.email || office.hours);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo logoUrl={logoUrl} />
            <p>Mutual fund distribution for individuals, families and businesses.</p>
            {hasContact && (
              <address className="footer__contact">
                {address && <span>{address}</span>}
                {office.phone && <a href={`tel:${office.phone.replace(/[^\d+]/g, "")}`}>{office.phone}</a>}
                {office.email && <a href={`mailto:${office.email}`}>{office.email}</a>}
                {office.hours && <span>{office.hours}</span>}
              </address>
            )}
            {visible.social_links && <SocialLinks links={settings.social_links} />}
          </div>

          <nav aria-label="Quick links">
            <h4>Quick links</h4>
            <ul>
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
              {visible.client_login && settings.portal_url && (
                <li>
                  <a href={settings.portal_url} target="_blank" rel="noopener noreferrer">
                    Client Login
                  </a>
                </li>
              )}
            </ul>
          </nav>

          {LEGAL_NAV.map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <h4>{group.label}</h4>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="footer__compliance">
          {visible.registration_details && (
            <p>
              {firmName} is an AMFI-registered Mutual Fund Distributor. ARN: {registration.arn}
              {registration.arn_valid_until && ` (valid till ${formatDate(registration.arn_valid_until)})`}
              {registration.euin && ` · EUIN: ${registration.euin}`}
              {registration.cin && ` · CIN: ${registration.cin}`}
            </p>
          )}
          {visible.grievance_officer && (
            <p>
              Grievance Officer: {officer.name}
              {officer.designation && `, ${officer.designation}`}
              {officer.email && (
                <>
                  {" · "}
                  <a href={`mailto:${officer.email}`}>{officer.email}</a>
                </>
              )}
              {officer.phone && ` · ${officer.phone}`}
            </p>
          )}
          <p className="footer__warning">{MF_RISK_WARNING}</p>
          <p>
            Past performance is not indicative of future returns. Figures shown on this website are illustrative
            examples, not a promise or guarantee of returns. We earn commission from mutual fund houses on the schemes
            we distribute; it is fully disclosed in our{" "}
            <Link href={ROUTES.commissionDisclosures}>Commission Disclosures</Link>.
          </p>
          <p>
            Complaints not resolved by us can be raised on <OfficialLink name="scores" /> and{" "}
            <OfficialLink name="smartOdr" />. See our <Link href="/legal/grievance-redressal">Grievance Redressal</Link>{" "}
            policy.
          </p>
        </div>

        <div className="footer__legal">
          <span>
            © {new Date().getFullYear()} {firmName}. All rights reserved.
          </span>
          <span>
            <OfficialLink name="amfi" /> · <OfficialLink name="sebi" />
          </span>
        </div>
      </div>
    </footer>
  );
}
