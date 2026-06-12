import {
  createRecoveryCode,
  hashIdentifier,
  normalizeLoginCode
} from "@/lib/auth/codes";
import { hashPassword } from "@/lib/auth/password";
import {
  getOrganizationJoinContextByCode,
  getOrganizationJoinContextBySlug,
  linkAnonymousUserToOrganization
} from "@/lib/db/organization-joins";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import type { AuthenticatedUser, CreatedCredentials, UserRecord } from "@/lib/types";

type CreateUserResult = {
  userId: string;
  credentials: CreatedCredentials;
};

type CreateAnonymousUserInput = {
  loginCode: string;
  organizationCode?: string;
  organizationSlug?: string;
  password: string;
};

type CreateAnonymousUserResult =
  | { status: "invalid_organization" }
  | { status: "login_code_taken" }
  | { status: "success"; value: CreateUserResult };

export async function createAnonymousUser({
  loginCode,
  organizationCode,
  organizationSlug,
  password
}: CreateAnonymousUserInput): Promise<CreateAnonymousUserResult> {
  const supabase = getSupabaseAdmin();
  const normalizedLoginCode = normalizeLoginCode(loginCode);
  const loginCodeHash = hashIdentifier(normalizedLoginCode);
  const passwordHash = await hashPassword(password);
  const recoveryCode = createRecoveryCode();
  const recoveryCodeHash = hashIdentifier(recoveryCode);

  const existing = unwrapSupabaseData(
    await supabase
      .from("app_users")
      .select("user_id")
      .eq("login_code_hash", loginCodeHash)
      .maybeSingle()
  );

  if (existing) {
    return { status: "login_code_taken" };
  }

  const organizationContext = organizationSlug
    ? await getOrganizationJoinContextBySlug(organizationSlug)
    : organizationCode
      ? await getOrganizationJoinContextByCode(organizationCode)
      : null;

  if ((organizationSlug || organizationCode) && !organizationContext?.organization_seed) {
    return { status: "invalid_organization" };
  }

  const inserted = unwrapSupabaseData(
    await supabase
      .from("app_users")
      .insert({
        login_code_hash: loginCodeHash,
        password_hash: passwordHash,
        recovery_code_hash: recoveryCodeHash
      })
      .select("user_id, login_code_hash, password_hash, recovery_code_hash, created_at")
      .single()
  ) as UserRecord | null;

  if (!inserted) {
    throw new Error("USER_CREATE_FAILED");
  }

  if (organizationContext?.organization_seed) {
    await linkAnonymousUserToOrganization({
      joinMethod: organizationSlug ? "domain" : "code",
      organizationId: organizationContext.id,
      organizationSeed: organizationContext.organization_seed,
      userId: inserted.user_id
    });
  }

  return {
    status: "success",
    value: {
      userId: inserted.user_id,
      credentials: { loginCode: normalizedLoginCode, recoveryCode }
    }
  };
}

export async function findUserForLogin(loginCode: string) {
  const supabase = getSupabaseAdmin();
  const loginCodeHash = hashIdentifier(normalizeLoginCode(loginCode));
  const result = unwrapSupabaseData(
    await supabase
      .from("app_users")
      .select("user_id, password_hash")
      .eq("login_code_hash", loginCodeHash)
      .maybeSingle()
  ) as AuthenticatedUser | null;

  return result ?? null;
}
