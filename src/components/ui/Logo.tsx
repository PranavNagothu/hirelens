import { cn } from "@/lib/ui";

// The HireLens wordmark: a lens/aperture mark (the "scoring lens") plus the name.
export function Logo({ className, mark = 22 }: { className?: string; mark?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg width={mark} height={mark} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="var(--color-brand)" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.5" fill="var(--color-brand)" />
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-[17px] font-semibold tracking-tight text-ink">
        Hire<span className="text-brand">Lens</span>
      </span>
    </span>
  );
}
