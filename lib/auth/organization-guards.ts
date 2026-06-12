import { redirect } from "next/navigation";
import { getOrganizationSession } from "@/lib/auth/organization-session";
import { hasOrganizationPermission } from "@/lib/organizations/permissions";
import type { OrganizationPermissionKey } from "@/lib/types";

export async function requireOrganizationSession() {
  const session = await getOrganizationSession();

  if (!session) {
    redirect("/business/login");
  }

  return session;
}

export async function redirectIfOrganizationAuthenticated() {
  const session = await getOrganizationSession();

  if (session) {
    redirect("/manager");
  }
}

export async function requireOrganizationPermission(permission: OrganizationPermissionKey) {
  const session = await requireOrganizationSession();

  if (!hasOrganizationPermission(session.permissions, permission)) {
    redirect("/manager");
  }

  return session;
}
