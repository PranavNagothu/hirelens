// Who is calling. The session carries only a user id; the user and their organization are loaded
// fresh from the database on every request, so authorization always reflects current truth.
import { prisma } from "@/lib/db";
import { readSession } from "./session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
  org: { id: string; name: string; slug: string };
};

/** The logged-in user, or null. Safe to call from server components and route handlers. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await readSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { org: true },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    orgId: user.orgId,
    org: { id: user.org.id, name: user.org.name, slug: user.org.slug },
  };
}
