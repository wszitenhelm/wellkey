import { handleAuthSession } from "@/lib/auth/http";

export async function GET(request: Request) {
  return handleAuthSession(request);
}
