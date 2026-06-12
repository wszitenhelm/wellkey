import { NextResponse } from "next/server";
import { ensureCsrfCookieOnResponse } from "@/lib/security/csrf/server";
import { applyCorsHeaders } from "@/lib/security/headers";
import { isAllowedOrigin, isSameOriginRequest } from "@/lib/security/origins";
import { jsonApiError } from "@/lib/server/api/apiErrors";
import { recordApiMetric, startApiTimer } from "@/lib/server/api/metrics";
import { jsonApiResponse } from "@/lib/server/api/responses";

function withMetrics(response: NextResponse, stopTimer: () => number) {
  const durationMs = stopTimer();
  const metrics = recordApiMetric("/api/crsf", durationMs);

  response.headers.set("Server-Timing", `app;dur=${durationMs}`);
  response.headers.set("X-Response-Time-Ms", `${durationMs}`);
  response.headers.set("X-API-P95-Ms", `${metrics.p95}`);
  response.headers.set("X-API-P99-Ms", `${metrics.p99}`);
  return response;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");

  if (origin && !isAllowedOrigin(origin) && !isSameOriginRequest(request)) {
    return jsonApiError(request, {
      code: "origin_not_allowed",
      message: "Origin not allowed.",
      status: 403
    });
  }

  const response = new NextResponse(null, { status: 204 });
  applyCorsHeaders(response, origin);
  return response;
}

export async function GET(request: Request) {
  const stopTimer = startApiTimer();
  const response = jsonApiResponse(request, { csrfToken: "" });
  const token = ensureCsrfCookieOnResponse(
    response.cookies,
    request.headers
      .get("cookie")
      ?.split("; ")
      .find((entry) => entry.startsWith("quietly_csrf="))
      ?.split("=")
      .slice(1)
      .join("=")
  );

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");

  return withMetrics(
    NextResponse.json(
      { csrfToken: token },
      {
        headers: response.headers,
        status: 200
      }
    ),
    stopTimer
  );
}
