// Data access, always scoped to an organization.
//
// Every function here takes the caller's orgId and filters on it, so a query can only ever return
// objects the caller's org owns. This is the ownership boundary expressed as data access: there is no
// code path that reads another org's application. (The deliberately-vulnerable demo variant for the
// BoLD audit removes these `orgId` filters — keeping them all in one module makes that a clean diff.)
import { prisma } from "@/lib/db";
import type { ScoreBreakdown } from "@/lib/scoring/types";

export type JobRow = Awaited<ReturnType<typeof getOrgJobs>>[number];

export function getOrgJobs(orgId: string) {
  return prisma.job.findMany({
    where: { orgId },
    orderBy: { createdAt: "asc" },
    include: {
      applications: { select: { score: true, stage: true } },
    },
  });
}

// ── Public (candidate-facing) reads ──────────────────────────────────────────
// These are NOT org-scoped: the careers portal is public. They are deliberately limited to
// isPublic jobs and expose only what a job board shows (title, description, the company name) —
// never applications, candidates, notes, or scores. A candidate can see open roles; nothing else.
export function getPublicJobs() {
  return prisma.job.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      minYears: true,
      requiredSkills: true,
      org: { select: { name: true } },
    },
  });
}

export function getPublicJob(jobId: string) {
  return prisma.job.findFirst({
    where: { id: jobId, isPublic: true },
    select: {
      id: true,
      title: true,
      description: true,
      minYears: true,
      education: true,
      requiredSkills: true,
      preferredSkills: true,
      orgId: true,
      org: { select: { name: true } },
    },
  });
}

export function getOrgApplications(orgId: string) {
  return prisma.application.findMany({
    where: { orgId },
    include: { candidate: true, job: { select: { id: true, title: true } } },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
  });
}

export function getJobWithApplicants(orgId: string, jobId: string) {
  return prisma.job.findFirst({
    // The orgId in the filter is the ownership check: another org's job returns null -> 404.
    where: { id: jobId, orgId },
    include: {
      applications: {
        orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        include: { candidate: true },
      },
    },
  });
}

export function getApplicationDetail(orgId: string, applicationId: string) {
  return prisma.application.findFirst({
    where: { id: applicationId, orgId },
    include: { job: true, candidate: true },
  });
}

/** Parse the stored breakdown JSON back into a typed object. Returns null if absent/unparseable. */
export function parseBreakdown(json: string | null): ScoreBreakdown | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as ScoreBreakdown;
  } catch {
    return null;
  }
}

/** Parse a JSON string array (job skills), tolerant of bad data. */
export function parseSkills(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
