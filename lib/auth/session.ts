import { cookies } from "next/headers";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  getAccessTtlSeconds,
  setAccessCookie,
  setRefreshCookie
} from "@/lib/security/cookies";
import { signSessionToken, verifySessionToken } from "@/lib/security/jwt";
import type { SessionPayload } from "@/lib/types";

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  const accessToken = await signSessionToken({
    expiresIn: `${getAccessTtlSeconds()}s`,
    type: "access",
    userId
  });
  const refreshToken = await signSessionToken({
    expiresIn: "7d",
    type: "refresh",
    userId
  });

  setAccessCookie(cookieStore, accessToken);
  setRefreshCookie(cookieStore, refreshToken);
}

export async function clearSession() {
  const cookieStore = await cookies();
  clearAuthCookies(cookieStore);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (accessToken) {
    try {
      const verified = await verifySessionToken(accessToken, "access");
      return { userId: verified.userId };
    } catch {
      // fall through to refresh token
    }
  }

  if (!refreshToken) {
    return null;
  }

  try {
    const verified = await verifySessionToken(refreshToken, "refresh");
    return { userId: verified.userId };
  } catch {
    return null;
  }
}
