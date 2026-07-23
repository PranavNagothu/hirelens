import "dotenv/config";
// Seed HireLens with two hiring organizations, their recruiters, jobs, candidates, and scored
// applications. Two orgs (Acme, Rival) exist so the app has a real ownership boundary from day one.
//
// Every application's score is computed by the SAME deterministic scorer the app uses, so the seeded
// numbers are real (not hand-picked) and the ranking within a job is meaningful evidence that the
// scorer works: the strong candidate outranks the weak one, by construction of their resumes.
//
// Run: npm run db:seed   (relative imports so `tsx` needs no path-alias resolution)

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { scoreResume } from "../src/lib/scoring/score";
import type { JobCriteria } from "../src/lib/scoring/types";

// Uses the same Postgres DATABASE_URL the app uses (a Neon connection string).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PASSWORD = "password"; // demo password for every seeded user

function criteria(j: {
  requiredSkills: string[];
  preferredSkills: string[];
  minYears: number;
  education: string | null;
}): JobCriteria {
  return j;
}

async function main() {
  // Idempotent: wipe in FK-safe order, then rebuild from scratch.
  await prisma.application.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // ── Organizations + recruiters ──────────────────────────────────────────────
  const acme = await prisma.organization.create({
    data: {
      name: "Acme Inc",
      slug: "acme",
      users: {
        create: {
          email: "alice@acme.io",
          name: "Alice Chen",
          role: "recruiter",
          passwordHash,
        },
      },
    },
  });

  const rival = await prisma.organization.create({
    data: {
      name: "Rival Corp",
      slug: "rival",
      users: {
        create: {
          email: "bob@rival.io",
          name: "Bob Ortiz",
          role: "recruiter",
          passwordHash,
        },
      },
    },
  });

  // ── Acme job: Senior Backend Engineer ───────────────────────────────────────
  const backend = {
    requiredSkills: ["Python", "PostgreSQL", "Docker", "AWS", "REST"],
    preferredSkills: ["Kubernetes", "GraphQL", "Terraform"],
    minYears: 4,
    education: "bachelor" as string | null,
  };
  const backendJob = await prisma.job.create({
    data: {
      orgId: acme.id,
      title: "Senior Backend Engineer",
      description:
        "Build and scale our API platform. You will own services in Python, design PostgreSQL " +
        "schemas, containerize with Docker, and deploy on AWS. REST API design is core. " +
        "Kubernetes, GraphQL, and Terraform are a plus.",
      requiredSkills: JSON.stringify(backend.requiredSkills),
      preferredSkills: JSON.stringify(backend.preferredSkills),
      minYears: backend.minYears,
      education: backend.education,
      isPublic: true,
    },
  });

  // ── Rival job: Senior Frontend Engineer ─────────────────────────────────────
  const frontend = {
    requiredSkills: ["React", "TypeScript", "CSS", "Next.js"],
    preferredSkills: ["Tailwind", "GraphQL"],
    minYears: 3,
    education: "bachelor" as string | null,
  };
  const frontendJob = await prisma.job.create({
    data: {
      orgId: rival.id,
      title: "Senior Frontend Engineer",
      description:
        "Craft delightful UI. You will build with React, TypeScript, and modern CSS, and ship " +
        "with Next.js. Tailwind and GraphQL experience is welcome.",
      requiredSkills: JSON.stringify(frontend.requiredSkills),
      preferredSkills: JSON.stringify(frontend.preferredSkills),
      minYears: frontend.minYears,
      education: frontend.education,
      isPublic: true,
    },
  });

  // ── Candidates + scored applications ────────────────────────────────────────
  // Resumes are written so the deterministic scorer ranks them strong > medium > weak.
  const applicants: {
    name: string;
    email: string;
    resumeText: string;
    orgId: string;
    jobId: string;
    job: JobCriteria;
    stage: string;
  }[] = [
    {
      name: "Priya Nair",
      email: "priya.nair@example.com",
      orgId: acme.id,
      jobId: backendJob.id,
      job: criteria(backend),
      stage: "interview",
      resumeText:
        "Senior Software Engineer with 7 years of experience building backend systems. " +
        "Expert in Python and PostgreSQL. Shipped microservices with Docker and Kubernetes on AWS. " +
        "Designed REST and GraphQL APIs. Master of Science in Computer Science, 2016.",
    },
    {
      name: "Marcus Webb",
      email: "marcus.webb@example.com",
      orgId: acme.id,
      jobId: backendJob.id,
      job: criteria(backend),
      stage: "screening",
      resumeText:
        "Backend developer, 4 years of experience. Strong in Python and PostgreSQL, building " +
        "REST APIs. Some exposure to AWS. Bachelor of Science in Information Systems, 2019.",
    },
    {
      name: "Dana Liu",
      email: "dana.liu@example.com",
      orgId: acme.id,
      jobId: backendJob.id,
      job: criteria(backend),
      stage: "applied",
      resumeText:
        "Junior engineer with 2 years of experience. Worked mainly in Java and MySQL. " +
        "Built a few REST endpoints. Bachelor of Arts in Economics, 2021.",
    },
    {
      name: "Sam Rivera",
      email: "sam.rivera@example.com",
      orgId: rival.id,
      jobId: frontendJob.id,
      job: criteria(frontend),
      stage: "interview",
      resumeText:
        "Frontend Engineer, 5 years of experience. Deep expertise in React, TypeScript, and CSS. " +
        "Shipped production apps with Next.js and Tailwind. Bachelor of Science in Design, 2018.",
    },
    {
      name: "Alex Kim",
      email: "alex.kim@example.com",
      orgId: rival.id,
      jobId: frontendJob.id,
      job: criteria(frontend),
      stage: "applied",
      resumeText:
        "Web developer, 2 years of experience. Comfortable with React and CSS. Learning " +
        "TypeScript. Bachelor of Science in Computer Science, 2022.",
    },
  ];

  for (const a of applicants) {
    const breakdown = scoreResume(a.resumeText, a.job);
    const candidate = await prisma.candidate.create({
      data: { name: a.name, email: a.email, resumeText: a.resumeText },
    });
    await prisma.application.create({
      data: {
        orgId: a.orgId,
        jobId: a.jobId,
        candidateId: candidate.id,
        stage: a.stage,
        score: breakdown.overall,
        breakdown: JSON.stringify(breakdown),
        notes: "",
      },
    });
    console.log(`  ${a.name.padEnd(14)} -> ${breakdown.overall}`);
  }

  console.log("\nSeed complete.");
  console.log("  Acme  : alice@acme.io / password");
  console.log("  Rival : bob@rival.io  / password");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
