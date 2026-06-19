import { randomUUID } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { ApiError } from "@/lib/server/api/apiErrors";
import type { OrganizationSessionPayload } from "@/lib/types";
import { parseOrganizationDomain } from "@/lib/organizations/domains";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getOrganizationSupabaseServerClient } from "@/lib/supabase/organization-server";

export async function createOrganizationDomain(
  session: OrganizationSessionPayload,
  domain: string
) {
  const supabase = await getOrganizationSupabaseServerClient(session);
  const normalizedDomain = parseOrganizationDomain(domain);

  const existing = unwrapSupabaseData(
    await supabase
      .from("organization_domains")
      .select("id, verified_at")
      .eq("organization_id", session.organizationId)
      .eq("domain", normalizedDomain)
      .maybeSingle()
  ) as { id: string; verified_at: string | null } | null;

  if (existing) {
    throw new ApiError(
      409,
      "domain_exists",
      existing.verified_at
        ? "That domain is already verified for your organization."
        : "That domain is already waiting for verification."
    );
  }

  await unwrapSupabaseData(
    await supabase.from("organization_domains").insert({
      domain: normalizedDomain,
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
      .select("id, domain, verification_token, verified_at")
      .eq("id", domainId)
      .eq("organization_id", session.organizationId)
      .single()
  ) as { id: string; domain: string; verification_token: string; verified_at: string | null } | null;

  if (!domain) {
    throw new ApiError(404, "domain_not_found", "We could not find that domain.");
  }

  if (domain.verified_at) {
    return;
  }

  let records: string[][];

  try {
    records = await resolveTxt(domain.domain);
  } catch {
    throw new ApiError(
      409,
      "domain_token_not_found",
      "We could not find that TXT record yet. Give DNS a little longer and try again."
    );
  }

  if (!records.flat().join(" ").includes(domain.verification_token)) {
    throw new ApiError(
      409,
      "domain_token_not_found",
      "The TXT record was found, but the token does not match yet."
    );
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
