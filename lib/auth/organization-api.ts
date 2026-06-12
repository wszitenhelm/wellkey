"use client";

import { getCsrfToken } from "@/lib/security/csrf/client";

type AuthErrorResponse = {
  error?: string;
};

async function parseResponse(response: Response) {
  const data = (await response.json()) as AuthErrorResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong. Please try again.");
  }
}

export async function organizationSignupWithApi(input: {
  companyName: string;
  email: string;
  password: string;
}) {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/org-auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify(input)
  });

  return parseResponse(response);
}

export async function organizationLoginWithApi(input: { email: string; password: string }) {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/org-auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify(input)
  });

  return parseResponse(response);
}
