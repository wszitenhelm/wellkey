"use client";

import { getCsrfToken } from "@/lib/security/csrf/client";
import type { CreatedCredentials } from "@/lib/types";

type AuthErrorResponse = {
  error?: string;
};

type LoginResponse = {
  ok: true;
};

type LogoutResponse = {
  ok: true;
};

type SessionResponse = {
  authenticated: boolean;
  userId?: string;
};

type SignupResponse = {
  credentials: CreatedCredentials;
};

async function parseAuthResponse<T>(response: Response) {
  const data = (await response.json()) as T & AuthErrorResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong. Please try again.");
  }

  return data;
}

export async function loginWithApi(input: {
  loginCode: string;
  organizationCode?: string;
  organizationSlug?: string;
  password: string;
}) {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/auth/login", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    method: "POST"
  });

  return parseAuthResponse<LoginResponse>(response);
}

export async function signupWithApi(input: {
  loginCode: string;
  organizationCode?: string;
  organizationSlug?: string;
  password: string;
}) {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/auth/signup", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    method: "POST"
  });

  return parseAuthResponse<SignupResponse>(response);
}

export async function logoutWithApi() {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/auth/logout", {
    headers: {
      "X-CSRF-Token": csrfToken
    },
    method: "POST"
  });

  return parseAuthResponse<LogoutResponse>(response);
}

export async function getSessionFromApi() {
  const response = await fetch("/api/auth/session", {
    headers: {
      Accept: "application/json"
    },
    method: "GET"
  });

  return parseAuthResponse<SessionResponse>(response);
}
