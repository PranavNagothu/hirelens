// The session: a signed JWT in an httpOnly cookie.
//
// The token is signed with jose (HS256) and stored httpOnly, so the browser can neither read nor
// forge it. It carries only the user id; everything else is loaded from the database per request,
// so a session can never go stale or be tampered into holding the wrong org.
//
// Next 16 note: `cookies()` is async and cookies may only be set/deleted from a Route Handler or
// Server Function (see the bundled docs), which is why createSession/destroySession live here and
// are called from route handlers, never during page render.
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "hirelens_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

// A long random value in production (SESSION_SECRET). The dev default is obviously-unsafe on purpose
// so a missing production secret is loud, not silently weak.
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-insecure-hirelens-secret-change-me",
);

export type SessionPayload = { userId: string };

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;
    if (typeof userId !== "string") return null;
    return { userId };
  } catch {
    // Expired, tampered, or malformed -> treated as no session, never an error.
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const SESSION_COOKIE = COOKIE_NAME;
