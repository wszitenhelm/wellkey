import { SignJWT } from "jose";
import { getEnv } from "@/lib/env/settings";

const encoder = new TextEncoder();
const REALTIME_TOKEN_TTL_SECONDS = 5 * 60;

type RealtimeTokenPayload = {
  app_user_id: string;
  aud: "authenticated";
  role: "authenticated";
  sub: string;
};

function getRealtimeSigningKey() {
  const secret = getEnv().SUPABASE_JWT_SECRET;

  if (!secret) {
    throw new Error("SUPABASE_REALTIME_NOT_CONFIGURED");
  }

  return encoder.encode(secret);
}

export function getRealtimeTokenTtlSeconds() {
  return REALTIME_TOKEN_TTL_SECONDS;
}

export async function signRealtimeToken(userId: string) {
  const expiresInSeconds = REALTIME_TOKEN_TTL_SECONDS;
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const token = await new SignJWT({
    app_user_id: userId,
    aud: "authenticated",
    role: "authenticated",
    sub: userId
  } satisfies RealtimeTokenPayload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(getRealtimeSigningKey());

  return {
    expiresAt,
    token
  };
}
