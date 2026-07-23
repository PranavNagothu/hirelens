import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

// Public shell for the careers portal — no auth, its own header (not the recruiter sidebar). The
// same animated gradient backdrop as the app, so the candidate-facing side feels part of the product.
export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <div className="aurora" aria-hidden />
      <header className="relative z-10 border-b border-line/60 bg-surface/70 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/careers">
            <Logo />
          </Link>
          <span className="text-sm font-medium text-muted">Careers</span>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-4xl px-5 py-10">{children}</main>
    </div>
  );
}
