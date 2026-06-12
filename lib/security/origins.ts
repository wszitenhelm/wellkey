const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "https://wellkey-app.vercel.app"
]);

export function getAllowedOrigins() {
  return [...ALLOWED_ORIGINS];
}

export function isAllowedOrigin(origin: string | null) {
  return Boolean(origin && ALLOWED_ORIGINS.has(origin));
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  return origin === new URL(request.url).origin;
}
