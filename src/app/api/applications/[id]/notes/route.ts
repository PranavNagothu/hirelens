// PUT /api/applications/[id]/notes — replace the private recruiter notes.
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/user";
import { badRequest, json, notFound, unauthorized } from "@/lib/http";

const Input = z.object({ notes: z.string().max(10_000) });

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid notes.");

  // Same ownership-in-the-WHERE pattern: only the caller org's application can be written.
  const result = await prisma.application.updateMany({
    where: { id, orgId: user.orgId },
    data: { notes: parsed.data.notes },
  });
  if (result.count === 0) return notFound();

  return json({ ok: true });
}
