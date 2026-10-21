import type { Metadata } from "next";
import Link from "next/link";
import { OFFICIAL_LINKS } from "@/lib/official-links";
import { ROUTES } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-data";
import { CheckList, PageHero, Section } from "../../components/site/page-kit";

export const metadata: Metadata = {
  title: "Investor Help Desk",
  description: "Help with KYC, nominations, unclaimed investments and complaints, including SCORES and SMART ODR.",
};

const External = ({ name }: { name: keyof typeof OFFICIAL_LINKS }) => (
  <a href={OFFICIAL_LINKS[name].href} target="_blank" rel="noopener noreferrer">
    {OFFICIAL_LINKS[name].name}
  </a>
);

export default async function HelpDeskPage() {
  const settings = await getSiteSettings();
  const officer = settings.grievance_officer;
  const showOfficer = settings.visible_sections.grievance_officer;

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Investor Help Desk", href: "" }]}
        title="Investor Help Desk"
        intro="Practical help with the paperwork side of investing: KYC, nominations, lost investments and complaints."
      >
        <nav className="chips" aria-label="On this page">
          <a className="chip" href="#kyc">KYC</a>
          <a className="chip" href="#nominee">Nominees</a>
          <a className="chip" href="#unclaimed">Unclaimed investments</a>
          <a className="chip" href="#complaints">Complaints</a>
        </nav>
      </PageHero>

      <Section tone="paper" id="kyc" title="KYC (Know Your Customer)">
        <div className="two-col">
          <div className="prose">
            <p>
              You complete KYC once, through a KYC Registration Agency (KRA), and it then works across all mutual
              funds. You will need your PAN, proof of address (such as Aadhaar) and a photograph.
            </p>
            <p>
              Your KYC status will show as <strong>Validated</strong>, <strong>Registered</strong> or{" "}
              <strong>On hold / Rejected</strong>. If it is on hold, it needs updating before you can invest. You can
              check your status with any KRA or on <External name="mfCentral" />.
            </p>
          </div>
          <div>
            <h3 className="section-title section-title--small">We can help you</h3>
            <CheckList
              items={["Complete KYC for the first time", "Update your address, mobile number or email", "Fix KYC that is on hold"]}
            />
          </div>
        </div>
      </Section>

      <Section id="nominee" title="Nominees">
        <div className="prose">
          <p>
            Add a nominee to every folio, or formally opt out. A nomination makes it far simpler for your family to
            claim your investments if something happens to you. You can add, change or remove nominees online through
            the fund house or its registrar, or we can help you do it.
          </p>
        </div>
      </Section>

      <Section tone="paper" id="unclaimed" title="Unclaimed investments">
        <div className="prose">
          <p>
            Lost track of an old folio, or have redemption or dividend money that was never paid out? You can search
            using your PAN on <External name="mfCentral" /> and on the websites of fund houses and their registrars.
            Fund houses also publish lists of unclaimed amounts. Get in touch and we will help you trace and claim them.
          </p>
        </div>
      </Section>

      <Section id="complaints" title="Raising a complaint">
        <ol className="steps">
          <li>
            <h3>Contact us</h3>
            <p>
              Tell us what went wrong through our <Link href={ROUTES.contact}>contact page</Link>
              {showOfficer && (
                <>
                  {" "}
                  or write to our Grievance Officer, {officer.name}
                  {officer.email && (
                    <>
                      , at <a href={`mailto:${officer.email}`}>{officer.email}</a>
                    </>
                  )}
                  {officer.phone && <> ({officer.phone})</>}
                </>
              )}
              . We aim to resolve complaints quickly.
            </p>
          </li>
          <li>
            <h3>Write to the fund house</h3>
            <p>If the issue is with a scheme or a transaction, you can also contact the fund house directly.</p>
          </li>
          <li>
            <h3>SEBI SCORES</h3>
            <p>
              If your complaint isn&rsquo;t resolved, lodge it on SEBI&rsquo;s complaints portal, <External name="scores" />.
            </p>
          </li>
          <li>
            <h3>SMART ODR</h3>
            <p>
              If you are still not satisfied, you can start online conciliation and arbitration through{" "}
              <External name="smartOdr" />.
            </p>
          </li>
        </ol>
        <p className="section-link">
          Read our <Link href="/legal/grievance-redressal">Grievance Redressal policy</Link> and the{" "}
          <Link href="/legal/investor-charter">Investor Charter</Link>.
        </p>
      </Section>
    </main>
  );
}
