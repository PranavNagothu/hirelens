"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";

// The public application form: name, email, and a résumé file (PDF / DOCX / TXT). Submits as
// multipart to the public apply endpoint. The candidate only ever sees a confirmation — never a
// score (that is the recruiter's, by design).
export function CareerApplyForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please attach your résumé.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("name", name);
      body.set("email", email);
      body.set("resume", file);
      const res = await fetch(`/api/careers/${jobId}/apply`, { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-strong/30 bg-strong-wash p-8 text-center"
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-strong/15 text-2xl text-strong">
          ✓
        </div>
        <h3 className="text-lg font-semibold text-ink">Application received</h3>
        <p className="mt-1 text-sm text-ink-2">
          Thanks, {name.split(" ")[0] || "there"}. Your application for{" "}
          <span className="font-medium text-ink">{jobTitle}</span> is in. The hiring team will be in
          touch.
        </p>
      </motion.div>
    );
  }

  const field =
    "w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted shadow-sm transition-colors focus:border-brand";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-ink-2">
            Full name
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
        <label className="block text-sm font-medium text-ink-2">Résumé</label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) setFile(f);
          }}
          className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragOver ? "border-brand bg-brand-wash" : "border-line bg-plane hover:border-brand/50"
          }`}
        >
          {file ? (
            <>
              <span className="text-sm font-medium text-ink">{file.name}</span>
              <span className="text-xs text-muted">{(file.size / 1024).toFixed(0)} KB · click to replace</span>
            </>
          ) : (
            <>
              <span className="text-2xl">📄</span>
              <span className="text-sm font-medium text-ink-2">Drop your résumé here, or click to browse</span>
              <span className="text-xs text-muted">PDF, DOCX, or TXT · up to 5 MB</span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,text/plain"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && (
        <p className="rounded-md bg-weak-wash px-3 py-2 text-sm text-weak ring-1 ring-weak/20">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-ink disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
