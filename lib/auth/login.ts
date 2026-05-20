import { verifyPassword } from "@/lib/auth/password";
import { findUserForLogin } from "@/lib/db/users";
import type { AuthenticatedUser } from "@/lib/types";

type LoginResult =
  | { status: "invalid_credentials" }
  | { status: "success"; user: AuthenticatedUser };

export async function authenticateUser(loginCode: string, password: string): Promise<LoginResult> {
  const user = await findUserForLogin(loginCode);

  if (!user) {
    return { status: "invalid_credentials" };
  }

  const matches = await verifyPassword(password, user.password_hash);

  if (!matches) {
    return { status: "invalid_credentials" };
  }

  return {
    status: "success",
    user
  };
}
