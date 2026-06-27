export const dynamic = "force-dynamic";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthPageCrumbs } from "@/components/auth/auth-page-crumbs";
import { RecoveryForm } from "@/components/auth/recovery-form";
import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { Content } from "@/components/layout/content";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { redirectIfAuthenticated } from "@/lib/auth/guards";

export default async function RecoverPage() {
  await redirectIfAuthenticated();

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
          <AuthPageCrumbs current="Recover account" href="/login" label="Back to log in" />
          <AuthFormShell
            title="Recover your account"
            description="Use your login code and recovery code to set a new password. We will rotate your recovery code right away."
          >
            <RecoveryForm />
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
