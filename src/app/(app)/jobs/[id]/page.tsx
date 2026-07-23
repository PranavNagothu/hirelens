import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import { getJobWithApplicants, parseSkills } from "@/lib/data";
import { ScorePill } from "@/components/ui/ScoreRing";
import { StageBadge } from "@/components/ui/StageBadge";

// Next 16: route params arrive as a Promise and must be awaited.
export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const job = await getJobWithApplicants(user.orgId, id);
  if (!job) notFound();

  const required = parseSkills(job.requiredSkills);
  const preferred = parseSkills(job.preferredSkills);

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted transition-colors hover:text-ink">
        ← Dashboard
      </Link>

      <header className="mt-3 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{job.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">{job.description}</p>
      </header>

      {/* Criteria the scorer measures against */}
      <div className="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Required skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {required.map((s) => (
              <span
                key={s}
                className="rounded-full bg-brand-wash px-2.5 py-1 text-xs font-medium text-brand-ink ring-1 ring-brand/15"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Preferred · experience · education
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preferred.map((s) => (
              <span
                key={s}
                className="rounded-full bg-plane px-2.5 py-1 text-xs font-medium text-ink-2 ring-1 ring-line"
              >
                {s}
              </span>
            ))}
            <span className="rounded-full bg-plane px-2.5 py-1 text-xs font-medium text-ink-2 ring-1 ring-line">
              {job.minYears}+ yrs
            </span>
            {job.education && (
              <span className="rounded-full bg-plane px-2.5 py-1 text-xs font-medium text-ink-2 ring-1 ring-line capitalize">
                {job.education}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Candidates · ranked by match
        </h2>
        <Link
          href={`/jobs/${job.id}/apply`}
          className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-ink"
        >
          + Score a resume
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {job.applications.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">
            No candidates yet. Score a resume to get started.
          </p>
        )}
        {job.applications.map((app, i) => (
          <Link
            key={app.id}
            href={`/applications/${app.id}`}
            className="flex items-center gap-4 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-plane"
          >
            <span className="w-5 shrink-0 text-sm font-medium tnum text-muted">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{app.candidate.name}</p>
              <p className="truncate text-xs text-muted">{app.candidate.email}</p>
            </div>
            <StageBadge stage={app.stage} />
            <div className="w-24 text-right">
              <ScorePill score={app.score} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
