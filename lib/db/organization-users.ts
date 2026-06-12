import { hashPassword } from "@/lib/auth/password";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  generateOrganizationCryptoMaterial,
  generateOrganizationJoinCode
} from "@/lib/organizations/crypto";
import { ownerPermissions } from "@/lib/organizations/rbac";
import { createOrganizationSlug } from "@/lib/organizations/slug";

type CreateOrganizationAccountInput = {
  companyName: string;
  email: string;
  password: string;
};

type CreateOrganizationAccountResult =
  | { status: "email_taken" }
  | {
      status: "success";
      value: {
        organizationId: string;
        organizationUserId: string;
        permissions: string[];
      };
    };

type OrganizationAccountRpcResult = {
  organization_id: string;
  organization_user_id: string;
};

type OrganizationPermissionQueryRow = {
  organization_roles: {
    organization_role_permissions: Array<{
      organization_permissions: {
        key: string;
      } | null;
    }>;
  };
};

export async function createOrganizationAccount({
  companyName,
  email,
  password
}: CreateOrganizationAccountInput): Promise<CreateOrganizationAccountResult> {
  const supabase = getSupabaseAdmin();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = unwrapSupabaseData(
    await supabase
      .from("organization_users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle()
  );

  if (existing) {
    return { status: "email_taken" };
  }

  const passwordHash = await hashPassword(password);
  const joinCode = generateOrganizationJoinCode();
  const cryptoMaterial = generateOrganizationCryptoMaterial();
  const result = unwrapSupabaseData(
    await supabase.rpc("create_organization_account", {
      p_slug: createOrganizationSlug(companyName, joinCode),
      p_legal_name: companyName.trim(),
      p_display_name: companyName.trim(),
      p_email: normalizedEmail,
      p_password_hash: passwordHash,
      p_ec_public_key: cryptoMaterial.ecPublicKey,
      p_encrypted_ec_private_key: cryptoMaterial.encryptedEcPrivateKey,
      p_organization_seed: cryptoMaterial.organizationSeed,
      p_join_code: joinCode
    })
  ) as OrganizationAccountRpcResult[] | null;

  const created = result?.[0];

  if (!created) {
    throw new Error("ORGANIZATION_CREATE_FAILED");
  }

  return {
    status: "success",
    value: {
      organizationId: created.organization_id,
      organizationUserId: created.organization_user_id,
      permissions: ownerPermissions()
    }
  };
}

type OrganizationAuthUser = {
  id: string;
  organization_id: string;
  password_hash: string;
};

export async function findOrganizationUserForLogin(email: string) {
  const supabase = getSupabaseAdmin();

  return (unwrapSupabaseData(
    await supabase
      .from("organization_users")
      .select("id, organization_id, password_hash")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle()
  ) ?? null) as OrganizationAuthUser | null;
}

export async function getOrganizationPermissionsForUser(organizationUserId: string) {
  const supabase = getSupabaseAdmin();
  const rows = (unwrapSupabaseData(
    await supabase
      .from("organization_user_roles")
      .select("organization_roles!inner(organization_role_permissions!inner(organization_permissions!inner(key)))")
      .eq("organization_user_id", organizationUserId)
  ) ?? []) as OrganizationPermissionQueryRow[];

  return [
    ...new Set(
      rows.flatMap((row) =>
        row.organization_roles.organization_role_permissions.flatMap((permission) =>
          permission.organization_permissions?.key ? [permission.organization_permissions.key] : []
        )
      )
    )
  ];
}
