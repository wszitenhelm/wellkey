"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { recoverWithApi } from "@/lib/auth/api";
import { AuthField } from "@/components/auth/auth-field";
import { CredentialsPanel } from "@/components/auth/credentials-panel";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import type { RecoveryActionState } from "@/lib/types";

export function RecoveryForm() {
  const [state, setState] = useState<RecoveryActionState>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setState({});
        const response = await recoverWithApi({
          loginCode: String(formData.get("loginCode") ?? ""),
          newPassword: String(formData.get("newPassword") ?? ""),
          recoveryCode: String(formData.get("recoveryCode") ?? "")
        });
        setState({ credentials: response.credentials });
      } catch (error) {
        setState({
          error:
            error instanceof Error
              ? error.message
              : "We could not recover your account. Please try again."
        });
      }
    });
  }

  if (state.credentials) {
    return (
      <div className="space-y-4">
        <CredentialsPanel
          loginCode={state.credentials.loginCode}
          recoveryCode={state.credentials.recoveryCode}
        />
        <Button asChild className="w-full">
          <Link href="/dashboard">Continue to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <AuthField autoCapitalize="none" label="Login code" name="loginCode" placeholder="quiet-river-4821" />
      <AuthField autoCapitalize="none" label="Recovery code" name="recoveryCode" placeholder="forest-lamp-river-82" />
      <AuthField label="New password" name="newPassword" placeholder="At least 10 characters" type="password" />

      <FormMessage state={state} />

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Recovering..." : "Reset password"}
      </Button>

      <p className="text-center text-sm text-muted">
        Found your password instead?{" "}
        <Link className="font-semibold text-foreground" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
