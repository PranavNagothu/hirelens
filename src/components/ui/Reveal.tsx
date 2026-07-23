"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

// A small entrance animation: fade + rise into place. `index` staggers a list so items cascade in
// rather than appearing all at once. Respects reduced-motion via motion's built-in handling.
export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
