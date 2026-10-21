import type { Metadata } from "next";
import Link from "next/link";
import { OFFICIAL_LINKS } from "@/lib/official-links";
import { HEADER_NAV, ROUTES } from "@/lib/site";
import { PageHero, Section } from "../../components/site/page-kit";

export const metadata: Metadata = {
  title: "Useful Links",
  description: "Official investor resources from SEBI, AMFI, the depositories and the mutual fund registrars.",
};

const calculators = HEADER_NAV.find((group) => group.label === "Calculators")?.links ?? [];

export default function UsefulLinksPage() {
  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Knowledge Center", href: "" }, { label: "Useful Links", href: "" }]}
        title="Useful links"
        intro="Official resources for investors, and tools on this site to help you plan."
      />

      <Section tone="paper" title="Official resources" intro="These links open the official websites in a new tab.">
        <div className="card-grid">
          {Object.values(OFFICIAL_LINKS).map((link) => (
            <a key={link.href} className="card" href={link.href} target="_blank" rel="noopener noreferrer">
              <h3>{link.name}</h3>
              <p>{link.label}</p>
              <span className="card__more">{link.href.replace(/^https:\/\/(www\.)?/, "")} ↗</span>
            </a>
          ))}
        </div>
      </Section>

      <Section title="On this site">
        <div className="card-grid">
          <Link className="card" href={ROUTES.helpDesk}>
            <h3>Investor Help Desk</h3>
            <p>KYC, nominations, unclaimed investments and complaints.</p>
            <span className="card__more">Open →</span>
          </Link>
          {calculators.map((calculator) => (
            <Link key={calculator.href} className="card" href={calculator.href}>
              <h3>{calculator.label}</h3>
              <p>Illustrative estimates to help you plan. Not a guarantee of returns.</p>
              <span className="card__more">Open →</span>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}
