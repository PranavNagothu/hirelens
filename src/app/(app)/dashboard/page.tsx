import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/user";
import { getOrgApplications, getOrgJobs } from "@/lib/data";
import { DashboardClient, type Row } from "@/components/dashboard/DashboardClient";

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Both queries are org-scoped in src/lib/data.ts, so the dashboard can only ever show this org.
  const [apps, jobs] = await Promise.all([
    getOrgApplications(user.orgId),
    getOrgJobs(user.orgId),
  ]);

  const rows: Row[] = apps.map((a) => ({
    appId: a.id,
    name: a.candidate.name,
    email: a.candidate.email,
    jobId: a.job.id,
    jobTitle: a.job.title,
    stage: a.stage,
    score: a.score,
  }));

  return (
    <div>
      <DashboardClient
        rows={rows}
        jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
        orgName={user.org.name}
      />

      {/* Roles overview, below the interactive analytics */}
      <h2 className="mb-3 mt-9 text-sm font-semibold uppercase tracking-wider text-muted">
        Open roles
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {jobs.map((job) => {
          const s = job.applications.map((a) => a.score ?? NaN).filter((n) => !Number.isNaN(n));
          return (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group rounded-lg border border-line bg-surface p-5 transition-colors hover:border-brand/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-ink group-hover:text-brand-ink">{job.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">
                    {job.applications.length} applicant{job.applications.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-ink-2">
                <span>
                  Avg match <span className="font-semibold text-ink tnum">{avg(s) ?? "—"}</span>
                </span>
                <span className="text-muted">·</span>
                <span className="text-brand-ink group-hover:underline">View pipeline →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
