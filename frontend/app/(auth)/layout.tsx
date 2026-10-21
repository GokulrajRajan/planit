import Link from "next/link";
import { resolveLogoUrl } from "@/lib/logo";
import { GlassPortfolio } from "../components/Hero";
import { Logo } from "../components/site/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing auth">
      <div className="auth__col">
        <header className="auth__top">
          <Logo logoUrl={resolveLogoUrl()} className="auth__logo" />
          <Link href="/" className="auth__back">
            ← Back to home
          </Link>
        </header>
        <main className="auth__main">{children}</main>
        <footer className="auth__foot">© {new Date().getFullYear()} Planit · Made for people who write.</footer>
      </div>

      <aside className="auth__art" aria-hidden="true">
        <div className="hero__bg" />
        <div className="auth__art-card">
          <GlassPortfolio value={1248350} chart />
        </div>
        <p className="auth__art-quote">Write more. Reach more.</p>
      </aside>
    </div>
  );
}
