export const dynamic = "force-dynamic";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthPageCrumbs } from "@/components/auth/auth-page-crumbs";
import { OrganizationLoginForm } from "@/components/auth/organization-login-form";
import { redirectIfOrganizationAuthenticated } from "@/lib/auth/organization-guards";
import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { Content } from "@/components/layout/content";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default async function BusinessLoginPage() {
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
          <AuthPageCrumbs current="Business log in" />
          <AuthFormShell
            title="Log in to your business account"
            description="Use your work email and password to access the organization dashboard."
          >
            <OrganizationLoginForm />
          </AuthFormShell>
        </Container>
      </Content>

      <Footer className="pt-0">
        <Container>
          <p className="text-center text-xs tracking-[0.22em] text-muted/80">
            Employee check-ins and chats remain anonymous.
          </p>
        </Container>
      </Footer>
    </div>
  );
}
