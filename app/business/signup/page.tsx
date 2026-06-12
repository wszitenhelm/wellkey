export const dynamic = "force-dynamic";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthPageCrumbs } from "@/components/auth/auth-page-crumbs";
import { OrganizationSignupForm } from "@/components/auth/organization-signup-form";
import { redirectIfOrganizationAuthenticated } from "@/lib/auth/organization-guards";
import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { Content } from "@/components/layout/content";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default async function BusinessSignupPage() {
  await redirectIfOrganizationAuthenticated();

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
          <AuthPageCrumbs current="Business sign-up" />
          <AuthFormShell
            title="Create a business account"
            description="Set up your organization workspace with a work email and password."
          >
            <OrganizationSignupForm />
          </AuthFormShell>
        </Container>
      </Content>

      <Footer className="pt-0">
        <Container>
          <p className="text-center text-xs tracking-[0.22em] text-muted/80">
            Organization access is separate from anonymous employee accounts.
          </p>
        </Container>
      </Footer>
    </div>
  );
}
