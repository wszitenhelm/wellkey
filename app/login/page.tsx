export const dynamic = "force-dynamic";

import { redirectIfAuthenticated } from "@/lib/auth/guards";
import { PageShell } from "@/components/layout/page-shell";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <PageShell className="justify-center">
      <AuthFormShell
        title="Log in"
        description="Come back to your private space with your login code and password."
      >
        <LoginForm />
      </AuthFormShell>
    </PageShell>
  );
}
