import { getOrganizationSession } from "@/lib/auth/organization-session";
import { updateOrganizationWorkspaceSettings } from "@/lib/db/organization-workspace";
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

  if (!hasOrganizationPermission(session.permissions, "manage_company_profile")) {
    return jsonApiError(request, {
      code: "forbidden",
      message: "You do not have permission to manage workspace controls.",
      status: 403
    });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;

    await updateOrganizationWorkspaceSettings(session, {
      allowDomainJoin: Boolean(body.allowDomainJoin),
      allowInviteJoin: Boolean(body.allowInviteJoin),
      minimumReportingThreshold: Number(body.minimumReportingThreshold ?? 5),
      showExportButton: Boolean(body.showExportButton),
      showTeamBreakdowns: Boolean(body.showTeamBreakdowns)
    });

    return jsonApiResponse(request, { ok: true });
  } catch (error) {
    return handleApiError(request, error, "We could not update your workspace controls.");
  }
}
