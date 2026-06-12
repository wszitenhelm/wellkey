import { handleAuthLogin } from "@/lib/auth/http";

export async function POST(request: Request) {
  return handleAuthLogin(request);
}
