import { ManagerCopyCard } from "@/components/manager/manager-copy-card";
import { ManagerDomainCard } from "@/components/manager/manager-domain-card";
import { ManagerLogoUploadForm } from "@/components/manager/manager-logo-upload-form";
import { ManagerSettingsForm } from "@/components/manager/manager-settings-form";
import { ManagerWorkspaceSettingsForm } from "@/components/manager/manager-workspace-settings-form";
import { SoftCard } from "@/components/ui/soft-card";
import { requireOrganizationSession } from "@/lib/auth/organization-guards";
import { getOrganizationWorkspaceData } from "@/lib/db/organization-workspace";
import { hasAnyOrganizationPermission, hasOrganizationPermission } from "@/lib/organizations/permissions";

export default async function ManagerSettingsPage() {
  const session = await requireOrganizationSession();
  const workspace = await getOrganizationWorkspaceData(session);
  const canManageProfile = hasOrganizationPermission(session.permissions, "manage_company_profile");
  const canManageDomains = hasOrganizationPermission(session.permissions, "manage_domains");

  if (!hasAnyOrganizationPermission(session.permissions, ["manage_company_profile", "manage_domains"])) {
    return (
      <SoftCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Settings</p>
        <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Access needed</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Your current role does not include organization settings permissions yet.
        </p>
      </SoftCard>
    );
  }

  return (
    <div className="grid gap-4">
      <SoftCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Employee entry
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Shareable organization access</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Use the slug path for smoother sign-up, or keep the join code available for flexible onboarding.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ManagerCopyCard
            label="Slug path"
            value={`/${workspace.organization.slug}/sign-up`}
          />
          <ManagerCopyCard
            label="Join code"
            value={workspace.organization.join_code ?? "Pending"}
          />
        </div>
      </SoftCard>

      {canManageProfile ? (
        <>
          <SoftCard className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Profile</p>
            <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Company profile</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Manage your organization details, branding, address, and billing information.
            </p>
            <div className="mt-6">
              <ManagerSettingsForm workspace={workspace} />
            </div>
          </SoftCard>

          <SoftCard className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Branding</p>
            <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Logo and identity</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Upload a clean logo and adjust how the organization appears across the workspace.
            </p>
            <div className="mt-6">
              <ManagerLogoUploadForm logoUrl={workspace.organization.logo_url} />
            </div>
          </SoftCard>

          <SoftCard className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Workspace</p>
            <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Privacy and reporting controls</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Tune how anonymous joining and aggregate reporting behave for your organization.
            </p>
            <div className="mt-6">
              <ManagerWorkspaceSettingsForm workspace={workspace} />
            </div>
          </SoftCard>
        </>
      ) : null}

      {canManageDomains ? (
        <SoftCard className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Domain verification
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Verified company domains</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Add a domain and place the TXT token in DNS so your organization can prove ownership.
          </p>
          <div className="mt-6">
            <ManagerDomainCard domains={workspace.domains} />
          </div>
        </SoftCard>
      ) : null}
    </div>
  );
}
