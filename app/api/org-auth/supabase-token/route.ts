import { getOrganizationSupabaseSessionToken, getOrganizationSession } from "@/lib/auth/organization-session";
import { jsonApiError } from "@/lib/server/api/apiErrors";
import { jsonApiResponse } from "@/lib/server/api/responses";

export async function GET(request: Request) {
  const session = await getOrganizationSession();

  if (!session) {
    return jsonApiError(request, {
      code: "unauthorized",
      message: "Log in to continue.",
      status: 401
    });
  }

  const token = await getOrganizationSupabaseSessionToken();

  return jsonApiResponse(request, {
    ok: Boolean(token),
    token
  });
}
