import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/lib/env/settings";
import { signOrganizationSupabaseToken } from "@/lib/supabase/organization-token";

const ORG_ACCESS_COOKIE_NAME = "wellkey_org_access";
const ORG_REFRESH_COOKIE_NAME = "wellkey_org_refresh";
const ORG_SUPABASE_COOKIE_NAME = "wellkey_org_supabase";
const ORG_ACCESS_TTL_SECONDS = 60 * 60;
const ORG_REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;

type OrgTokenKind = "org_access" | "org_refresh";

type OrgSessionPayload = {
  organizationId: string;
  organizationUserId: string;
  permissions: string[];
};

type OrgTokenPayload = OrgSessionPayload & {
  type: OrgTokenKind;
};

const encoder = new TextEncoder();

function isProduction() {
  return getEnv().NODE_ENV === "production";
}

function signingKey(type: OrgTokenKind) {
  return encoder.encode(`${getEnv().SESSION_SECRET}:${type}`);
}

async function signOrgToken(input: OrgSessionPayload & { expiresIn: string; type: OrgTokenKind }) {
  return new SignJWT({
    organizationId: input.organizationId,
    organizationUserId: input.organizationUserId,
    permissions: input.permissions,
    type: input.type
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(input.expiresIn)
    .sign(signingKey(input.type));
}

async function verifyOrgToken(token: string, type: OrgTokenKind) {
  const verified = await jwtVerify<OrgTokenPayload>(token, signingKey(type));

  if (
    verified.payload.type !== type ||
    !verified.payload.organizationId ||
    !verified.payload.organizationUserId
  ) {
    throw new Error("INVALID_ORG_SESSION_TOKEN");
  }

  return {
    organizationId: verified.payload.organizationId,
    organizationUserId: verified.payload.organizationUserId,
    permissions: verified.payload.permissions ?? []
  };
}

export async function createOrganizationSession(input: OrgSessionPayload) {
  const cookieStore = await cookies();
  const accessToken = await signOrgToken({
    ...input,
    expiresIn: `${ORG_ACCESS_TTL_SECONDS}s`,
    type: "org_access"
  });
  const refreshToken = await signOrgToken({
    ...input,
    expiresIn: "7d",
    type: "org_refresh"
  });
  const supabaseToken = await signOrganizationSupabaseToken(input);

  cookieStore.set(ORG_ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: ORG_ACCESS_TTL_SECONDS
  });
  cookieStore.set(ORG_REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "strict",
    path: "/",
    maxAge: ORG_REFRESH_TTL_SECONDS
  });
  cookieStore.set(ORG_SUPABASE_COOKIE_NAME, supabaseToken.token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: ORG_ACCESS_TTL_SECONDS
  });
}

export async function getOrganizationSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ORG_ACCESS_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(ORG_REFRESH_COOKIE_NAME)?.value;

  if (accessToken) {
    try {
      return await verifyOrgToken(accessToken, "org_access");
    } catch {
      // fall through
    }
  }

  if (!refreshToken) {
    return null;
  }

  try {
    return await verifyOrgToken(refreshToken, "org_refresh");
  } catch {
    return null;
  }
}

export async function clearOrganizationSession() {
  const cookieStore = await cookies();

  for (const name of [ORG_ACCESS_COOKIE_NAME, ORG_REFRESH_COOKIE_NAME, ORG_SUPABASE_COOKIE_NAME]) {
    cookieStore.set(name, "", {
      expires: new Date(0),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: isProduction()
    });
  }
}

export async function getOrganizationSupabaseSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ORG_SUPABASE_COOKIE_NAME)?.value ?? null;
}
