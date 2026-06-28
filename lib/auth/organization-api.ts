"use client";

import { getCsrfToken } from "@/lib/security/csrf/client";

type AuthErrorResponse = {
  error?: string;
};

async function parseResponse<T = void>(response: Response) {
  const data = (await response.json()) as T & AuthErrorResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong. Please try again.");
  }

  return data;
}

type OrganizationInviteCreateResponse = {
  email: string;
  expiresAt: string;
  invitePath: string;
};

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

export async function createOrganizationInviteWithApi(input: { email: string }) {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/manager/invites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify(input)
  });

  return parseResponse<OrganizationInviteCreateResponse>(response);
}

export async function revokeOrganizationInviteWithApi(input: { inviteId: string }) {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/manager/invites", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify(input)
  });

  return parseResponse(response);
}

export async function acceptOrganizationInviteWithApi(input: {
  fullName: string;
  password: string;
  token: string;
}) {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/org-auth/invite/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify(input)
  });

  return parseResponse(response);
}
