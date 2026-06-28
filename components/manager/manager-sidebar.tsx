"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ManagerLogoutButton } from "@/components/manager/manager-logout-button";
import { Button } from "@/components/ui/button";
import { SoftCard } from "@/components/ui/soft-card";
import { hasAnyOrganizationPermission, hasOrganizationPermission } from "@/lib/organizations/permissions";
import type { OrganizationWorkspaceData } from "@/lib/types";
import { cn } from "@/lib/utils";

type SidebarItem = {
  href:
    | "/manager"
    | "/manager/access"
    | "/manager/audit"
    | "/manager/reporting"
    | "/manager/settings"
    | "/manager/teams";
  label: string;
};

type Props = {
  workspace: OrganizationWorkspaceData;
};

export function ManagerSidebar({ workspace }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const items: SidebarItem[] = [
    ...(hasOrganizationPermission(workspace.permissions, "view_org_overview")
      ? [{ href: "/manager" as const, label: "Overview" }]
      : []),
    ...(hasAnyOrganizationPermission(workspace.permissions, ["view_reports", "manage_reports"])
      ? [{ href: "/manager/reporting" as const, label: "Reporting" }]
      : []),
    ...(hasOrganizationPermission(workspace.permissions, "manage_org_members")
      ? [{ href: "/manager/teams" as const, label: "Teams" }]
      : []),
    ...(hasOrganizationPermission(workspace.permissions, "manage_role_permissions")
      ? [{ href: "/manager/access" as const, label: "Access" }]
      : []),
    ...(hasOrganizationPermission(workspace.permissions, "view_audit_logs")
      ? [{ href: "/manager/audit" as const, label: "Audit" }]
      : []),
    ...(hasAnyOrganizationPermission(workspace.permissions, ["manage_company_profile", "manage_domains"])
      ? [{ href: "/manager/settings" as const, label: "Settings" }]
      : [])
  ];

  return (
    <SoftCard className={cn("h-full p-4 transition-all", collapsed ? "w-[88px]" : "w-[260px]")}>
      <div className="flex items-center justify-between">
        <div className={cn("overflow-hidden transition-all", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
          <p className="text-sm font-semibold tracking-[0.18em] text-foreground/70">WELLKEY</p>
          <p className="mt-1 text-xs text-muted">Organization workspace</p>
        </div>
        <Button className="h-10 w-10 rounded-full p-0" onClick={() => setCollapsed((v) => !v)} variant="ghost">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="mt-6 space-y-2">
        {items.map((item) => (
          <Link
            key={item.label}
            className={cn(
              "block rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
              pathname === item.href ? "bg-accent text-accentForeground" : "hover:bg-foreground/5",
              collapsed && "px-0 text-center"
            )}
            href={item.href as never}
          >
            {collapsed ? item.label[0] : item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 border-t border-border/70 pt-4">
        <ManagerLogoutButton />
      </div>
    </SoftCard>
  );
}
