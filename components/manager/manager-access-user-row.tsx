"use client";

import { useState, useTransition } from "react";
import { ManagerBadge } from "@/components/manager/manager-badge";
import { Button } from "@/components/ui/button";
import { getOrganizationUserStatusLabel } from "@/lib/organizations/labels";
import { getCsrfToken } from "@/lib/security/csrf/client";
import type { OrganizationAccessRole, OrganizationAccessUser } from "@/lib/types";

type Props = {
  roles: OrganizationAccessRole[];
  user: OrganizationAccessUser;
};

export function ManagerAccessUserRow({ roles, user }: Props) {
  const [selectedRoleId, setSelectedRoleId] = useState(user.roleIds[0] ?? "");
  const [pending, startTransition] = useTransition();
  const currentRole = roles.find((role) => role.id === user.roleIds[0])?.name ?? "No role";

  function handleSave() {
    startTransition(async () => {
      const csrfToken = await getCsrfToken();
      await fetch("/api/manager/access", {
        body: JSON.stringify({
          organizationUserId: user.id,
          roleIds: selectedRoleId ? [selectedRoleId] : []
        }),
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        method: "POST"
      });
      window.location.reload();
    });
  }

  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-white/70 p-4 md:grid-cols-[minmax(0,1.1fr)_220px_110px] md:items-center">
      <div>
        <p className="font-medium">{user.email}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <ManagerBadge>{currentRole}</ManagerBadge>
          <ManagerBadge tone="teal">{getOrganizationUserStatusLabel(user.status)}</ManagerBadge>
        </div>
        <p className="mt-2 text-sm text-muted">{user.full_name ?? "No name added"}</p>
      </div>
      <select
        className="h-12 rounded-2xl border border-border bg-white px-4 text-sm"
        onChange={(event) => setSelectedRoleId(event.target.value)}
        value={selectedRoleId}
      >
        <option value="">No role</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
      <Button disabled={pending} onClick={handleSave} type="button">
        {pending ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
