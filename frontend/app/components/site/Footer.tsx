import Link from "next/link";
import { phoneLinks } from "@/lib/phone";
import { OFFICIAL_LINKS } from "@/lib/official-links";
import { FOOTER_QUICK_LINKS, LEGAL_NAV, MF_RISK_WARNING /* HIDDEN_LEGAL: , ROUTES */ } from "@/lib/site";
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

/** A label over its number, in the row of registration numbers. */
function Registration({ label, lines }: { label: string; lines: (string | null | false)[] }) {
  return (
    <div>
      <dt>{label}</dt>
      {lines.filter(Boolean).map((line) => (
        <dd key={String(line)}>{line}</dd>
      ))}
    </div>
  );
}

/** Site footer. Contact, registration and grievance details appear only once they're filled in. */
export function SiteFooter({ settings, logoUrl }: { settings: SiteSettings; logoUrl: string | null }) {
  const { office, registration, grievance_officer: officer, visible_sections: visible } = settings;
  const firmName = office.legal_name ?? "Planit";
  // The client's ARN is in a person's name (Site settings → Registration); otherwise it's the firm's.
  const arnHolder = registration.arn_holder ?? firmName;
  const cityLine = [office.city, office.state].filter(Boolean).join(", ");
  const cityAndPin = [cityLine, office.pincode].filter(Boolean).join(" - ");
  const addressLines = [office.address_line1, [office.address_line2, cityAndPin].filter(Boolean).join(", ")].filter(Boolean);
  const hasContact = Boolean(addressLines.length || office.phone || office.email || office.hours);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo logoUrl={logoUrl} />
            <p>Mutual fund distribution for individuals, families and businesses.</p>
            {visible.social_links && <SocialLinks links={settings.social_links} />}
          </div>

          {hasContact && (
            <div>
              <h4>Contact us</h4>
              <address className="footer__contact">
                {addressLines.length > 0 && (
                  <span>
                    {addressLines.map((line, i) => (
                      <span key={line} className="block">
                        {line}
                        {i < addressLines.length - 1 && ","}
                      </span>
                    ))}
                  </span>
                )}
                {phoneLinks(office.phone ?? "").map((phone) => (
                  <a key={phone.href} href={phone.href}>
                    {phone.label}
                  </a>
                ))}
                {office.email && <a href={`mailto:${office.email}`}>{office.email}</a>}
                {office.hours && <span>{office.hours}</span>}
              </address>
            </div>
          )}

          <nav className="footer__links" aria-label="Quick links">
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
                    View Your MF Folio
                  </a>
                </li>
              )}
              {settings.cta.open_account_url && (
                <li>
                  <a href={settings.cta.open_account_url} target="_blank" rel="noopener noreferrer">
                    Open a Free Demat Account
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

        {visible.registration_details && (
          <dl className="footer__registrations">
            {registration.arn && (
              <Registration
                label="AMFI-registered Mutual Fund Distributor"
                lines={[
                  `${arnHolder} | ${registration.arn}`,
                  registration.arn_valid_until && `Valid till ${formatDate(registration.arn_valid_until)}`,
                  registration.euin && `EUIN: ${registration.euin}`,
                ]}
              />
            )}
            {registration.nse_ap_number && <Registration label="NSE Regn. No." lines={[registration.nse_ap_number]} />}
            {registration.bse_ap_number && <Registration label="BSE Regn. No." lines={[registration.bse_ap_number]} />}
            {registration.gstin && <Registration label="GSTIN" lines={[registration.gstin]} />}
            {registration.cin && <Registration label="CIN" lines={[registration.cin]} />}
          </dl>
        )}

        <div className="footer__compliance">
          <p className="footer__warning">{MF_RISK_WARNING}</p>
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
          <p>
            Past performance is not indicative of future returns. Figures shown on this website are illustrative
            examples, not a promise or guarantee of returns. We earn commission from mutual fund houses on the schemes
            we distribute.
            {/* HIDDEN_LEGAL: the sentence ended:
            we distribute; it is fully disclosed in our{" "}
            <Link href={ROUTES.commissionDisclosures}>Commission Disclosures</Link>. */}
          </p>
          <p>
            Complaints not resolved by us can be raised on <OfficialLink name="scores" />. For folio service requests,
            you can also contact your fund&rsquo;s registrar, such as <OfficialLink name="kfintech" />.
            {/* HIDDEN_INVESTOR_INFO: See our{" "}
            <Link href="/legal/grievance-redressal">Grievance Redressal</Link> policy. */}
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
