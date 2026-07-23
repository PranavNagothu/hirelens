// The deterministic scorer.
//
// Pure function: (resume text + job criteria) -> a score with its full breakdown. No randomness, no
// network, no clock (extractYears uses the year only for a sanity cap, not the score). The same
// inputs always produce the same number, and every point is traceable to the breakdown. This is the
// reproducibility that lets us say the score is real rather than invented.

import { extractEducation, extractYears, skillsPresent, degreeRank } from "./extract";
import type { JobCriteria, ScoreBreakdown } from "./types";

// The rubric. These four weights sum to 100 and are shown to the user, so the maths is auditable.
export const WEIGHTS = {
  requiredSkills: 50,
  preferredSkills: 15,
  experience: 25,
  education: 10,
} as const;

function pct(matched: number, total: number): number {
  if (total <= 0) return 100; // nothing required -> that dimension is fully satisfied
  return Math.round((matched / total) * 100);
}

export function scoreResume(resumeText: string, job: JobCriteria): ScoreBreakdown {
  // --- required skills ---
  const reqHits = skillsPresent(resumeText, job.requiredSkills);
  const reqMatched = reqHits.filter((h) => h.present).length;
  const reqPct = pct(reqMatched, job.requiredSkills.length);

  // --- preferred skills ---
  const prefHits = skillsPresent(resumeText, job.preferredSkills);
  const prefMatched = prefHits.filter((h) => h.present).length;
  const prefPct = pct(prefMatched, job.preferredSkills.length);

  // --- experience ---
  const candidateYears = extractYears(resumeText);
  const requiredYears = job.minYears;
  const expMet = candidateYears >= requiredYears;
  const expPct =
    requiredYears <= 0 ? 100 : Math.min(100, Math.round((candidateYears / requiredYears) * 100));

  // --- education ---
  const found = extractEducation(resumeText);
  const eduMet = degreeRank(found) >= degreeRank(job.education);
  const eduPct = eduMet ? 100 : 0;

  // --- weighted overall ---
  const overall = Math.round(
    (reqPct * WEIGHTS.requiredSkills +
      prefPct * WEIGHTS.preferredSkills +
      expPct * WEIGHTS.experience +
      eduPct * WEIGHTS.education) /
      100,
  );

  return {
    overall,
    requiredSkills: {
      hits: reqHits,
      matched: reqMatched,
      total: job.requiredSkills.length,
      pct: reqPct,
    },
    preferredSkills: {
      hits: prefHits,
      matched: prefMatched,
      total: job.preferredSkills.length,
      pct: prefPct,
    },
    experience: { candidateYears, requiredYears, met: expMet, pct: expPct },
    education: { required: job.education, found, met: eduMet },
    weights: { ...WEIGHTS },
  };
}
