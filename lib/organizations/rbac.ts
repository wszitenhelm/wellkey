export const ORG_PERMISSION_KEYS = [
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
] as const;

export type OrgPermissionKey = (typeof ORG_PERMISSION_KEYS)[number];

export const SYSTEM_ORG_ROLES = [
  { key: "owner", name: "Owner" },
  { key: "c_level", name: "C-level" },
  { key: "hr_admin", name: "HR Admin" },
  { key: "manager", name: "Manager" }
] as const;

export function ownerPermissions() {
  return [...ORG_PERMISSION_KEYS];
}
