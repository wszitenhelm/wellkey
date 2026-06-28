import { getOrganizationSession } from "@/lib/auth/organization-session";
import { recordOrganizationAuditLog } from "@/lib/db/organization-audit";
import { uploadOrganizationLogo } from "@/lib/db/organization-branding";
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
      message: "You do not have permission to update branding.",
      status: 403
    });
  }

  try {
    const formData = await request.formData();
    const logo = formData.get("logo");

    if (!(logo instanceof File) || logo.size === 0) {
      return jsonApiError(request, {
        code: "invalid_file",
        message: "Please choose a logo file first.",
        status: 400
      });
    }

    const logoUrl = await uploadOrganizationLogo(session, logo);
    await recordOrganizationAuditLog(session, {
      action: "logo_uploaded",
      metadata: {
        filename: logo.name,
        size: logo.size
      }
    });
    return jsonApiResponse(request, { logoUrl, ok: true });
  } catch (error) {
    return handleApiError(request, error, "We could not upload your logo.");
  }
}
