import { getOrganizationSession } from "@/lib/auth/organization-session";
import {
  createOrganizationInvite,
  revokeOrganizationInvite
} from "@/lib/db/organization-invites";
import { organizationInviteSchema } from "@/lib/auth/validators";
import { recordOrganizationAuditLog } from "@/lib/db/organization-audit";
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

  if (!hasOrganizationPermission(session.permissions, "manage_org_members")) {
    return jsonApiError(request, {
      code: "forbidden",
      message: "You do not have permission to invite organization users.",
      status: 403
    });
  }

  try {
    const parsed = organizationInviteSchema.safeParse(
      (await request.json()) as { email?: unknown }
    );

    if (!parsed.success) {
      return jsonApiError(request, {
        code: "invalid_request",
        message: parsed.error.issues[0]?.message ?? "Invalid invite request.",
        status: 400
      });
    }

    const created = await createOrganizationInvite(session, parsed.data.email);
    await recordOrganizationAuditLog(session, {
      action: "organization_invite_created",
      metadata: { email: created.email, expiresAt: created.expiresAt }
    });
    return jsonApiResponse(request, created);
  } catch (error) {
    return handleApiError(request, error, "We could not create that invite.");
  }
}

export async function DELETE(request: Request) {
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

  if (!hasOrganizationPermission(session.permissions, "manage_org_members")) {
    return jsonApiError(request, {
      code: "forbidden",
      message: "You do not have permission to manage invites.",
      status: 403
    });
  }

  try {
    const body = (await request.json()) as { inviteId?: string };
    await revokeOrganizationInvite(session, String(body.inviteId ?? ""));
    await recordOrganizationAuditLog(session, {
      action: "organization_invite_revoked",
      metadata: { inviteId: String(body.inviteId ?? "") }
    });
    return jsonApiResponse(request, { ok: true });
  } catch (error) {
    return handleApiError(request, error, "We could not revoke that invite.");
  }
}
