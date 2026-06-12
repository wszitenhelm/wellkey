import {
  clearOrganizationSession,
  createOrganizationSession
} from "@/lib/auth/organization-session";
import { verifyPassword } from "@/lib/auth/password";
import {
  organizationLoginSchema,
  organizationSignupSchema
} from "@/lib/auth/validators";
import {
  createOrganizationAccount,
  findOrganizationUserForLogin,
  getOrganizationPermissionsForUser
} from "@/lib/db/organization-users";
import { validateCsrf } from "@/lib/security/csrf/server";
import { handleApiError, jsonApiError } from "@/lib/server/api/apiErrors";
import { recordApiMetric, startApiTimer } from "@/lib/server/api/metrics";
import { jsonApiResponse } from "@/lib/server/api/responses";
import { rateLimitRequest } from "@/lib/server/ratelimits";

type OrganizationAuthRequestBody = {
  companyName?: unknown;
  email?: unknown;
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

export async function handleOrganizationSignup(request: Request) {
  const stopTimer = startApiTimer();
  const csrfCheck = validateCsrf(request);

  if (!csrfCheck.ok) {
    return withMetrics(
      "/api/org-auth/signup",
      jsonApiError(request, {
        code: "csrf_rejected",
        message: csrfCheck.reason,
        status: csrfCheck.status
      }),
      stopTimer
    );
  }

  const limit = rateLimitRequest(request, { limit: 5, windowMs: 60_000 });

  if (!limit.ok) {
    return withMetrics(
      "/api/org-auth/signup",
      jsonApiError(request, {
        code: "rate_limited",
        message: "Too many signup attempts. Please try again soon.",
        status: 429
      }),
      stopTimer
    );
  }

  try {
    const parsed = organizationSignupSchema.safeParse(
      (await request.json()) as OrganizationAuthRequestBody
    );

    if (!parsed.success) {
      return withMetrics(
        "/api/org-auth/signup",
        jsonApiError(request, {
          code: "invalid_request",
          message: parsed.error.issues[0]?.message ?? "Invalid signup request.",
          status: 400
        }),
        stopTimer
      );
    }

    const created = await createOrganizationAccount(parsed.data);

    if (created.status === "email_taken") {
      return withMetrics(
        "/api/org-auth/signup",
        jsonApiError(request, {
          code: "email_taken",
          message: "That work email is already in use.",
          status: 409
        }),
        stopTimer
      );
    }

    await createOrganizationSession(created.value);

    return withMetrics(
      "/api/org-auth/signup",
      jsonApiResponse(request, { ok: true }),
      stopTimer
    );
  } catch (error) {
    return withMetrics(
      "/api/org-auth/signup",
      handleApiError(request, error, "We could not create your business account. Please try again."),
      stopTimer
    );
  }
}

export async function handleOrganizationLogin(request: Request) {
  const stopTimer = startApiTimer();
  const csrfCheck = validateCsrf(request);

  if (!csrfCheck.ok) {
    return withMetrics(
      "/api/org-auth/login",
      jsonApiError(request, {
        code: "csrf_rejected",
        message: csrfCheck.reason,
        status: csrfCheck.status
      }),
      stopTimer
    );
  }

  const limit = rateLimitRequest(request, { limit: 10, windowMs: 60_000 });

  if (!limit.ok) {
    return withMetrics(
      "/api/org-auth/login",
      jsonApiError(request, {
        code: "rate_limited",
        message: "Too many login attempts. Please try again soon.",
        status: 429
      }),
      stopTimer
    );
  }

  try {
    const parsed = organizationLoginSchema.safeParse(
      (await request.json()) as OrganizationAuthRequestBody
    );

    if (!parsed.success) {
      return withMetrics(
        "/api/org-auth/login",
        jsonApiError(request, {
          code: "invalid_request",
          message: parsed.error.issues[0]?.message ?? "Invalid login request.",
          status: 400
        }),
        stopTimer
      );
    }

    const user = await findOrganizationUserForLogin(parsed.data.email);

    if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
      return withMetrics(
        "/api/org-auth/login",
        jsonApiError(request, {
          code: "invalid_credentials",
          message: "Invalid work email or password.",
          status: 401
        }),
        stopTimer
      );
    }

    const permissions = await getOrganizationPermissionsForUser(user.id);

    await createOrganizationSession({
      organizationId: user.organization_id,
      organizationUserId: user.id,
      permissions
    });

    return withMetrics(
      "/api/org-auth/login",
      jsonApiResponse(request, { ok: true }),
      stopTimer
    );
  } catch (error) {
    return withMetrics(
      "/api/org-auth/login",
      handleApiError(request, error, "We could not log you in. Please try again."),
      stopTimer
    );
  }
}

export async function handleOrganizationLogout(request: Request) {
  const stopTimer = startApiTimer();
  const csrfCheck = validateCsrf(request);

  if (!csrfCheck.ok) {
    return withMetrics(
      "/api/org-auth/logout",
      jsonApiError(request, {
        code: "csrf_rejected",
        message: csrfCheck.reason,
        status: csrfCheck.status
      }),
      stopTimer
    );
  }

  try {
    await clearOrganizationSession();

    return withMetrics("/api/org-auth/logout", jsonApiResponse(request, { ok: true }), stopTimer);
  } catch (error) {
    return withMetrics(
      "/api/org-auth/logout",
      handleApiError(request, error, "We could not log you out."),
      stopTimer
    );
  }
}
