import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { CSRF_COOKIE_NAME, setCsrfCookie } from "@/lib/security/cookies";
import { isAllowedOrigin, isSameOriginRequest } from "@/lib/security/origins";

function parseCookieHeader(cookieHeader: string | null) {
  const values = new Map<string, string>();

  for (const entry of cookieHeader?.split(";") ?? []) {
    const [name, ...parts] = entry.trim().split("=");

    if (!name || parts.length === 0) {
      continue;
    }

    values.set(name, decodeURIComponent(parts.join("=")));
  }

  return values;
}

function createCsrfToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
}

export function ensureCsrfCookieOnResponse(cookieStore: ResponseCookies, current?: string) {
  if (current) {
    return current;
  }

  const token = createCsrfToken();
  setCsrfCookie(cookieStore, token);
  return token;
}

export function validateCsrf(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin || (!isSameOriginRequest(request) && !isAllowedOrigin(origin))) {
    return { ok: false, status: 403, reason: "Invalid origin." };
  }

  const cookieToken = parseCookieHeader(request.headers.get("cookie")).get(CSRF_COOKIE_NAME);
  const headerToken = request.headers.get("x-csrf-token") ?? undefined;

  if (!cookieToken || !headerToken) {
    return { ok: false, status: 403, reason: "Missing CSRF token." };
  }

  if (cookieToken !== headerToken) {
    return { ok: false, status: 403, reason: "CSRF token mismatch." };
  }

  return { ok: true as const };
}
