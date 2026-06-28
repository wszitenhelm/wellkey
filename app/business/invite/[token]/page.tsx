export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { OrganizationInviteAcceptForm } from "@/components/auth/organization-invite-accept-form";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthPageCrumbs } from "@/components/auth/auth-page-crumbs";
import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { Content } from "@/components/layout/content";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { redirectIfOrganizationAuthenticated } from "@/lib/auth/organization-guards";
import { getOrganizationInvitePreview } from "@/lib/db/organization-invites";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function OrganizationInviteAcceptPage({ params }: Props) {
  await redirectIfOrganizationAuthenticated();
  const { token } = await params;
  const invite = await getOrganizationInvitePreview(token);

  if (!invite) {
    notFound();
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header>
        <Container>
          <div className="flex items-center justify-between py-2">
            <BrandMark />
          </div>
        </Container>
      </Header>

      <Content className="flex items-center py-6 sm:py-10" overflow="auto">
        <Container>
          <AuthPageCrumbs current="Accept invite" href="/business/login" label="Back to business log in" />
          <AuthFormShell
            title="Join this workspace"
            description="Set your password to accept this invite and get access to the organization dashboard."
          >
            <OrganizationInviteAcceptForm
              organizationName={invite.organizationDisplayName}
              token={token}
              workEmail={invite.email}
            />
          </AuthFormShell>
        </Container>
      </Content>

      <Footer className="pt-0">
        <Container>
          <p className="text-center text-xs tracking-[0.22em] text-muted/80">
            Organization access stays separate from anonymous employee accounts.
          </p>
        </Container>
      </Footer>
    </div>
  );
}
