import { cn } from "@/lib/ui";

// A skill, shown as matched or missing. Colour AND an icon carry the state, so a colourblind reader
// still tells them apart (matched = check, missing = dash).
export function SkillChip({ skill, present }: { skill: string; present: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        present
          ? "bg-strong-wash text-strong ring-strong/25"
          : "bg-plane text-muted ring-line line-through decoration-muted/50",
      )}
    >
      <span aria-hidden className="text-[13px] leading-none">
        {present ? "✓" : "–"}
      </span>
      {skill}
    </span>
  );
}
