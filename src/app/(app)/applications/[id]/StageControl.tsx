"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STAGES } from "@/components/ui/StageBadge";

const LABELS: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

// Move an application through the pipeline. PATCH /api/applications/[id] is ownership-enforced
// server-side, so a recruiter can only advance their own org's candidates.
export function StageControl({
  applicationId,
  stage,
}: {
  applicationId: string;
  stage: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(stage);
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    setBusy(true);
    setValue(next);
    try {
      await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stage: next }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Stage</span>
      <select
        value={value}
        disabled={busy}
        onChange={(e) => change(e.target.value)}
        className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink shadow-sm transition-colors focus:border-brand disabled:opacity-50"
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
