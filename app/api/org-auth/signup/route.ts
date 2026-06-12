import { handleOrganizationSignup } from "@/lib/auth/organization-http";

export async function POST(request: Request) {
  return handleOrganizationSignup(request);
}
