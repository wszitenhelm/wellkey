import type { OrganizationPermissionKey } from "@/lib/types";

export function hasOrganizationPermission(
  permissions: readonly string[],
  permission: OrganizationPermissionKey
) {
  return permissions.includes(permission);
}

export function hasAnyOrganizationPermission(
  permissions: readonly string[],
  requiredPermissions: readonly OrganizationPermissionKey[]
) {
  return requiredPermissions.some((permission) => hasOrganizationPermission(permissions, permission));
}

export function pickAllowedOrganizationPermissions(permissions: readonly string[]) {
  return permissions.filter((permission): permission is OrganizationPermissionKey =>
    [
      "manage_company_profile",
      "manage_domains",
      "view_org_members",
      "manage_org_members",
      "manage_role_permissions",
      "view_org_overview",
      "view_team_breakdowns",
      "view_reports",
      "manage_reports",
      "view_audit_logs"
    ].includes(permission)
  );
}
