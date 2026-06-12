import type { NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/security/origins";

const API_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const API_HEADERS = "Content-Type, X-CSRF-Token";

export function applyCorsHeaders(response: NextResponse, origin: string | null) {
  response.headers.set("Vary", "Origin");

  if (!isAllowedOrigin(origin)) {
    return;
  }

  response.headers.set("Access-Control-Allow-Origin", origin!);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", API_METHODS);
  response.headers.set("Access-Control-Allow-Headers", API_HEADERS);
}
