export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { redirectIfAuthenticated } from "@/lib/auth/guards";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthPageCrumbs } from "@/components/auth/auth-page-crumbs";
import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { Content } from "@/components/layout/content";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getOrganizationJoinContextBySlug } from "@/lib/db/organization-joins";

type Props = {
  params: Promise<{ orgSlug: string }>;
};

export default async function OrganizationSlugLoginPage({ params }: Props) {
  await redirectIfAuthenticated();
  const { orgSlug } = await params;
  const organization = await getOrganizationJoinContextBySlug(orgSlug);

  if (!organization) {
    notFound();
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header>
        <Container>
          <div className="py-2">
            <BrandMark />
          </div>
        </Container>
      </Header>

      <Content className="flex items-center py-6 sm:py-10" overflow="auto">
        <Container>
          <AuthPageCrumbs current={`Log in to ${organization.display_name}`} />
          <AuthFormShell
            title="Log in"
            description="You are logging in through your organization link. No company code is needed here."
          >
            <LoginForm
              organizationName={organization.display_name}
              organizationSlug={organization.slug}
              showOrganizationCode={false}
            />
          </AuthFormShell>
        </Container>
      </Content>

      <Footer className="pt-0">
        <Container>
          <p className="text-center text-xs tracking-[0.22em] text-muted/80">
            Your organization only sees anonymous aggregate data.
          </p>
        </Container>
      </Footer>
    </div>
  );
}
