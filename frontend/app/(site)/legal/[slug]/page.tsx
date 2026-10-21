import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLegalPage, LEGAL_PAGES } from "@/lib/content/legal";
import { OFFICIAL_LINKS } from "@/lib/official-links";
import { LEGAL_NAV, ROUTES } from "@/lib/site";
import { getSiteSettings, type SiteSettings } from "@/lib/site-data";
import { formatDate, PageHero, Prose, Section } from "../../../components/site/page-kit";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_PAGES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getLegalPage((await params).slug);
  return page ? { title: page.title, description: page.summary } : {};
}

function ImportantLinks() {
  return (
    <ul className="link-list">
      {Object.values(OFFICIAL_LINKS).map((link) => (
        <li key={link.href}>
          <a href={link.href} target="_blank" rel="noopener noreferrer">
            {link.name}
          </a>{" "}
          — {link.label}
        </li>
      ))}
    </ul>
  );
}

function RegistrationDetails({ settings }: { settings: SiteSettings }) {
  const { registration: reg, office } = settings;
  if (!settings.visible_sections.registration_details) {
    return <p className="empty-state">Our registration details will be published here shortly.</p>;
  }
  return (
    <dl className="details">
      {office.legal_name && (
        <>
          <dt>Registered name</dt>
          <dd>{office.legal_name}</dd>
        </>
      )}
      <dt>Registration</dt>
      <dd>AMFI-registered Mutual Fund Distributor</dd>
      <dt>ARN</dt>
      <dd>{reg.arn}</dd>
      {(reg.arn_valid_from || reg.arn_valid_until) && (
        <>
          <dt>ARN validity</dt>
          <dd>
            {reg.arn_valid_from && `From ${formatDate(reg.arn_valid_from)}`}
            {reg.arn_valid_from && reg.arn_valid_until && " "}
            {reg.arn_valid_until && `until ${formatDate(reg.arn_valid_until)}`}
          </dd>
        </>
      )}
      {reg.euin && (
        <>
          <dt>EUIN</dt>
          <dd>
            {reg.euin}
            {reg.euin_valid_until && ` (valid until ${formatDate(reg.euin_valid_until)})`}
          </dd>
        </>
      )}
      {reg.cin && (
        <>
          <dt>CIN</dt>
          <dd>{reg.cin}</dd>
        </>
      )}
    </dl>
  );
}

function GrievanceDetails({ settings }: { settings: SiteSettings }) {
  const officer = settings.grievance_officer;
  return (
    <>
      {settings.visible_sections.grievance_officer && (
        <dl className="details">
          <dt>Grievance Officer</dt>
          <dd>
            {officer.name}
            {officer.designation && `, ${officer.designation}`}
          </dd>
          {officer.email && (
            <>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${officer.email}`}>{officer.email}</a>
              </dd>
            </>
          )}
          {officer.phone && (
            <>
              <dt>Phone</dt>
              <dd>{officer.phone}</dd>
            </>
          )}
          {officer.address && (
            <>
              <dt>Address</dt>
              <dd>{officer.address}</dd>
            </>
          )}
        </dl>
      )}
      <div className="prose">
        <h2>How to escalate a complaint</h2>
        <ol>
          <li>
            Contact us first through our <Link href={ROUTES.contact}>contact page</Link>
            {settings.visible_sections.grievance_officer && " or write to our Grievance Officer"}.
          </li>
          <li>If the issue concerns a scheme or transaction, you may also write to the fund house.</li>
          <li>
            If your complaint is not resolved, lodge it on SEBI&rsquo;s{" "}
            <a href={OFFICIAL_LINKS.scores.href} target="_blank" rel="noopener noreferrer">
              SCORES
            </a>{" "}
            portal.
          </li>
          <li>
            If you are still not satisfied, you can seek online conciliation and arbitration through{" "}
            <a href={OFFICIAL_LINKS.smartOdr.href} target="_blank" rel="noopener noreferrer">
              SMART ODR
            </a>
            .
          </li>
        </ol>
      </div>
    </>
  );
}

/** One readable template for all 12 legal pages; their text lives in lib/content/legal.ts. */
export default async function LegalPage({ params }: Props) {
  const page = getLegalPage((await params).slug);
  if (!page) notFound();
  const settings = await getSiteSettings();
  const related = LEGAL_NAV.flatMap((group) => group.links).filter((link) => link.href !== `/legal/${page.slug}`);

  return (
    <main id="main">
      <PageHero crumbs={[{ label: "Legal", href: "" }, { label: page.title, href: "" }]} title={page.title} intro={page.summary} />

      <Section tone="paper">
        <div className="legal-layout">
          <div className="legal-body">
            {page.builtIn === "important-links" && <ImportantLinks />}
            {page.builtIn === "registration" && <RegistrationDetails settings={settings} />}
            {page.builtIn === "grievance" && <GrievanceDetails settings={settings} />}

            {page.sections ? (
              <Prose sections={page.sections} />
            ) : (
              !page.builtIn && (
                <p className="empty-state">
                  This document is being finalised and will be published here shortly. If you need it now, please{" "}
                  <Link href={ROUTES.contact}>contact us</Link>.
                </p>
              )
            )}
          </div>

          <nav className="side-links" aria-label="Other legal pages">
            <h3>Other documents</h3>
            <ul>
              {related.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Section>
    </main>
  );
}
