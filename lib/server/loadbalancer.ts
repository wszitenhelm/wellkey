export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}

export function getRequestKeyParts(request: Request, userId?: string) {
  return {
    ip: getClientIp(request),
    method: request.method,
    pathname: new URL(request.url).pathname,
    userId: userId ?? "anonymous"
  };
}
