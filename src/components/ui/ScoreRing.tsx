"use client";

import { motion } from "motion/react";
import { scoreBand, BAND_CLASS, BAND_LABEL } from "@/lib/score-band";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cn } from "@/lib/ui";

// A circular score gauge: the hero number for one application. The arc DRAWS from empty to the score
// on mount, and the centre number counts up in step, so the score reveals itself. Colour encodes the
// band; the band label sits beneath so colour is never the only signal.
export function ScoreRing({
  score,
  size = 128,
  showLabel = true,
}: {
  score: number;
  size?: number;
  showLabel?: boolean;
}) {
  const band = scoreBand(score);
  const c = BAND_CLASS[band];
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-line"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            className={c.mark}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber
            value={Math.round(score)}
            duration={1.1}
            className={cn("text-3xl font-semibold tnum", c.text)}
          />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted">/ 100</span>
        </div>
      </div>
      {showLabel && <span className={cn("text-sm font-medium", c.text)}>{BAND_LABEL[band]}</span>}
    </div>
  );
}

// A compact inline score chip for lists and rows.
export function ScorePill({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-plane px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-line">
        Not scored
      </span>
    );
  }
  const band = scoreBand(score);
  const c = BAND_CLASS[band];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tnum ring-1",
        c.wash,
        c.text,
        c.ring,
      )}
    >
      {Math.round(score)}
      <span className="font-medium opacity-80">{BAND_LABEL[band].replace(" match", "")}</span>
    </span>
  );
}
