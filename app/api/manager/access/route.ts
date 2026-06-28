import { getOrganizationSession } from "@/lib/auth/organization-session";
import { recordOrganizationAuditLog } from "@/lib/db/organization-audit";
import { replaceOrganizationUserRoles } from "@/lib/db/organization-access";
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

  if (!hasOrganizationPermission(session.permissions, "manage_role_permissions")) {
    return jsonApiError(request, {
      code: "forbidden",
      message: "You do not have permission to manage roles.",
      status: 403
    });
  }

  try {
    const body = (await request.json()) as { organizationUserId?: string; roleIds?: string[] };

    await replaceOrganizationUserRoles(session, String(body.organizationUserId ?? ""), body.roleIds ?? []);
    await recordOrganizationAuditLog(session, {
      action: "roles_updated",
      metadata: {
        organizationUserId: String(body.organizationUserId ?? ""),
        roleIds: body.roleIds ?? []
      }
    });
    return jsonApiResponse(request, { ok: true });
  } catch (error) {
    return handleApiError(request, error, "We could not update role access.");
  }
}
