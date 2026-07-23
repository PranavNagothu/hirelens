import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import { getJobWithApplicants, parseSkills } from "@/lib/data";
import { ApplyForm } from "./ApplyForm";

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const job = await getJobWithApplicants(user.orgId, id);
  if (!job) notFound();

  const required = parseSkills(job.requiredSkills);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/jobs/${job.id}`} className="text-sm text-muted transition-colors hover:text-ink">
        ← {job.title}
      </Link>

      <header className="mt-3 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Score a résumé</h1>
        <p className="mt-1 text-sm text-ink-2">
          Scored against <span className="font-medium text-ink">{job.title}</span> —{" "}
          {required.slice(0, 4).join(", ")}
          {required.length > 4 ? ", …" : ""}
        </p>
      </header>

      <div className="rounded-lg border border-line bg-surface p-6">
        <ApplyForm jobId={job.id} />
      </div>
    </div>
  );
}
