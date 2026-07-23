// Map a 0-100 score to a status band. The band drives BOTH a colour and a text label, so the
// meaning is never carried by colour alone (the data-viz status rule).

export type Band = "strong" | "fair" | "weak";

export function scoreBand(score: number): Band {
  if (score >= 80) return "strong";
  if (score >= 60) return "fair";
  return "weak";
}

export const BAND_LABEL: Record<Band, string> = {
  strong: "Strong match",
  fair: "Fair match",
  weak: "Weak match",
};

// Tailwind classes per band, referencing the design-system tokens. `text`/`ring`/`wash` are the
// foreground, border, and tint respectively; `mark` is the solid fill used for the gauge arc.
export const BAND_CLASS: Record<Band, { text: string; wash: string; ring: string; mark: string }> = {
  strong: {
    text: "text-strong",
    wash: "bg-strong-wash",
    ring: "ring-strong/30",
    mark: "text-strong",
  },
  fair: {
    text: "text-fair",
    wash: "bg-fair-wash",
    ring: "ring-fair/30",
    mark: "text-fair-mark",
  },
  weak: {
    text: "text-weak",
    wash: "bg-weak-wash",
    ring: "ring-weak/30",
    mark: "text-weak",
  },
};
