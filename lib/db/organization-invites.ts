import crypto from "node:crypto";
import { hashPassword } from "@/lib/auth/password";
import type {
  OrganizationAccessData,
  OrganizationSessionPayload
} from "@/lib/types";
import { hashIdentifier } from "@/lib/auth/codes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getOrganizationSupabaseServerClient } from "@/lib/supabase/organization-server";

type InviteRow = {
  created_at: string;
  email: string | null;
  expires_at: string;
  id: string;
};

type InvitePreview = {
  email: string | null;
  organizationDisplayName: string;
  organizationId: string;
};

function createInviteToken() {
  return crypto.randomBytes(24).toString("base64url");
}

export async function getOrganizationInvites(
  session: OrganizationSessionPayload
): Promise<OrganizationAccessData["invites"]> {
  const supabase = await getOrganizationSupabaseServerClient(session);
  const rows =
    ((unwrapSupabaseData(
      await supabase
        .from("organization_invites")
        .select("id, email, expires_at, created_at")
        .eq("organization_id", session.organizationId)
        .order("created_at", { ascending: false })
    ) as InviteRow[] | null) ?? []);

  return rows.map((row) => ({
    ...row
  }));
}

export async function createOrganizationInvite(
  session: OrganizationSessionPayload,
  email: string
) {
  const supabase = await getOrganizationSupabaseServerClient(session);
  const admin = getSupabaseAdmin();
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = unwrapSupabaseData(
    await admin
      .from("organization_users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle()
  );

  if (existingUser) {
    throw new Error("INVITE_EMAIL_TAKEN");
  }

  const rawToken = createInviteToken();
  const tokenHash = hashIdentifier(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  const inserted = unwrapSupabaseData(
    await supabase
      .from("organization_invites")
      .insert({
        created_by_organization_user_id: session.organizationUserId,
        email: normalizedEmail,
        expires_at: expiresAt,
        organization_id: session.organizationId,
        token_hash: tokenHash
      })
      .select("id")
      .single()
  ) as { id: string } | null;

  if (!inserted) {
    throw new Error("INVITE_CREATE_FAILED");
  }

  return {
    email: normalizedEmail,
    expiresAt,
    invitePath: `/business/invite/${rawToken}`,
    inviteToken: rawToken
  };
}

export async function revokeOrganizationInvite(
  session: OrganizationSessionPayload,
  inviteId: string
) {
  const supabase = await getOrganizationSupabaseServerClient(session);

  await unwrapSupabaseData(
    await supabase
      .from("organization_invites")
      .delete()
      .eq("id", inviteId)
      .eq("organization_id", session.organizationId)
  );
}

export async function getOrganizationInvitePreview(rawToken: string): Promise<InvitePreview | null> {
  const admin = getSupabaseAdmin();
  const tokenHash = hashIdentifier(rawToken);
  const invite = unwrapSupabaseData(
    await admin
      .from("organization_invites")
      .select("email, expires_at, organization_id")
      .eq("token_hash", tokenHash)
      .maybeSingle()
  ) as { email: string | null; expires_at: string; organization_id: string } | null;

  if (!invite || new Date(invite.expires_at).getTime() < Date.now()) {
    return null;
  }

  const organization = unwrapSupabaseData(
    await admin
      .from("organizations")
      .select("display_name")
      .eq("id", invite.organization_id)
      .single()
  ) as { display_name: string } | null;

  if (!organization) {
    return null;
  }

  return {
    email: invite.email,
    organizationDisplayName: organization.display_name,
    organizationId: invite.organization_id
  };
}

export async function acceptOrganizationInvite(input: {
  fullName: string;
  password: string;
  token: string;
}) {
  const admin = getSupabaseAdmin();
  const tokenHash = hashIdentifier(input.token);
  const invite = unwrapSupabaseData(
    await admin
      .from("organization_invites")
      .select("id, email, organization_id, expires_at")
      .eq("token_hash", tokenHash)
      .maybeSingle()
  ) as { email: string | null; expires_at: string; id: string; organization_id: string } | null;

  if (!invite?.email || new Date(invite.expires_at).getTime() < Date.now()) {
    return { status: "invalid_invite" } as const;
  }

  const passwordHash = await hashPassword(input.password);

  const existing = unwrapSupabaseData(
    await admin
      .from("organization_users")
      .select("id")
      .eq("email", invite.email)
      .maybeSingle()
  );

  if (existing) {
    return { status: "email_taken" } as const;
  }

  const created = unwrapSupabaseData(
    await admin
      .from("organization_users")
      .insert({
        email: invite.email,
        full_name: input.fullName.trim(),
        organization_id: invite.organization_id,
        password_hash: passwordHash,
        status: "active"
      })
      .select("id, organization_id")
      .single()
  ) as { id: string; organization_id: string } | null;

  if (!created) {
    throw new Error("INVITE_ACCEPT_FAILED");
  }

  await unwrapSupabaseData(await admin.from("organization_invites").delete().eq("id", invite.id));

  return {
    status: "success" as const,
    value: {
      organizationId: created.organization_id,
      organizationUserId: created.id
    }
  };
}
