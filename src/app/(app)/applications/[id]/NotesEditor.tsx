"use client";

import { useState } from "react";

// Private recruiter notes. Autosaves on demand via PUT /api/applications/[id]/notes. The server
// enforces that the note belongs to the caller's org, so this control can only ever edit its own.
export function NotesEditor({
  applicationId,
  initialNotes,
}: {
  applicationId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setState("saving");
    try {
      const res = await fetch(`/api/applications/${applicationId}/notes`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      setState(res.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setState("idle");
        }}
        rows={7}
        placeholder="Notes on this candidate — visible only to your team."
        className="w-full resize-none rounded-md border border-line bg-plane px-3 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand focus:bg-surface"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted">
          {state === "saving" && "Saving…"}
          {state === "saved" && "Saved ✓"}
          {state === "error" && <span className="text-weak">Could not save</span>}
        </span>
        <button
          onClick={save}
          disabled={state === "saving"}
          className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Save note
        </button>
      </div>
    </div>
  );
}
