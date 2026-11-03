import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-data";
import { PageHero, Section } from "../../components/site/page-kit";

export const metadata: Metadata = {
  title: "View Your MF Folio",
  description: "See your mutual fund folios, statements and transactions online.",
};

/** Links out to the client's existing investment portal; this site has no client accounts of its own. */
export default async function ClientLoginPage() {
  const settings = await getSiteSettings();
  const portalUrl = settings.visible_sections.client_login ? settings.portal_url : null;

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "View Your MF Folio", href: "" }]}
        title="View your MF folio"
        intro="See your mutual fund folios, statements and transactions in your online investment account."
      >
        {portalUrl && (
          <p className="page-hero__actions">
            <a className="pill pill--dark pill--lg" href={portalUrl} target="_blank" rel="noopener noreferrer">
              Go to your MF folio ↗
            </a>
          </p>
        )}
      </PageHero>

      <Section tone="paper">
        <div className="prose">
          {portalUrl ? (
            <>
              <p>
                The portal opens in a new tab. Use the login details you received when your account was set up. If
                you&rsquo;ve forgotten your password, use the reset option on the portal&rsquo;s login page.
              </p>
              <p>
                Trouble logging in? <Link href={ROUTES.contact}>Contact us</Link> and we&rsquo;ll help.
              </p>
            </>
          ) : (
            <p>
              Online access details will be shared here soon. In the meantime, <Link href={ROUTES.contact}>contact us</Link>{" "}
              for statements or help with your investments.
            </p>
          )}
        </div>
      </Section>
    </main>
  );
}
