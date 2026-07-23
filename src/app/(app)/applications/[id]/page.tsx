import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import { getApplicationDetail, parseBreakdown } from "@/lib/data";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { MatchBar } from "@/components/ui/MatchBar";
import { SkillChip } from "@/components/ui/SkillChip";
import { NotesEditor } from "./NotesEditor";
import { StageControl } from "./StageControl";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const app = await getApplicationDetail(user.orgId, id);
  if (!app) notFound();

  const b = parseBreakdown(app.breakdown);

  return (
    <div>
      <Link
        href={`/jobs/${app.jobId}`}
        className="text-sm text-muted transition-colors hover:text-ink"
      >
        ← {app.job.title}
      </Link>

      <header className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{app.candidate.name}</h1>
          <p className="mt-1 text-sm text-ink-2">
            {app.candidate.email} · applied to {app.job.title}
          </p>
        </div>
        <StageControl applicationId={app.id} stage={app.stage} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* ── Left: the score and its evidence ───────────────────────────── */}
        <div className="space-y-6">
          {b ? (
            <div className="rounded-lg border border-line bg-surface p-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
                <ScoreRing score={b.overall} />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                    Why this score
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">
                    Matched{" "}
                    <span className="font-semibold text-ink">
                      {b.requiredSkills.matched}/{b.requiredSkills.total}
                    </span>{" "}
                    required skills and{" "}
                    <span className="font-semibold text-ink">
                      {b.preferredSkills.matched}/{b.preferredSkills.total}
                    </span>{" "}
                    preferred, with{" "}
                    <span className="font-semibold text-ink">
                      {b.experience.candidateYears} yrs
                    </span>{" "}
                    experience (needs {b.experience.requiredYears}). Every point below traces to the
                    resume, and the same inputs always produce the same score.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-line pt-6">
                <MatchBar
                  label="Required skills"
                  pct={b.requiredSkills.pct}
                  weight={b.weights.requiredSkills}
                  detail={`${b.requiredSkills.matched}/${b.requiredSkills.total} matched`}
                />
                <div className="flex flex-wrap gap-1.5">
                  {b.requiredSkills.hits.map((h) => (
                    <SkillChip key={h.skill} skill={h.skill} present={h.present} />
                  ))}
                </div>

                <MatchBar
                  label="Preferred skills"
                  pct={b.preferredSkills.pct}
                  weight={b.weights.preferredSkills}
                  detail={`${b.preferredSkills.matched}/${b.preferredSkills.total} matched`}
                />
                <div className="flex flex-wrap gap-1.5">
                  {b.preferredSkills.hits.map((h) => (
                    <SkillChip key={h.skill} skill={h.skill} present={h.present} />
                  ))}
                </div>

                <MatchBar
                  label="Experience"
                  pct={b.experience.pct}
                  weight={b.weights.experience}
                  detail={`${b.experience.candidateYears} of ${b.experience.requiredYears} yrs`}
                />

                <MatchBar
                  label="Education"
                  pct={b.education.met ? 100 : 0}
                  weight={b.weights.education}
                  detail={
                    b.education.found
                      ? `${b.education.found}${b.education.met ? " ✓" : " (below bar)"}`
                      : "none found"
                  }
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-muted">
              This application has not been scored yet.
            </div>
          )}

          {/* Resume */}
          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
              Résumé
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
              {app.candidate.resumeText}
            </p>
          </div>
        </div>

        {/* ── Right: private recruiter notes ─────────────────────────────── */}
        <div className="space-y-6">
          <div className="rounded-lg border border-line bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Private notes
              </h2>
              <span className="text-[11px] text-muted">{user.org.name} only</span>
            </div>
            <NotesEditor applicationId={app.id} initialNotes={app.notes} />
          </div>
        </div>
      </div>
    </div>
  );
}
