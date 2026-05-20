export const dynamic = "force-dynamic";

import { PageShell } from "@/components/layout/page-shell";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  return (
    <PageShell className="justify-center">
      <AuthFormShell
        title="Create an anonymous account"
        description="Choose a login code and password. We will show your recovery code once, and we never ask for email or phone."
      >
        <SignupForm />
      </AuthFormShell>
    </PageShell>
  );
}
