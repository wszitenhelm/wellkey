import { getOrganizationSession } from "@/lib/auth/organization-session";
import {
  assignOrganizationMemberToTeam,
  createOrganizationTeam,
  deleteOrganizationTeam
} from "@/lib/db/organization-teams";
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
      message: "You do not have permission to manage teams.",
      status: 403
    });
  }

  try {
    const body = (await request.json()) as {
      memberId?: string;
      mode?: "assign" | "create" | "delete";
      name?: string;
      parentTeamId?: string;
      teamId?: string | null;
    };

    if (body.mode === "create") {
      await createOrganizationTeam(session, {
        name: String(body.name ?? ""),
        parentTeamId: body.parentTeamId ? String(body.parentTeamId) : undefined
      });
    } else if (body.mode === "delete") {
      await deleteOrganizationTeam(session, String(body.teamId ?? ""));
    } else {
      await assignOrganizationMemberToTeam(session, {
        memberId: String(body.memberId ?? ""),
        teamId: body.teamId ? String(body.teamId) : null
      });
    }

    return jsonApiResponse(request, { ok: true });
  } catch (error) {
    return handleApiError(request, error, "We could not update teams right now.");
  }
}
