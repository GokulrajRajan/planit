import Link from "next/link";
import { GlassReads } from "../components/Hero";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing auth">
      <div className="auth__col">
        <header className="auth__top">
          <Link href="/" className="wordmark auth__logo" aria-label="Planit home">
            Planit
          </Link>
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
          <GlassReads reads={312148} chart />
        </div>
        <p className="auth__art-quote">Write more. Reach more.</p>
      </aside>
    </div>
  );
}
