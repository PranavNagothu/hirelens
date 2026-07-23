// POST /api/auth/logout  — end the session.
import { destroySession } from "@/lib/auth/session";
import { json } from "@/lib/http";

export async function POST(): Promise<Response> {
  await destroySession();
  return json({ ok: true });
}
