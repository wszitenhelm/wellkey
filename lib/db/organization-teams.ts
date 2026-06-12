import type {
  OrganizationSessionPayload,
  OrganizationTeamRecord,
  OrganizationTeamsData
} from "@/lib/types";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getOrganizationSupabaseServerClient } from "@/lib/supabase/organization-server";

type MemberRow = {
  created_at: string;
  id: string;
  join_method: "invite" | "domain" | "code";
  org_scoped_employee_id: string;
};

type TeamLinkRow = {
  employee_organization_link_id: string;
  team_id: string;
};

export async function getOrganizationTeamsData(
  session: OrganizationSessionPayload
): Promise<OrganizationTeamsData> {
  const supabase = await getOrganizationSupabaseServerClient(session);
  const [teams, members, teamLinks] = await Promise.all([
    (unwrapSupabaseData(
      await supabase
        .from("organization_teams")
        .select("id, organization_id, slug, name, parent_team_id, created_at")
        .eq("organization_id", session.organizationId)
        .order("created_at")
    ) ?? []) as OrganizationTeamRecord[],
    (unwrapSupabaseData(
      await supabase
        .from("employee_organization_links")
        .select("id, org_scoped_employee_id, join_method, created_at")
        .eq("organization_id", session.organizationId)
        .order("created_at")
    ) ?? []) as MemberRow[],
    (unwrapSupabaseData(
      await supabase
        .from("employee_organization_team_links")
        .select("employee_organization_link_id, team_id")
        .eq("organization_id", session.organizationId)
    ) ?? []) as TeamLinkRow[]
  ]);

  const teamIdsByMemberId = new Map<string, string[]>();

  teamLinks.forEach((link) => {
    const current = teamIdsByMemberId.get(link.employee_organization_link_id) ?? [];
    current.push(link.team_id);
    teamIdsByMemberId.set(link.employee_organization_link_id, current);
  });

  return {
    members: members.map((member) => ({
      ...member,
      teamIds: teamIdsByMemberId.get(member.id) ?? []
    })),
    teams
  };
}

export async function createOrganizationTeam(
  session: OrganizationSessionPayload,
  input: { name: string; parentTeamId?: string }
) {
  const supabase = await getOrganizationSupabaseServerClient(session);
  const slug = input.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  await unwrapSupabaseData(
    await supabase.from("organization_teams").insert({
      name: input.name.trim(),
      organization_id: session.organizationId,
      parent_team_id: input.parentTeamId || null,
      slug: slug || `team-${Date.now()}`
    })
  );
}

export async function deleteOrganizationTeam(
  session: OrganizationSessionPayload,
  teamId: string
) {
  const supabase = await getOrganizationSupabaseServerClient(session);

  await unwrapSupabaseData(
    await supabase
      .from("organization_teams")
      .delete()
      .eq("organization_id", session.organizationId)
      .eq("id", teamId)
  );
}

export async function assignOrganizationMemberToTeam(
  session: OrganizationSessionPayload,
  input: { memberId: string; teamId: string | null }
) {
  const supabase = await getOrganizationSupabaseServerClient(session);

  await unwrapSupabaseData(
    await supabase
      .from("employee_organization_team_links")
      .delete()
      .eq("organization_id", session.organizationId)
      .eq("employee_organization_link_id", input.memberId)
  );

  if (!input.teamId) {
    return;
  }

  await unwrapSupabaseData(
    await supabase.from("employee_organization_team_links").insert({
      employee_organization_link_id: input.memberId,
      organization_id: session.organizationId,
      team_id: input.teamId
    })
  );
}
