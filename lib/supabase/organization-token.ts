import { SignJWT } from "jose";
import { getEnv } from "@/lib/env/settings";

const encoder = new TextEncoder();
const ORGANIZATION_SUPABASE_TOKEN_TTL_SECONDS = 60 * 60;

function signingKey() {
  const secret = getEnv().SUPABASE_JWT_SECRET;

  if (!secret) {
    throw new Error("SUPABASE_ORG_JWT_NOT_CONFIGURED");
  }

  return encoder.encode(secret);
}

export async function signOrganizationSupabaseToken(input: {
  organizationId: string;
  organizationUserId: string;
  permissions: string[];
}) {
  const expiresInSeconds = ORGANIZATION_SUPABASE_TOKEN_TTL_SECONDS;
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const token = await new SignJWT({
    app_metadata: {
      org_id: input.organizationId,
      org_permissions: input.permissions,
      org_user_id: input.organizationUserId
    },
    aud: "authenticated",
    org_id: input.organizationId,
    org_permissions: input.permissions,
    org_user_id: input.organizationUserId,
    role: "authenticated",
    sub: input.organizationUserId
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(signingKey());

  return {
    expiresAt,
    token
  };
}
