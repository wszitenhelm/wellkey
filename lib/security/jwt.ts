import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/lib/env/settings";

type TokenKind = "access" | "refresh";

type SessionTokenPayload = {
  userId: string;
  type: TokenKind;
};

const encoder = new TextEncoder();

function signingKey(type: TokenKind) {
  return encoder.encode(`${getEnv().SESSION_SECRET}:${type}`);
}

export async function signSessionToken(input: {
  expiresIn: string;
  type: TokenKind;
  userId: string;
}) {
  return new SignJWT({ userId: input.userId, type: input.type })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(input.expiresIn)
    .sign(signingKey(input.type));
}

export async function verifySessionToken(token: string, type: TokenKind) {
  const verified = await jwtVerify<SessionTokenPayload>(token, signingKey(type));

  if (verified.payload.type !== type || !verified.payload.userId) {
    throw new Error("INVALID_SESSION_TOKEN");
  }

  return {
    expiresAt: verified.payload.exp ?? 0,
    issuedAt: verified.payload.iat ?? 0,
    userId: verified.payload.userId
  };
}
