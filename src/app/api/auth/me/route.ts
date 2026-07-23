// GET /api/auth/me  — the current user, or 401.
import { getCurrentUser } from "@/lib/auth/user";
import { json, unauthorized } from "@/lib/http";

export async function GET(): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return json({ user });
}
