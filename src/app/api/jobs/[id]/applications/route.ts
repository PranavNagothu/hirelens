// POST /api/jobs/[id]/applications — add a candidate to a job and score their résumé.
//
// This is the scoring entry point: it runs the deterministic scorer against the job's criteria and
// stores both the score and its full breakdown, so the application detail can show the evidence.
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/user";
import { scoreResume } from "@/lib/scoring/score";
import { parseSkills } from "@/lib/data";
import { badRequest, json, notFound, unauthorized } from "@/lib/http";

const Input = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  resumeText: z.string().min(1).max(50_000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id: jobId } = await params;

  // The job must belong to the caller's org, or there is nothing here to apply to (404).
  const job = await prisma.job.findFirst({ where: { id: jobId, orgId: user.orgId } });
  if (!job) return notFound();

  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Name, email, and résumé text are required.");

  const { name, email, resumeText } = parsed.data;

  const breakdown = scoreResume(resumeText, {
    requiredSkills: parseSkills(job.requiredSkills),
    preferredSkills: parseSkills(job.preferredSkills),
    minYears: job.minYears,
    education: job.education,
  });

  const candidate = await prisma.candidate.create({ data: { name, email, resumeText } });
  const application = await prisma.application.create({
    data: {
      orgId: user.orgId,
      jobId: job.id,
      candidateId: candidate.id,
      stage: "applied",
      score: breakdown.overall,
      breakdown: JSON.stringify(breakdown),
    },
  });

  return json({ applicationId: application.id, score: breakdown.overall }, 201);
}
