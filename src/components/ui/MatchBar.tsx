"use client";

import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

// A single magnitude bar for a scored dimension (required skills, experience, ...). The fill grows
// from zero on mount and the percentage counts up with it, following the data-viz mark spec (thin
// track, rounded fill anchored to the baseline, value direct-labelled).
export function MatchBar({
  label,
  pct,
  detail,
  weight,
}: {
  label: string;
  pct: number;
  detail?: string;
  weight?: number;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-ink">{label}</span>
          {weight !== undefined && <span className="text-xs text-muted">weight {weight}%</span>}
        </div>
        <div className="flex items-baseline gap-2">
          {detail && <span className="text-xs text-ink-2">{detail}</span>}
          <span className="text-sm font-semibold tnum text-ink">
            <AnimatedNumber value={Math.round(pct)} duration={0.9} />%
          </span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, var(--color-seq-300), var(--color-seq-500))" }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
