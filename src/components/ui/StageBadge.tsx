import { cn } from "@/lib/ui";

// The pipeline stage of an application. Ordered applied -> screening -> interview -> offer, with
// rejected as a terminal off-track state. Neutral, professional tints (not the score status colours,
// which are reserved for match quality).
export const STAGES = ["applied", "screening", "interview", "offer", "rejected"] as const;
export type Stage = (typeof STAGES)[number];

const STYLE: Record<Stage, string> = {
  applied: "bg-plane text-ink-2 ring-line",
  screening: "bg-brand-wash text-brand-ink ring-brand/20",
  interview: "bg-brand-wash text-brand-ink ring-brand/30",
  offer: "bg-strong-wash text-strong ring-strong/25",
  rejected: "bg-weak-wash text-weak ring-weak/20",
};

const LABEL: Record<Stage, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export function StageBadge({ stage }: { stage: string }) {
  const s = (STAGES as readonly string[]).includes(stage) ? (stage as Stage) : "applied";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        STYLE[s],
      )}
    >
      {LABEL[s]}
    </span>
  );
}
