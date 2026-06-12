import { randomUUID } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import type { OrganizationSessionPayload } from "@/lib/types";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getOrganizationSupabaseServerClient } from "@/lib/supabase/organization-server";

export async function createOrganizationDomain(
  session: OrganizationSessionPayload,
  domain: string
) {
  const supabase = await getOrganizationSupabaseServerClient(session);

  await unwrapSupabaseData(
    await supabase.from("organization_domains").insert({
      domain: domain.trim().toLowerCase(),
      organization_id: session.organizationId,
      verification_method: "dns_txt",
      verification_token: `wellkey-verification=${randomUUID()}`
    })
  );
}

export async function verifyOrganizationDomain(
  session: OrganizationSessionPayload,
  domainId: string
) {
  const supabase = await getOrganizationSupabaseServerClient(session);
  const domain = unwrapSupabaseData(
    await supabase
      .from("organization_domains")
      .select("id, domain, verification_token")
      .eq("id", domainId)
      .eq("organization_id", session.organizationId)
      .single()
  ) as { id: string; domain: string; verification_token: string } | null;

  if (!domain) {
    throw new Error("DOMAIN_NOT_FOUND");
  }

  const records = await resolveTxt(domain.domain);

  if (!records.flat().join(" ").includes(domain.verification_token)) {
    throw new Error("DOMAIN_TOKEN_NOT_FOUND");
  }

  const verifiedAt = new Date().toISOString();

  await unwrapSupabaseData(
    await supabase
      .from("organization_domains")
      .update({ verified_at: verifiedAt })
      .eq("id", domain.id)
      .eq("organization_id", session.organizationId)
  );

  await unwrapSupabaseData(
    await supabase
      .from("organizations")
      .update({ primary_domain: domain.domain, verification_status: "verified" })
      .eq("id", session.organizationId)
  );
}
