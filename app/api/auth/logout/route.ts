import { handleAuthLogout } from "@/lib/auth/http";

export async function POST(request: Request) {
  return handleAuthLogout(request);
}
