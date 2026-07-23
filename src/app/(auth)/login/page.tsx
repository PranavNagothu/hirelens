import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center bg-plane px-4 py-12">
      {/* soft brand glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-80 opacity-60"
        style={{
          background:
            "radial-gradient(600px 240px at 50% -40px, var(--color-brand-wash), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo mark={30} className="scale-110" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-2">Sign in to your recruiting workspace</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-6 shadow-sm">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          HireLens scores every applicant against the job, with a transparent breakdown.
        </p>
      </div>
    </div>
  );
}
