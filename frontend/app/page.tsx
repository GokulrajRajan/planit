import { Hero } from "./components/Hero";
import { FloatingControls, MotionProvider } from "./components/motion";
import { Nav } from "./components/Nav";
import { FeaturePanel, Footer, Manifesto, Newsletter, Trusted, WordStack } from "./components/sections";
import { GeoBlocks, Mountain, PhoneMockup, Pie, ProCard } from "./components/visuals";

export default function Home() {
  return (
    <MotionProvider>
      <div className="landing">
        <Nav />
        <main>
          <Hero />

          <WordStack words={["Write", "Publish", "Organize", "Discuss", "Grow"]} />

          <FeaturePanel
            id="editor"
            product="Editor"
            title="The world's most rewarding writing app"
            href="/register"
            textTone="light"
            background="radial-gradient(75% 95% at 78% 55%, #d6cbdc 0%, #ada2b4 40%, #7a7080 75%, #645b68 100%)"
            visual={<PhoneMockup />}
            visualClassName="panel__visual--phone"
          />

          <FeaturePanel
            id="pro"
            product="Pro"
            title="The simplest way to get paid for everything you write"
            href="/register"
            textTone="light"
            background="radial-gradient(45% 42% at 94% 100%, #ece8ea 0%, rgba(236, 232, 234, 0) 70%), radial-gradient(60% 40% at 45% 0%, rgba(150, 136, 128, 0.35), rgba(150, 136, 128, 0) 70%), linear-gradient(90deg, #5f5450 0%, #7d726d 44%, #a29489 74%, #b1a49c 100%)"
            bleed={<ProCard />}
            hold={0}
          />

          <Manifesto />

          <FeaturePanel
            id="tags"
            product="Tags"
            title="Organize like a pro with faster tools, smarter tags, and $0 fees"
            href="/register"
            textTone="light"
            bleed={<GeoBlocks />}
          />

          <FeaturePanel
            id="dashboard"
            product="Dashboard"
            title="The Summit view. Every read, every reader, long-term growth, zero maintenance."
            href="/register"
            textTone="dark"
            background="linear-gradient(180deg, #aea9b4 0%, #c6bdcc 10%, #ded2e2 20%, #f1e1f2 30%, #f7e2f0 40%, #f9e1e5 50%, #fae3e0 60%, #f9e2d6 70%, #ffe3d4 80%, #ffdfd1 90%, #ffdccc 100%)"
            bleed={<Mountain />}
            hold={0}
          />

          <FeaturePanel
            id="categories"
            product="Categories"
            title="The Classic layout. Clean, organized, and as detailed (or not) as you need."
            href="/register"
            textTone="dark"
            background="var(--color-cream)"
            visual={<Pie />}
          />

          <Newsletter />
          <Trusted />
        </main>
        <Footer />
        <FloatingControls />
      </div>
    </MotionProvider>
  );
}
