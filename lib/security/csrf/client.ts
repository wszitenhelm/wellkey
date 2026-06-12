import { CSRF_COOKIE_NAME } from "@/lib/security/cookies";

let cachedToken = "";
let inflightTokenPromise: Promise<string> | null = null;

export function readBrowserCsrfToken() {
  if (typeof document === "undefined") {
    return "";
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}

export async function getCsrfToken() {
  const cookieToken = readBrowserCsrfToken();

  if (cookieToken) {
    cachedToken = cookieToken;
    return cookieToken;
  }

  if (cachedToken) {
    return cachedToken;
  }

  if (!inflightTokenPromise) {
    inflightTokenPromise = fetch("/api/crsf", {
      credentials: "include",
      headers: {
        Accept: "application/json"
      },
      method: "GET"
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("CSRF_TOKEN_REQUEST_FAILED");
        }

        const data = (await response.json()) as { csrfToken?: string };

        if (!data.csrfToken) {
          throw new Error("CSRF_TOKEN_MISSING");
        }

        cachedToken = data.csrfToken;
        return data.csrfToken;
      })
      .finally(() => {
        inflightTokenPromise = null;
      });
  }

  return inflightTokenPromise;
}
