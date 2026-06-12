import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env/settings";

let cachedAdminClient: any = null;

export function getSupabaseAdmin() {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const env = getEnv();

  cachedAdminClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  return cachedAdminClient;
}
