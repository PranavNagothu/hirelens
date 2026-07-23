// PATCH /api/applications/[id] — change an application's pipeline stage.
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/user";
import { STAGES } from "@/components/ui/StageBadge";
import { badRequest, json, notFound, unauthorized } from "@/lib/http";

const Input = z.object({ stage: z.enum(STAGES) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid stage.");

  // Ownership is enforced in the WHERE clause: updateMany only touches rows owned by the caller's
  // org, and a count of 0 means the application either does not exist or is not theirs -> 404.
  const result = await prisma.application.updateMany({
    where: { id, orgId: user.orgId },
    data: { stage: parsed.data.stage },
  });
  if (result.count === 0) return notFound();

  return json({ ok: true, stage: parsed.data.stage });
}
