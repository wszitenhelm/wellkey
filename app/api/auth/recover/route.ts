import { handleAuthRecover } from "@/lib/auth/http";

export async function POST(request: Request) {
  return handleAuthRecover(request);
}
