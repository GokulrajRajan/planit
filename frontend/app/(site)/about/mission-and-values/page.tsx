import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-data";
import { CtaBand, PageHero, Section } from "../../../components/site/page-kit";

export const metadata: Metadata = {
  title: "Mission and Values",
  description: "Our mission is to help every investor we work with start early, invest with a plan and understand what they own.",
};

const VALUES = [
  {
    title: "Clarity",
    body: "We explain things in plain language, including the risks and the costs, so you always understand what you own and why.",
  },
  {
    title: "Honesty",
    body: "We never promise returns, and we disclose how we are paid. If something isn't right for you, we will say so.",
  },
  {
    title: "Discipline",
    body: "Good investing is patient and regular. We help you stay the course through market ups and downs.",
  },
  {
    title: "Care",
    body: "Your goals are personal. We listen first, and we are here when your plans change.",
  },
  {
    title: "Privacy",
    body: "Your financial information is yours. We collect only what we need and protect it carefully.",
  },
];

export default async function MissionPage() {
  const settings = await getSiteSettings();

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "About Us", href: "" }, { label: "Mission and Values", href: "" }]}
        title="Our mission"
        intro="To help every investor we work with start early, invest with a plan and understand what they own."
      />

      <Section tone="paper" title="What we value">
        <div className="card-grid">
          {VALUES.map((value) => (
            <div key={value.title} className="card">
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand cta={settings.cta} />
    </main>
  );
}
