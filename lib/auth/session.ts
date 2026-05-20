import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/config/env";
import type { SessionPayload } from "@/lib/types";

const COOKIE_NAME = "quietly_session";
const encoder = new TextEncoder();

function sessionKey() {
  return encoder.encode(getEnv().SESSION_SECRET);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(sessionKey());

  const cookieStore = await cookies();
  const env = getEnv();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify<{ userId: string }>(token, sessionKey());
    return { userId: verified.payload.userId };
  } catch {
    return null;
  }
}
