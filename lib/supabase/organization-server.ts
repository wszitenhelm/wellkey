import { createClient } from "@supabase/supabase-js";
import type { OrganizationSessionPayload } from "@/lib/types";
import { getEnv } from "@/lib/env/settings";
import { signOrganizationSupabaseToken } from "@/lib/supabase/organization-token";

export async function getOrganizationSupabaseServerClient(session: OrganizationSessionPayload) {
  const env = getEnv();
  const signed = await signOrganizationSupabaseToken({
    organizationId: session.organizationId,
    organizationUserId: session.organizationUserId,
    permissions: session.permissions
  });

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${signed.token}`
      }
    }
  });
}
