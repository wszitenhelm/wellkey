import { pickAllowedOrganizationPermissions } from "@/lib/organizations/permissions";
import type { OrganizationSessionPayload } from "@/lib/types";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getOrganizationSupabaseServerClient } from "@/lib/supabase/organization-server";
import type {
  OrganizationDomainRecord,
  OrganizationRecord,
  OrganizationSettingsRecord,
  OrganizationWorkspaceData
} from "@/lib/types";

type OrgUserRow = {
  id: string;
  email: string;
  organization_id: string;
};

export async function getOrganizationWorkspaceData(
  session: OrganizationSessionPayload
): Promise<OrganizationWorkspaceData> {
  const supabase = await getOrganizationSupabaseServerClient(session);
  const [organization, domains, settings, orgUser] = await Promise.all([
    unwrapSupabaseData(
      await supabase.from("organizations").select("*").eq("id", session.organizationId).single()
    ) as OrganizationRecord | null,
    (unwrapSupabaseData(
      await supabase
        .from("organization_domains")
        .select("id, domain, verification_token, verification_method, verified_at, created_at")
        .eq("organization_id", session.organizationId)
        .order("created_at", { ascending: false })
    ) as OrganizationDomainRecord[] | null) ?? [],
    unwrapSupabaseData(
      await supabase
        .from("organization_settings")
        .select(
          "minimum_reporting_threshold, allow_domain_join, allow_invite_join, show_team_breakdowns, show_export_button"
        )
        .eq("organization_id", session.organizationId)
        .single()
    ) as OrganizationSettingsRecord | null,
    unwrapSupabaseData(
      await supabase
        .from("organization_users")
        .select("id, email, organization_id")
        .eq("id", session.organizationUserId)
        .single()
    ) as OrgUserRow | null
  ]);

  if (
    !organization ||
    !settings ||
    !orgUser ||
    orgUser.organization_id !== session.organizationId
  ) {
    throw new Error("ORGANIZATION_WORKSPACE_NOT_FOUND");
  }

  return {
    domains,
    organization,
    orgUser: { email: orgUser.email, id: orgUser.id },
    permissions: pickAllowedOrganizationPermissions(session.permissions),
    settings
  };
}

type UpdateOrganizationProfileInput = {
  addressLine1: string;
  addressLine2: string;
  billingAddress: string;
  city: string;
  country: string;
  displayName: string;
  legalName: string;
  logoUrl: string;
  postalCode: string;
  websiteUrl: string;
};

export async function updateOrganizationProfile(
  session: OrganizationSessionPayload,
  input: UpdateOrganizationProfileInput
) {
  const supabase = await getOrganizationSupabaseServerClient(session);

  await unwrapSupabaseData(
    await supabase
      .from("organizations")
      .update({
        address_line_1: input.addressLine1 || null,
        address_line_2: input.addressLine2 || null,
        billing_address: input.billingAddress ? { text: input.billingAddress } : null,
        city: input.city || null,
        country: input.country || null,
        display_name: input.displayName.trim(),
        legal_name: input.legalName.trim(),
        logo_url: input.logoUrl || null,
        postal_code: input.postalCode || null,
        website_url: input.websiteUrl || null
      })
      .eq("id", session.organizationId)
  );
}

type UpdateOrganizationWorkspaceSettingsInput = {
  allowDomainJoin: boolean;
  allowInviteJoin: boolean;
  minimumReportingThreshold: number;
  showExportButton: boolean;
  showTeamBreakdowns: boolean;
};

export async function updateOrganizationWorkspaceSettings(
  session: OrganizationSessionPayload,
  input: UpdateOrganizationWorkspaceSettingsInput
) {
  const supabase = await getOrganizationSupabaseServerClient(session);

  await unwrapSupabaseData(
    await supabase
      .from("organization_settings")
      .update({
        allow_domain_join: input.allowDomainJoin,
        allow_invite_join: input.allowInviteJoin,
        minimum_reporting_threshold: input.minimumReportingThreshold,
        show_export_button: input.showExportButton,
        show_team_breakdowns: input.showTeamBreakdowns
      })
      .eq("organization_id", session.organizationId)
  );
}
