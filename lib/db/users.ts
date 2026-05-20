import {
  createRecoveryCode,
  hashIdentifier,
  normalizeLoginCode
} from "@/lib/auth/codes";
import { hashPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db/client";
import type { AuthenticatedUser, CreatedCredentials, UserRecord } from "@/lib/types";

type CreateUserResult = {
  userId: string;
  credentials: CreatedCredentials;
};

type CreateAnonymousUserInput = {
  loginCode: string;
  password: string;
};

type CreateAnonymousUserResult =
  | { status: "login_code_taken" }
  | { status: "success"; value: CreateUserResult };

export async function createAnonymousUser({
  loginCode,
  password
}: CreateAnonymousUserInput): Promise<CreateAnonymousUserResult> {
  const db = getDb();
  const normalizedLoginCode = normalizeLoginCode(loginCode);
  const loginCodeHash = hashIdentifier(normalizedLoginCode);
  const passwordHash = await hashPassword(password);
  const recoveryCode = createRecoveryCode();
  const recoveryCodeHash = hashIdentifier(recoveryCode);

  const inserted = await db<UserRecord[]>`
    insert into app_users (login_code_hash, password_hash, recovery_code_hash)
    values (${loginCodeHash}, ${passwordHash}, ${recoveryCodeHash})
    on conflict (login_code_hash) do nothing
    returning user_id, login_code_hash, password_hash, recovery_code_hash, created_at
  `;

  if (inserted.length === 0) {
    return { status: "login_code_taken" };
  }

  return {
    status: "success",
    value: {
      userId: inserted[0].user_id,
      credentials: { loginCode: normalizedLoginCode, recoveryCode }
    }
  };
}

export async function findUserForLogin(loginCode: string) {
  const db = getDb();
  const loginCodeHash = hashIdentifier(normalizeLoginCode(loginCode));
  const result = await db<AuthenticatedUser[]>`
    select user_id, password_hash
    from get_user_auth_by_login_code_hash(${loginCodeHash})
  `;

  return result[0] ?? null;
}
