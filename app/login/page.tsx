export const dynamic = "force-dynamic";

import { redirectIfAuthenticated } from "@/lib/auth/guards";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthPageCrumbs } from "@/components/auth/auth-page-crumbs";
import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { Content } from "@/components/layout/content";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
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
          <AuthPageCrumbs current="Log in" />
          <AuthFormShell
            title="Log in"
            description="Come back to your private space with your login code and password."
          >
            <LoginForm />
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
