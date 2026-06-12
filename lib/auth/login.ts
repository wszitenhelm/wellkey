import { verifyPassword } from "@/lib/auth/password";
import {
  getOrganizationJoinContextByCode,
  getOrganizationJoinContextBySlug,
  linkAnonymousUserToOrganization
} from "@/lib/db/organization-joins";
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

export async function linkUserAfterLogin(input: {
  organizationCode?: string;
  organizationSlug?: string;
  userId: string;
}) {
  const organizationContext = input.organizationSlug
    ? await getOrganizationJoinContextBySlug(input.organizationSlug)
    : input.organizationCode
      ? await getOrganizationJoinContextByCode(input.organizationCode)
      : null;

  if (!organizationContext?.organization_seed) {
    if (input.organizationCode || input.organizationSlug) {
      throw new Error("INVALID_ORGANIZATION");
    }
    return;
  }

  await linkAnonymousUserToOrganization({
    joinMethod: input.organizationSlug ? "domain" : "code",
    organizationId: organizationContext.id,
    organizationSeed: organizationContext.organization_seed,
    userId: input.userId
  });
}
