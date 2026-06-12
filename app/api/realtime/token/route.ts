import { getSession } from "@/lib/auth/session";
import { signRealtimeToken } from "@/lib/supabase/realtime-token";
import { handleApiError, jsonApiError } from "@/lib/server/api/apiErrors";
import { recordApiMetric, startApiTimer } from "@/lib/server/api/metrics";
import { jsonApiResponse } from "@/lib/server/api/responses";
import { rateLimitRequest } from "@/lib/server/ratelimits";

function withMetrics(response: Response, stopTimer: () => number) {
  const durationMs = stopTimer();
  const metrics = recordApiMetric("/api/realtime/token", durationMs);

  response.headers.set("Server-Timing", `app;dur=${durationMs}`);
  response.headers.set("X-Response-Time-Ms", `${durationMs}`);
  response.headers.set("X-API-P95-Ms", `${metrics.p95}`);
  response.headers.set("X-API-P99-Ms", `${metrics.p99}`);
  return response;
}

export async function GET(request: Request) {
  const stopTimer = startApiTimer();
  const session = await getSession();

  if (!session) {
    return withMetrics(
      jsonApiError(request, {
        code: "unauthorized",
        message: "Unauthorized",
        status: 401
      }),
      stopTimer
    );
  }

  const limit = rateLimitRequest(request, {
    limit: 30,
    userId: session.userId,
    windowMs: 60_000
  });

  if (!limit.ok) {
    const response = jsonApiError(request, {
      code: "rate_limited",
      message: "Too many requests. Please slow down.",
      status: 429
    });

    response.headers.set("Retry-After", `${Math.ceil((limit.resetAt - Date.now()) / 1000)}`);
    return withMetrics(response, stopTimer);
  }

  try {
    return withMetrics(jsonApiResponse(request, await signRealtimeToken(session.userId)), stopTimer);
  } catch (error) {
    if (error instanceof Error && error.message === "SUPABASE_REALTIME_NOT_CONFIGURED") {
      return withMetrics(
        jsonApiError(request, {
          code: "realtime_not_configured",
          message: "Supabase Realtime is not configured yet.",
          status: 503
        }),
        stopTimer
      );
    }

    return withMetrics(handleApiError(request, error, "Could not create a Realtime token."), stopTimer);
  }
}
