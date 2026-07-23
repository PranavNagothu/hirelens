// POST /api/careers/[jobId]/apply  — PUBLIC. A candidate applies to a public role with a résumé file.
//
// This is the candidate-facing door. No login: anyone can apply to a public posting, exactly like a
// real job board. The uploaded file is parsed to text, scored against THAT role's criteria, and an
// Application is created under the role's org (orgId: job.orgId) — which is what makes it appear in
// that company's recruiter dashboard automatically.
//
// The candidate receives only a confirmation. The score and breakdown are internal to the recruiter,
// never returned here — a candidate must not see (or influence) their own evaluation.
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getPublicJob, parseSkills } from "@/lib/data";
import { parseResume } from "@/lib/resume/parse";
import { scoreResume } from "@/lib/scoring/score";
import { badRequest, json, notFound } from "@/lib/http";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (under Vercel's 4.5 MB serverless request limit)
const Fields = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
): Promise<Response> {
  const { jobId } = await params;

  // Only a PUBLIC posting can be applied to. A private/unknown job is a 404 — no existence leak.
  const job = await getPublicJob(jobId);
  if (!job) return notFound("This role is not open for applications.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest("Expected a multipart form upload.");
  }

  const fields = Fields.safeParse({ name: form.get("name"), email: form.get("email") });
  if (!fields.success) return badRequest("Your name and a valid email are required.");

  const file = form.get("resume");
  if (!(file instanceof File) || file.size === 0) return badRequest("Please attach your résumé.");
  if (file.size > MAX_BYTES) return badRequest("That file is too large (max 5 MB).");

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await parseResume(buffer, file.name, file.type);
  if (!parsed.ok) return badRequest(parsed.reason);

  const breakdown = scoreResume(parsed.text, {
    requiredSkills: parseSkills(job.requiredSkills),
    preferredSkills: parseSkills(job.preferredSkills),
    minYears: job.minYears,
    education: job.education,
  });

  const candidate = await prisma.candidate.create({
    data: { name: fields.data.name, email: fields.data.email, resumeText: parsed.text },
  });
  await prisma.application.create({
    data: {
      orgId: job.orgId, // ← routes the application into the role's company dashboard
      jobId: job.id,
      candidateId: candidate.id,
      stage: "applied",
      score: breakdown.overall,
      breakdown: JSON.stringify(breakdown),
    },
  });

  // Confirmation only — never the score.
  return json({ ok: true });
}
