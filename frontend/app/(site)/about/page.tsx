import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-data";
import { CheckList, CtaBand, PageHero, Section } from "../../components/site/page-kit";

export const metadata: Metadata = {
  title: "About Planit",
  description: "Planit helps individuals, families and businesses invest in mutual funds with a clear plan.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "About Us", href: "" }, { label: "About Planit", href: "" }]}
        title="Plan it. Start early."
        intro="Planit helps individuals, families and businesses invest in mutual funds with a clear plan, and stay with it."
      />

      <Section tone="paper">
        <div className="two-col">
          <div className="prose">
            <p>
              Most people know they should invest. What holds them back is not knowing where to start, which of
              thousands of funds to choose, or whether they are doing enough. We started Planit to make that simpler.
            </p>
            <p>
              We are a mutual fund distributor. We take time to understand your goals, explain your options in plain
              language, help you choose schemes that suit you, handle the paperwork, and review your investments as
              your life changes.
            </p>
            <p>
              Fund houses pay us a commission on the schemes we distribute. We disclose it fully, because you should
              always know how the people helping you are paid.
            </p>
          </div>
          <div>
            <h2 className="section-title section-title--small">What we do</h2>
            <CheckList
              items={[
                "Mutual fund investments across equity, debt and hybrid funds",
                "SIP planning that fits your monthly budget",
                "Goal and retirement planning",
                "Tax-saving investments and insurance reviews",
                "Regular reviews and help with KYC, nominations and service requests",
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title="Learn more about us">
        <div className="card-grid">
          <Link className="card" href="/about/mission-and-values">
            <h3>Mission and Values</h3>
            <p>What we are here to do, and the principles behind every conversation.</p>
            <span className="card__more">Read more →</span>
          </Link>
          <Link className="card" href="/about/team">
            <h3>Our Team</h3>
            <p>The people you will work with.</p>
            <span className="card__more">Meet the team →</span>
          </Link>
          <Link className="card" href="/legal/registration-disclosure">
            <h3>Registration</h3>
            <p>Our registration with the Association of Mutual Funds in India (AMFI).</p>
            <span className="card__more">View details →</span>
          </Link>
        </div>
      </Section>

      <CtaBand cta={settings.cta} />
    </main>
  );
}
