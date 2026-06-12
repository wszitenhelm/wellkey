import { NextResponse } from "next/server";
import { applyCorsHeaders } from "@/lib/security/headers";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function jsonApiError(
  request: Request,
  input: {
    code: string;
    message: string;
    status: number;
  }
) {
  const response = NextResponse.json(
    {
      error: input.message,
      code: input.code
    },
    { status: input.status }
  );

  applyCorsHeaders(response, request.headers.get("origin"));
  return response;
}

export function handleApiError(request: Request, error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return jsonApiError(request, {
      code: error.code,
      message: error.message,
      status: error.status
    });
  }

  console.error("api_unhandled_error", error);
  return jsonApiError(request, {
    code: "internal_error",
    message: fallbackMessage,
    status: 500
  });
}
