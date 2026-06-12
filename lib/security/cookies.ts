import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { getEnv } from "@/lib/env/settings";

export const ACCESS_COOKIE_NAME = "quietly_access";
export const REFRESH_COOKIE_NAME = "quietly_refresh";
export const CSRF_COOKIE_NAME = "quietly_csrf";

const ACCESS_TTL_SECONDS = 60 * 60;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;

function isProduction() {
  return getEnv().NODE_ENV === "production";
}

export function getAccessTtlSeconds() {
  return ACCESS_TTL_SECONDS;
}

export function getRefreshTtlSeconds() {
  return REFRESH_TTL_SECONDS;
}

export function setAccessCookie(cookieStore: ResponseCookies, token: string) {
  cookieStore.set(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TTL_SECONDS
  });
}

export function setRefreshCookie(cookieStore: ResponseCookies, token: string) {
  cookieStore.set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_TTL_SECONDS
  });
}

export function setCsrfCookie(cookieStore: ResponseCookies, token: string) {
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: isProduction(),
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TTL_SECONDS
  });
}

export function clearAuthCookies(cookieStore: ResponseCookies) {
  for (const name of [ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, CSRF_COOKIE_NAME]) {
    cookieStore.set(name, "", {
      httpOnly: name !== CSRF_COOKIE_NAME,
      secure: isProduction(),
      sameSite: "lax",
      path: "/",
      expires: new Date(0)
    });
  }
}
