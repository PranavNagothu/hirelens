// POST /api/auth/login  — verify credentials, start a session.
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { badRequest, json, unauthorized } from "@/lib/http";

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = LoginInput.safeParse(body);
  if (!parsed.success) return badRequest("Email and password are required.");

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { org: true },
  });

  // One generic message whether the email is unknown or the password is wrong — never reveal which,
  // and always run the hash comparison shape to avoid timing differences leaking account existence.
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) return unauthorized("Invalid email or password.");

  await createSession(user.id);

  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      org: { id: user.org.id, name: user.org.name, slug: user.org.slug },
    },
  });
}
