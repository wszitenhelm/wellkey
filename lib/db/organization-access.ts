import type { OrganizationAccessData, OrganizationSessionPayload } from "@/lib/types";
import { getOrganizationInvites } from "@/lib/db/organization-invites";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getOrganizationSupabaseServerClient } from "@/lib/supabase/organization-server";

type RoleRow = {
  id: string;
  is_system: boolean;
  key: string;
  name: string;
};

type PermissionRow = {
  description: string;
  id: string;
  key: OrganizationAccessData["permissions"][number]["key"];
  name: string;
};

type UserRow = {
  email: string;
  full_name: string | null;
  id: string;
  status: "active" | "invited" | "disabled";
};

type RolePermissionRow = {
  permission_id: string;
  role_id: string;
};

type UserRoleRow = {
  organization_user_id: string;
  role_id: string;
};

export async function getOrganizationAccessData(
  session: OrganizationSessionPayload
): Promise<OrganizationAccessData> {
  const supabase = await getOrganizationSupabaseServerClient(session);
  const [roles, permissions, users, rolePermissions, userRoles, invites] = await Promise.all([
    (unwrapSupabaseData(
      await supabase
        .from("organization_roles")
        .select("id, key, name, is_system")
        .eq("organization_id", session.organizationId)
        .order("is_system", { ascending: false })
        .order("name")
    ) ?? []) as RoleRow[],
    (unwrapSupabaseData(
      await supabase
        .from("organization_permissions")
        .select("id, key, name, description")
        .eq("organization_id", session.organizationId)
        .order("name")
    ) ?? []) as PermissionRow[],
    (unwrapSupabaseData(
      await supabase
        .from("organization_users")
        .select("id, email, full_name, status")
        .eq("organization_id", session.organizationId)
        .order("created_at")
    ) ?? []) as UserRow[],
    (unwrapSupabaseData(
      await supabase
        .from("organization_role_permissions")
        .select("role_id, permission_id")
        .eq("organization_id", session.organizationId)
    ) ?? []) as RolePermissionRow[],
    (unwrapSupabaseData(
      await supabase
        .from("organization_user_roles")
        .select("organization_user_id, role_id")
    ) ?? []) as UserRoleRow[],
    getOrganizationInvites(session)
  ]);

  const permissionIdsByRoleId = new Map<string, Set<string>>();

  rolePermissions.forEach((row) => {
    const current = permissionIdsByRoleId.get(row.role_id) ?? new Set<string>();
    current.add(row.permission_id);
    permissionIdsByRoleId.set(row.role_id, current);
  });

  const permissionKeyById = new Map(permissions.map((permission) => [permission.id, permission.key]));
  const roleIdsByUserId = new Map<string, string[]>();

  userRoles.forEach((row) => {
    const current = roleIdsByUserId.get(row.organization_user_id) ?? [];
    current.push(row.role_id);
    roleIdsByUserId.set(row.organization_user_id, current);
  });

  return {
    invites,
    permissions,
    roles: roles.map((role) => ({
      ...role,
      permissionKeys: [...(permissionIdsByRoleId.get(role.id) ?? new Set<string>())]
        .map((permissionId) => permissionKeyById.get(permissionId))
        .filter((value): value is PermissionRow["key"] => Boolean(value))
    })),
    users: users.map((user) => ({
      ...user,
      roleIds: roleIdsByUserId.get(user.id) ?? []
    }))
  };
}

export async function replaceOrganizationUserRoles(
  session: OrganizationSessionPayload,
  organizationUserId: string,
  roleIds: string[]
) {
  const supabase = await getOrganizationSupabaseServerClient(session);

  await unwrapSupabaseData(
    await supabase
      .from("organization_user_roles")
      .delete()
      .eq("organization_user_id", organizationUserId)
  );

  if (roleIds.length === 0) {
    return;
  }

  await unwrapSupabaseData(
    await supabase.from("organization_user_roles").insert(
      roleIds.map((roleId) => ({
        organization_user_id: organizationUserId,
        role_id: roleId
      }))
    )
  );
}
