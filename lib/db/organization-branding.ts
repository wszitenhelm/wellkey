import type { OrganizationSessionPayload } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { unwrapSupabaseData } from "@/lib/supabase/errors";

const LOGO_BUCKET = "organization-assets";

function sanitizeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
}

export async function uploadOrganizationLogo(
  session: OrganizationSessionPayload,
  file: File
) {
  const supabase = getSupabaseAdmin();
  const extension = file.name.split(".").pop() || "png";
  const path = `${session.organizationId}/logo-${Date.now()}-${sanitizeFileName(`brand.${extension}`)}`;
  const bucket = await supabase.storage.createBucket(LOGO_BUCKET, {
    fileSizeLimit: 2 * 1024 * 1024,
    public: true
  });

  if (bucket.error && !/already exists/i.test(bucket.error.message)) {
    throw new Error(bucket.error.message);
  }

  const upload = await supabase.storage.from(LOGO_BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: true
  });

  if (upload.error && !/already exists/i.test(upload.error.message)) {
    throw new Error(upload.error.message);
  }

  const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);

  await unwrapSupabaseData(
    await supabase
      .from("organizations")
      .update({ logo_url: data.publicUrl })
      .eq("id", session.organizationId)
  );

  return data.publicUrl;
}
