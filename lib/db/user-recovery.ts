import { createRecoveryCode, hashIdentifier, normalizeLoginCode, normalizeRecoveryCode } from "@/lib/auth/codes";
import { hashPassword } from "@/lib/auth/password";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { unwrapSupabaseData } from "@/lib/supabase/errors";

type RecoverAccountInput = {
  loginCode: string;
  newPassword: string;
  recoveryCode: string;
};

type RecoverAccountResult =
  | { status: "invalid_recovery" }
  | {
      status: "success";
      value: {
        credentials: { loginCode: string; recoveryCode: string };
        userId: string;
      };
    };

export async function recoverAnonymousAccount(
  input: RecoverAccountInput
): Promise<RecoverAccountResult> {
  const supabase = getSupabaseAdmin();
  const normalizedLoginCode = normalizeLoginCode(input.loginCode);
  const loginCodeHash = hashIdentifier(normalizedLoginCode);
  const recoveryCodeHash = hashIdentifier(normalizeRecoveryCode(input.recoveryCode));

  const user = unwrapSupabaseData(
    await supabase
      .from("app_users")
      .select("user_id")
      .eq("login_code_hash", loginCodeHash)
      .eq("recovery_code_hash", recoveryCodeHash)
      .maybeSingle()
  ) as { user_id: string } | null;

  if (!user) {
    return { status: "invalid_recovery" };
  }

  const nextRecoveryCode = createRecoveryCode();
  const passwordHash = await hashPassword(input.newPassword);

  await unwrapSupabaseData(
    await supabase
      .from("app_users")
      .update({
        password_hash: passwordHash,
        recovery_code_hash: hashIdentifier(nextRecoveryCode)
      })
      .eq("user_id", user.user_id)
  );

  return {
    status: "success",
    value: {
      credentials: {
        loginCode: normalizedLoginCode,
        recoveryCode: nextRecoveryCode
      },
      userId: user.user_id
    }
  };
}
