"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SAMPLE =
  "Senior Software Engineer with 6 years of experience. Expert in Python and PostgreSQL, " +
  "shipping containerized services with Docker on AWS. Designed REST and GraphQL APIs. " +
  "Bachelor of Science in Computer Science, 2019.";

// Paste a résumé, score it. On success we jump straight to the scored application so the reviewer
// sees the breakdown appear — the "score a resume live" moment.
export function ApplyForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, resumeText }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Could not score this résumé.");
        setBusy(false);
        return;
      }
      router.push(`/applications/${body.applicationId}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted shadow-sm transition-colors focus:border-brand";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-ink-2">
            Candidate name
          </label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Jordan Lee" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-ink-2">
            Email
          </label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="jordan@example.com" />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="resume" className="block text-sm font-medium text-ink-2">
            Résumé text
          </label>
          <button
            type="button"
            onClick={() => setResumeText(SAMPLE)}
            className="text-xs font-medium text-brand-ink hover:underline"
          >
            Paste sample
          </button>
        </div>
        <textarea
          id="resume"
          required
          rows={10}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className={`${field} resize-y`}
          placeholder="Paste the candidate's résumé here…"
        />
      </div>

      {error && (
        <p className="rounded-md bg-weak-wash px-3 py-2 text-sm text-weak ring-1 ring-weak/20">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-ink disabled:opacity-60"
      >
        {busy ? "Scoring…" : "Score résumé"}
      </button>
    </form>
  );
}
