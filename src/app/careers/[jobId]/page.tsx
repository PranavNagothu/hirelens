import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicJob, parseSkills } from "@/lib/data";
import { CareerApplyForm } from "./CareerApplyForm";

export default async function CareerJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await getPublicJob(jobId);
  if (!job) notFound();

  const required = parseSkills(job.requiredSkills);
  const preferred = parseSkills(job.preferredSkills);

  return (
    <div>
      <Link href="/careers" className="text-sm text-muted transition-colors hover:text-ink">
        ← All roles
      </Link>

      <header className="mt-3 mb-6">
        <span className="text-sm font-medium text-brand-ink">{job.org.name}</span>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{job.title}</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">{job.description}</p>
      </header>

      <div className="mb-8 flex flex-wrap gap-1.5">
        {required.map((s) => (
          <span
            key={s}
            className="rounded-full bg-brand-wash px-3 py-1 text-xs font-medium text-brand-ink ring-1 ring-brand/15"
          >
            {s}
          </span>
        ))}
        {preferred.map((s) => (
          <span
            key={s}
            className="rounded-full bg-plane px-3 py-1 text-xs font-medium text-ink-2 ring-1 ring-line"
          >
            {s}
          </span>
        ))}
        {job.minYears > 0 && (
          <span className="rounded-full bg-plane px-3 py-1 text-xs font-medium text-ink-2 ring-1 ring-line">
            {job.minYears}+ yrs
          </span>
        )}
      </div>

      <div className="glass rounded-lg border border-line p-6">
        <h2 className="mb-1 text-lg font-semibold text-ink">Apply for this role</h2>
        <p className="mb-5 text-sm text-muted">
          Upload your résumé — we&apos;ll match it to the role automatically.
        </p>
        <CareerApplyForm jobId={job.id} jobTitle={job.title} />
      </div>
    </div>
  );
}
