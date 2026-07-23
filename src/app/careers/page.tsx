import Link from "next/link";
import { getPublicJobs, parseSkills } from "@/lib/data";

// Rendered on demand so the build never needs a database connection.
export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const jobs = await getPublicJobs();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Open roles</h1>
        <p className="mt-2 text-ink-2">Find your next role. Apply in minutes with your résumé.</p>
      </div>

      {jobs.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface p-8 text-center text-muted">
          No open roles right now. Check back soon.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => {
            const skills = parseSkills(job.requiredSkills);
            return (
              <Link
                key={job.id}
                href={`/careers/${job.id}`}
                className="glass card-lift group flex flex-col rounded-lg border border-line p-5"
              >
                <span className="text-xs font-medium text-brand-ink">{job.org.name}</span>
                <h2 className="mt-1 text-lg font-semibold text-ink group-hover:text-brand-ink">
                  {job.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-ink-2">{job.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {skills.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-brand-wash px-2.5 py-1 text-xs font-medium text-brand-ink ring-1 ring-brand/15"
                    >
                      {s}
                    </span>
                  ))}
                  {job.minYears > 0 && (
                    <span className="rounded-full bg-plane px-2.5 py-1 text-xs font-medium text-ink-2 ring-1 ring-line">
                      {job.minYears}+ yrs
                    </span>
                  )}
                </div>
                <span className="mt-4 text-sm font-medium text-brand-ink group-hover:underline">
                  View & apply →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
