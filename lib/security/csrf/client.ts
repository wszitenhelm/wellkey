import { CSRF_COOKIE_NAME } from "@/lib/security/cookies";

export function readBrowserCsrfToken() {
  if (typeof document === "undefined") {
    return "";
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}
