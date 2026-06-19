import type { OrganizationPermissionKey, OrganizationAnonymousMember, OrganizationAccessUser } from "@/lib/types";

const permissionLabels: Record<OrganizationPermissionKey, string> = {
  manage_company_profile: "Company profile",
  manage_domains: "Domains",
  view_org_members: "Member visibility",
  manage_org_members: "Member management",
  manage_role_permissions: "Role access",
  view_org_overview: "Overview",
  view_team_breakdowns: "Team breakdowns",
  view_reports: "Reports",
  manage_reports: "Report exports",
  view_audit_logs: "Audit logs"
};

export function getOrganizationPermissionLabel(permission: OrganizationPermissionKey) {
  return permissionLabels[permission];
}

export function getOrganizationUserStatusLabel(status: OrganizationAccessUser["status"]) {
  return status === "invited" ? "Invited" : status === "disabled" ? "Disabled" : "Active";
}

export function getJoinMethodLabel(method: OrganizationAnonymousMember["join_method"]) {
  return method === "code" ? "Join code" : method === "domain" ? "Slug link" : "Invite";
}
