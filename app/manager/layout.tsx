export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import { ManagerShell } from "@/components/manager/manager-shell";
import { requireOrganizationSession } from "@/lib/auth/organization-guards";
import { getOrganizationWorkspaceData } from "@/lib/db/organization-workspace";

type Props = {
  children: ReactNode;
};

export default async function ManagerLayout({ children }: Props) {
  const session = await requireOrganizationSession();
  const workspace = await getOrganizationWorkspaceData(session);

  return <ManagerShell workspace={workspace}>{children}</ManagerShell>;
}
