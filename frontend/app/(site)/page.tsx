import { HOME_FAQS } from "@/lib/content/faqs";
import { INVESTOR_CONTENT } from "@/lib/content/investors";
import { HOW_IT_WORKS } from "@/lib/content/services";
import { getAnnouncements, getSiteSettings, getTestimonials } from "@/lib/site-data";
import { Hero } from "../components/Hero";
import { FloatingControls, MotionProvider } from "../components/motion";
import {
  FeaturePanel,
  HomeEnquiry,
  HomeFaq,
  HowItWorks,
  Manifesto,
  Newsletter,
  Stats,
  Testimonials,
  WhoWeServe,
  WordStack,
} from "../components/sections";
import { HomeBanner } from "../components/site/notices";
import { GeoBlocks, Mountain, PhoneMockup, Pie, ProCard } from "../components/visuals";

const WHO_WE_SERVE = INVESTOR_CONTENT.map((group) => ({
  title: group.title,
  headline: group.headline,
  href: `/investors/${group.slug}`,
}));

// The header and footer come from app/(site)/layout.tsx.
export default async function Home() {
  const [settings, banners] = await Promise.all([getSiteSettings(), getAnnouncements("banner")]);
  const visible = settings.visible_sections;
  const testimonials = visible.testimonials ? await getTestimonials() : [];

  return (
    <MotionProvider>
      <main id="main">
        <Hero startSipUrl={settings.cta.start_sip_url} />

        <HomeBanner banner={banners[0]} />

        <WordStack words={["Invest", "Plan", "Save", "Retire", "Grow"]} />

        <FeaturePanel
          id="mutual-funds"
          product="Mutual Funds"
          title="Choose funds that fit your goals, your timeline and your comfort with risk"
          href="/services/mutual-funds"
          textTone="dark"
          background="radial-gradient(75% 95% at 78% 55%, #fffaf4 0%, #fcefe1 40%, #f8e2cb 75%, #f4d8ba 100%)"
          visual={<PhoneMockup />}
          visualClassName="panel__visual--phone"
        />

        <FeaturePanel
          id="sip-planning"
          product="SIP Planning"
          title="Invest a fixed amount every month and let the habit do the heavy lifting"
          href="/services/sip-planning"
          textTone="dark"
          background="radial-gradient(45% 42% at 94% 100%, #fffaf4 0%, rgba(255, 250, 244, 0) 70%), radial-gradient(60% 40% at 45% 0%, rgba(249, 180, 94, 0.22), rgba(249, 180, 94, 0) 70%), linear-gradient(90deg, #fff6ec 0%, #fcecdc 44%, #f8e1ca 74%, #f5d9bd 100%)"
          bleed={<ProCard />}
          hold={0}
        />

        <Manifesto />

        <FeaturePanel
          id="goal-planning"
          product="Goal Planning"
          title="A home, an education, a dream holiday. Build every goal, block by block."
          href="/services/goal-planning"
          textTone="dark"
          bleed={<GeoBlocks />}
        />

        <FeaturePanel
          id="retirement-planning"
          product="Retirement Planning"
          title="Your summit is retirement. Start the climb early, and plan the way down too."
          href="/services/retirement-planning"
          textTone="dark"
          background="linear-gradient(180deg, #cdbba6 0%, #dac9b5 10%, #e6d7c4 20%, #efe0ce 30%, #f6e6d3 40%, #fae8d6 50%, #fde8d4 60%, #fee6d0 70%, #ffe3cc 80%, #ffdfc6 90%, #ffdcc0 100%)"
          bleed={<Mountain />}
          hold={0}
        />

        <FeaturePanel
          id="tax-saving"
          product="Tax Saving Investments"
          title="Save tax with ELSS funds, and understand the lock-in before you invest."
          href="/services/tax-saving-investments"
          textTone="dark"
          background="var(--color-cream)"
          visual={<Pie />}
        />

        <HowItWorks steps={HOW_IT_WORKS} />
        <WhoWeServe groups={WHO_WE_SERVE} />
        {visible.stats && <Stats stats={settings.stats} />}
        {visible.testimonials && testimonials.length > 0 && <Testimonials testimonials={testimonials} />}
        {visible.newsletter && <Newsletter />}
        {visible.faq && <HomeFaq faqs={HOME_FAQS} />}
        <HomeEnquiry />
      </main>
      <FloatingControls />
    </MotionProvider>
  );
}
