import { getOrganizationSession } from "@/lib/auth/organization-session";
import { createOrganizationDomain, verifyOrganizationDomain } from "@/lib/db/organization-domains";
import { hasOrganizationPermission } from "@/lib/organizations/permissions";
import { validateCsrf } from "@/lib/security/csrf/server";
import { handleApiError, jsonApiError } from "@/lib/server/api/apiErrors";
import { jsonApiResponse } from "@/lib/server/api/responses";

export async function POST(request: Request) {
  const csrfCheck = validateCsrf(request);

  if (!csrfCheck.ok) {
    return jsonApiError(request, {
      code: "csrf_rejected",
      message: csrfCheck.reason,
      status: csrfCheck.status
    });
  }

  const session = await getOrganizationSession();

  if (!session) {
    return jsonApiError(request, {
      code: "unauthorized",
      message: "Log in to continue.",
      status: 401
    });
  }

  if (!hasOrganizationPermission(session.permissions, "manage_domains")) {
    return jsonApiError(request, {
      code: "forbidden",
      message: "You do not have permission to manage domains.",
      status: 403
    });
  }

  try {
    const body = (await request.json()) as { domain?: string };
    await createOrganizationDomain(session, String(body.domain ?? ""));
    return jsonApiResponse(request, { ok: true });
  } catch (error) {
    return handleApiError(request, error, "We could not add your domain.");
  }
}

export async function PATCH(request: Request) {
  const csrfCheck = validateCsrf(request);

  if (!csrfCheck.ok) {
    return jsonApiError(request, {
      code: "csrf_rejected",
      message: csrfCheck.reason,
      status: csrfCheck.status
    });
  }

  const session = await getOrganizationSession();

  if (!session) {
    return jsonApiError(request, {
      code: "unauthorized",
      message: "Log in to continue.",
      status: 401
    });
  }

  if (!hasOrganizationPermission(session.permissions, "manage_domains")) {
    return jsonApiError(request, {
      code: "forbidden",
      message: "You do not have permission to manage domains.",
      status: 403
    });
  }

  try {
    const body = (await request.json()) as { domainId?: string };
    await verifyOrganizationDomain(session, String(body.domainId ?? ""));
    return jsonApiResponse(request, { ok: true });
  } catch (error) {
    return handleApiError(request, error, "We could not verify your domain yet.");
  }
}
