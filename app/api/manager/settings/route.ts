import { getOrganizationSession } from "@/lib/auth/organization-session";
import { recordOrganizationAuditLog } from "@/lib/db/organization-audit";
import { updateOrganizationProfile } from "@/lib/db/organization-workspace";
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
      message: "You do not have permission to change organization settings.",
      status: 403
    });
  }

  try {
    const body = (await request.json()) as Record<string, string>;

    await updateOrganizationProfile(session, {
      addressLine1: String(body.addressLine1 ?? ""),
      addressLine2: String(body.addressLine2 ?? ""),
      billingAddress: String(body.billingAddress ?? ""),
      city: String(body.city ?? ""),
      country: String(body.country ?? ""),
      displayName: String(body.displayName ?? ""),
      legalName: String(body.legalName ?? ""),
      logoUrl: String(body.logoUrl ?? ""),
      postalCode: String(body.postalCode ?? ""),
      websiteUrl: String(body.websiteUrl ?? "")
    });
    await recordOrganizationAuditLog(session, {
      action: "organization_profile_updated",
      metadata: {
        displayName: String(body.displayName ?? ""),
        legalName: String(body.legalName ?? ""),
        websiteUrl: String(body.websiteUrl ?? "")
      }
    });

    return jsonApiResponse(request, { ok: true });
  } catch (error) {
    return handleApiError(request, error, "We could not save your settings.");
  }
}
