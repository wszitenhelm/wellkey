import type { OrganizationAuditLogRecord, OrganizationSessionPayload } from "@/lib/types";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getOrganizationSupabaseServerClient } from "@/lib/supabase/organization-server";

type AuditRow = {
  action: string;
  created_at: string;
  id: string;
  metadata: Record<string, unknown>;
  organization_user_id: string;
};

type OrgUserRow = {
  email: string;
  id: string;
};

export async function recordOrganizationAuditLog(
  session: OrganizationSessionPayload,
  input: { action: string; metadata?: Record<string, unknown> }
) {
  const supabase = await getOrganizationSupabaseServerClient(session);

  await unwrapSupabaseData(
    await supabase.from("manager_audit_logs").insert({
      action: input.action,
      metadata: input.metadata ?? {},
      organization_id: session.organizationId,
      organization_user_id: session.organizationUserId
    })
  );
}

export async function getOrganizationAuditLogs(
  session: OrganizationSessionPayload
): Promise<OrganizationAuditLogRecord[]> {
  const supabase = await getOrganizationSupabaseServerClient(session);
  const [logs, users] = await Promise.all([
    ((unwrapSupabaseData(
      await supabase
        .from("manager_audit_logs")
        .select("id, action, metadata, created_at, organization_user_id")
        .eq("organization_id", session.organizationId)
        .order("created_at", { ascending: false })
        .limit(50)
    ) as AuditRow[] | null) ?? []),
    ((unwrapSupabaseData(
      await supabase
        .from("organization_users")
        .select("id, email")
        .eq("organization_id", session.organizationId)
    ) as OrgUserRow[] | null) ?? [])
  ]);

  const userEmailById = new Map(users.map((user) => [user.id, user.email]));

  return logs.map((log) => ({
    ...log,
    actorEmail: userEmailById.get(log.organization_user_id) ?? null
  }));
}
