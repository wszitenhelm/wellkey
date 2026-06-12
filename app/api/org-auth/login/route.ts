import { handleOrganizationLogin } from "@/lib/auth/organization-http";

export async function POST(request: Request) {
  return handleOrganizationLogin(request);
}
