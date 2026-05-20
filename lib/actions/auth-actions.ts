"use server";

import { redirect } from "next/navigation";
import { getAuthFormValues } from "@/lib/auth/form-values";
import { authenticateUser } from "@/lib/auth/login";
import { createSession, clearSession } from "@/lib/auth/session";
import { loginSchema, signupSchema } from "@/lib/auth/validators";
import { createAnonymousUser } from "@/lib/db/users";
import type { ActionState, SignupActionState } from "@/lib/types";

export async function signupAction(
  _previousState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const parsed = signupSchema.safeParse(getAuthFormValues(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  try {
    const created = await createAnonymousUser(parsed.data);

    if (created.status === "login_code_taken") {
      return { error: "That login code is already taken. Choose another one." };
    }

    await createSession(created.value.userId);

    return {
      credentials: created.value.credentials
    };
  } catch {
    return { error: "We could not create your account. Please try again." };
  }
}

export async function loginAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(getAuthFormValues(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const result = await authenticateUser(parsed.data.loginCode, parsed.data.password);

  if (result.status === "invalid_credentials") {
    return { error: "Invalid login code or password." };
  }

  await createSession(result.user.user_id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
