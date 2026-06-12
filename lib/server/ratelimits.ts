import { getRequestKeyParts } from "@/lib/server/loadbalancer";

type RateLimitWindow = {
  count: number;
  resetAt: number;
};

const buckets = globalThis.__quietlyRateLimits ?? new Map<string, RateLimitWindow>();
globalThis.__quietlyRateLimits = buckets;

declare global {
  var __quietlyRateLimits: Map<string, RateLimitWindow> | undefined;
}

export function rateLimitRequest(
  request: Request,
  options: {
    limit: number;
    userId?: string;
    windowMs: number;
  }
) {
  const parts = getRequestKeyParts(request, options.userId);
  const key = `${parts.pathname}:${parts.method}:${parts.userId}:${parts.ip}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true as const, remaining: options.limit - 1, resetAt: now + options.windowMs };
  }

  if (current.count >= options.limit) {
    return { ok: false as const, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  buckets.set(key, current);
  return { ok: true as const, remaining: options.limit - current.count, resetAt: current.resetAt };
}
