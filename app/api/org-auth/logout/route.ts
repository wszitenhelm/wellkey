import { handleOrganizationLogout } from "@/lib/auth/organization-http";

export async function POST(request: Request) {
  return handleOrganizationLogout(request);
}
