import { handleOrganizationInviteAccept } from "@/lib/auth/organization-http";

export async function POST(request: Request) {
  return handleOrganizationInviteAccept(request);
}
