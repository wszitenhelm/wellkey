import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ensureCsrfCookieOnResponse } from "@/lib/security/csrf/server";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  getAccessTtlSeconds,
  setAccessCookie,
  setRefreshCookie
} from "@/lib/security/cookies";
import { signSessionToken, verifySessionToken } from "@/lib/security/jwt";

const REFRESH_THRESHOLD_SECONDS = 15 * 60;

function shouldSkip(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

async function refreshAuthCookies(request: NextRequest, response: NextResponse) {
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (accessToken) {
    try {
      const access = await verifySessionToken(accessToken, "access");

      if (access.expiresAt - Math.floor(Date.now() / 1000) > REFRESH_THRESHOLD_SECONDS) {
        return;
      }

      const nextAccessToken = await signSessionToken({
        expiresIn: `${getAccessTtlSeconds()}s`,
        type: "access",
        userId: access.userId
      });

      setAccessCookie(response.cookies, nextAccessToken);
      return;
    } catch {
      // fall through to refresh token
    }
  }

  if (!refreshToken) {
    return;
  }

  try {
    const refresh = await verifySessionToken(refreshToken, "refresh");
    const nextAccessToken = await signSessionToken({
      expiresIn: `${getAccessTtlSeconds()}s`,
      type: "access",
      userId: refresh.userId
    });
    const nextRefreshToken = await signSessionToken({
      expiresIn: "7d",
      type: "refresh",
      userId: refresh.userId
    });

    setAccessCookie(response.cookies, nextAccessToken);
    setRefreshCookie(response.cookies, nextRefreshToken);
  } catch {
    clearAuthCookies(response.cookies);
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkip(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  ensureCsrfCookieOnResponse(response.cookies, request.cookies.get("quietly_csrf")?.value);
  await refreshAuthCookies(request, response);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
