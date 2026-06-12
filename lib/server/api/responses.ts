import { NextResponse } from "next/server";
import { applyCorsHeaders } from "@/lib/security/headers";

export function jsonApiResponse(
  request: Request,
  body: Record<string, unknown>,
  init?: ResponseInit
) {
  const response = NextResponse.json(body, init);
  applyCorsHeaders(response, request.headers.get("origin"));
  return response;
}
