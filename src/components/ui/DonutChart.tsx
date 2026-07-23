"use client";

import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cn } from "@/lib/ui";

export type DonutSlice = {
  key: string;
  label: string;
  value: number;
  color: string; // CSS color
  active?: boolean;
  onClick?: () => void;
};

// A part-to-whole donut: each slice's arc length encodes its share, its colour encodes the category
// (validated status palette for score bands). Arcs animate in on mount. A legend beside it names every
// slice with its count, so identity never rides on colour alone. The centre shows the total.
export function DonutChart({
  slices,
  total,
  centerLabel = "candidates",
  size = 168,
}: {
  slices: DonutSlice[];
  total: number;
  centerLabel?: string;
  size?: number;
}) {
  const stroke = 20;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const sum = slices.reduce((a, s) => a + s.value, 0);

  // Precompute each arc's dash length and rotation offset around the ring.
  let offsetFrac = 0;
  const arcs = slices.map((s) => {
    const frac = sum > 0 ? s.value / sum : 0;
    const arc = { s, frac, startFrac: offsetFrac };
    offsetFrac += frac;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
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
          {arcs.map(({ s, frac, startFrac }) => (
            <motion.circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={s.active ? stroke + 3 : stroke}
              strokeDasharray={`${frac * circ} ${circ}`}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: -startFrac * circ }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ opacity: sum === 0 ? 0 : 1 }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber value={total} className="text-3xl font-semibold tnum text-ink" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
            {centerLabel}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-1.5">
        {slices.map((s) => {
          const pct = sum > 0 ? Math.round((s.value / sum) * 100) : 0;
          return (
            <li key={s.key}>
              <button
                onClick={s.onClick}
                disabled={!s.onClick}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors",
                  s.onClick && "hover:bg-plane",
                  s.active && "bg-brand-wash",
                )}
              >
                <span className="h-3 w-3 shrink-0 rounded-[4px]" style={{ background: s.color }} />
                <span className="flex-1 text-sm text-ink-2">{s.label}</span>
                <span className="text-sm font-semibold tnum text-ink">{s.value}</span>
                <span className="w-9 text-right text-xs tnum text-muted">{pct}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
