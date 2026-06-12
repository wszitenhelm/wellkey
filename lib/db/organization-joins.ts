import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateEmployeeLinkMaterial } from "@/lib/organizations/crypto";

type OrganizationJoinContext = {
  display_name: string;
  id: string;
  join_code: string | null;
  organization_seed: string | null;
  slug: string;
};

export async function getOrganizationJoinContextBySlug(slug: string) {
  const supabase = getSupabaseAdmin();

  return (unwrapSupabaseData(
    await supabase
      .from("organizations")
      .select("id, slug, display_name, join_code, organization_seed")
      .eq("slug", slug)
      .maybeSingle()
  ) ?? null) as OrganizationJoinContext | null;
}

export async function getOrganizationJoinContextByCode(code: string) {
  const supabase = getSupabaseAdmin();

  return (unwrapSupabaseData(
    await supabase
      .from("organizations")
      .select("id, slug, display_name, join_code, organization_seed")
      .eq("join_code", code.trim().toUpperCase())
      .maybeSingle()
  ) ?? null) as OrganizationJoinContext | null;
}

type LinkInput = {
  joinMethod: "code" | "domain";
  organizationId: string;
  organizationSeed: string;
  userId: string;
};

export async function linkAnonymousUserToOrganization(input: LinkInput) {
  const supabase = getSupabaseAdmin();
  const material = generateEmployeeLinkMaterial(input.organizationSeed);

  await unwrapSupabaseData(
    await supabase.rpc("create_employee_organization_link", {
      p_employee_public_key: material.employeePublicKey,
      p_join_method: input.joinMethod,
      p_org_scoped_employee_id: material.orgScopedEmployeeId,
      p_organization_id: input.organizationId,
      p_user_id: input.userId
    })
  );
}
