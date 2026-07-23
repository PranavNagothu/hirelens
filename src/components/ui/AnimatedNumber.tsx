"use client";

import { useEffect, useState } from "react";
import { animate } from "motion/react";

// Counts up from 0 to `value` on mount / when the value changes. Used for KPI figures and scores so
// the numbers feel alive rather than snapping into place.
export function AnimatedNumber({
  value,
  duration = 1,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo — fast then settles
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span className={className}>{Math.round(display)}</span>;
}
