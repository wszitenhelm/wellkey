import { createSession, clearSession, getSession } from "@/lib/auth/session";
import { authenticateUser, linkUserAfterLogin } from "@/lib/auth/login";
import { loginSchema, signupSchema } from "@/lib/auth/validators";
import { validateCsrf } from "@/lib/security/csrf/server";
import { handleApiError, jsonApiError } from "@/lib/server/api/apiErrors";
import { recordApiMetric, startApiTimer } from "@/lib/server/api/metrics";
import { jsonApiResponse } from "@/lib/server/api/responses";
import { rateLimitRequest } from "@/lib/server/ratelimits";
import { createAnonymousUser } from "@/lib/db/users";

type AuthRequestBody = {
  loginCode?: unknown;
  organizationCode?: unknown;
  organizationSlug?: unknown;
  password?: unknown;
};

function withMetrics(route: string, response: Response, stopTimer: () => number) {
  const durationMs = stopTimer();
  const metrics = recordApiMetric(route, durationMs);

  response.headers.set("Server-Timing", `app;dur=${durationMs}`);
  response.headers.set("X-Response-Time-Ms", `${durationMs}`);
  response.headers.set("X-API-P95-Ms", `${metrics.p95}`);
  response.headers.set("X-API-P99-Ms", `${metrics.p99}`);
  return response;
}

export async function handleAuthLogin(request: Request) {
  const stopTimer = startApiTimer();
  const csrfCheck = validateCsrf(request);

  if (!csrfCheck.ok) {
    return withMetrics(
      "/api/auth/login",
      jsonApiError(request, {
        code: "csrf_rejected",
        message: csrfCheck.reason,
        status: csrfCheck.status
      }),
      stopTimer
    );
  }

  const limit = rateLimitRequest(request, {
    limit: 10,
    windowMs: 60_000
  });

  if (!limit.ok) {
    return withMetrics(
      "/api/auth/login",
      jsonApiError(request, {
        code: "rate_limited",
        message: "Too many login attempts. Please try again soon.",
        status: 429
      }),
      stopTimer
    );
  }

  try {
    const parsed = loginSchema.safeParse((await request.json()) as AuthRequestBody);

    if (!parsed.success) {
      return withMetrics(
        "/api/auth/login",
        jsonApiError(request, {
          code: "invalid_request",
          message: parsed.error.issues[0]?.message ?? "Invalid login request.",
          status: 400
        }),
        stopTimer
      );
    }

    const result = await authenticateUser(parsed.data.loginCode, parsed.data.password);

    if (result.status === "invalid_credentials") {
      return withMetrics(
        "/api/auth/login",
        jsonApiError(request, {
          code: "invalid_credentials",
          message: "Invalid login code or password.",
          status: 401
        }),
        stopTimer
      );
    }

    await linkUserAfterLogin({
      organizationCode: parsed.data.organizationCode,
      organizationSlug: parsed.data.organizationSlug,
      userId: result.user.user_id
    });

    await createSession(result.user.user_id);

    return withMetrics(
      "/api/auth/login",
      jsonApiResponse(request, { ok: true }),
      stopTimer
    );
  } catch (error) {
    return withMetrics(
      "/api/auth/login",
      handleApiError(request, error, "We could not log you in. Please try again."),
      stopTimer
    );
  }
}

export async function handleAuthLogout(request: Request) {
  const stopTimer = startApiTimer();
  const csrfCheck = validateCsrf(request);

  if (!csrfCheck.ok) {
    return withMetrics(
      "/api/auth/logout",
      jsonApiError(request, {
        code: "csrf_rejected",
        message: csrfCheck.reason,
        status: csrfCheck.status
      }),
      stopTimer
    );
  }

  try {
    await clearSession();

    return withMetrics(
      "/api/auth/logout",
      jsonApiResponse(request, { ok: true }),
      stopTimer
    );
  } catch (error) {
    return withMetrics(
      "/api/auth/logout",
      handleApiError(request, error, "We could not log you out."),
      stopTimer
    );
  }
}

export async function handleAuthSession(request: Request) {
  const stopTimer = startApiTimer();

  try {
    const session = await getSession();

    return withMetrics(
      "/api/auth/session",
      jsonApiResponse(request, {
        authenticated: Boolean(session),
        userId: session?.userId
      }),
      stopTimer
    );
  } catch (error) {
    return withMetrics(
      "/api/auth/session",
      handleApiError(request, error, "We could not read your session."),
      stopTimer
    );
  }
}

export async function handleAuthSignup(request: Request) {
  const stopTimer = startApiTimer();
  const csrfCheck = validateCsrf(request);

  if (!csrfCheck.ok) {
    return withMetrics(
      "/api/auth/signup",
      jsonApiError(request, {
        code: "csrf_rejected",
        message: csrfCheck.reason,
        status: csrfCheck.status
      }),
      stopTimer
    );
  }

  const limit = rateLimitRequest(request, {
    limit: 5,
    windowMs: 60_000
  });

  if (!limit.ok) {
    return withMetrics(
      "/api/auth/signup",
      jsonApiError(request, {
        code: "rate_limited",
        message: "Too many signup attempts. Please try again soon.",
        status: 429
      }),
      stopTimer
    );
  }

  try {
    const parsed = signupSchema.safeParse((await request.json()) as AuthRequestBody);

    if (!parsed.success) {
      return withMetrics(
        "/api/auth/signup",
        jsonApiError(request, {
          code: "invalid_request",
          message: parsed.error.issues[0]?.message ?? "Invalid signup request.",
          status: 400
        }),
        stopTimer
      );
    }

    const created = await createAnonymousUser(parsed.data);

    if (created.status === "login_code_taken") {
      return withMetrics(
        "/api/auth/signup",
        jsonApiError(request, {
          code: "login_code_taken",
          message: "That login code is already taken. Choose another one.",
          status: 409
        }),
        stopTimer
      );
    }

    if (created.status === "invalid_organization") {
      return withMetrics(
        "/api/auth/signup",
        jsonApiError(request, {
          code: "invalid_organization",
          message: "That organization code or link is not valid.",
          status: 400
        }),
        stopTimer
      );
    }

    await createSession(created.value.userId);

    return withMetrics(
      "/api/auth/signup",
      jsonApiResponse(request, {
        credentials: created.value.credentials
      }),
      stopTimer
    );
  } catch (error) {
    return withMetrics(
      "/api/auth/signup",
      handleApiError(request, error, "We could not create your account. Please try again."),
      stopTimer
    );
  }
}
