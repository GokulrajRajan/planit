import type { Metadata } from "next";
import { FAQ_GROUPS } from "@/lib/content/faqs";
import { getSiteSettings } from "@/lib/site-data";
import { CtaBand, FaqList, PageHero, Section } from "../../components/site/page-kit";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about mutual funds, SIPs, risks, costs and how Planit works.",
};

export default async function FaqsPage() {
  const settings = await getSiteSettings();

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Knowledge Center", href: "" }, { label: "FAQs", href: "" }]}
        title="Frequently asked questions"
        intro="Straight answers to the questions we hear most. Can't find yours? Ask us."
      />
      {FAQ_GROUPS.map((group, i) => (
        <Section key={group.title} tone={i % 2 === 0 ? "paper" : "cream"} title={group.title}>
          <FaqList faqs={group.faqs} />
        </Section>
      ))}
      <CtaBand cta={settings.cta} title="Still have questions?" />
    </main>
  );
}
