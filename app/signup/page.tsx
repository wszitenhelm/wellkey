export const dynamic = "force-dynamic";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthPageCrumbs } from "@/components/auth/auth-page-crumbs";
import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { Content } from "@/components/layout/content";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
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
          <AuthPageCrumbs current="Create account" />
          <AuthFormShell
            title="Create an anonymous account"
            description="Choose a login code and password. We will show your recovery code once, and we never ask for email or phone."
          >
            <SignupForm />
          </AuthFormShell>
        </Container>
      </Content>

      <Footer className="pt-0">
        <Container>
          <p className="text-center text-xs tracking-[0.22em] text-muted/80">
            Private. Anonymous. Just for you.
          </p>
        </Container>
      </Footer>
    </div>
  );
}
