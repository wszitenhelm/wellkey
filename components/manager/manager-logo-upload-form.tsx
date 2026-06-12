"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { getCsrfToken } from "@/lib/security/csrf/client";
import type { ActionState } from "@/lib/types";

type Props = {
  logoUrl: string | null;
};

export function ManagerLogoUploadForm({ logoUrl }: Props) {
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setState({});
        const csrfToken = await getCsrfToken();
        const response = await fetch("/api/manager/logo", {
          body: formData,
          headers: { "X-CSRF-Token": csrfToken },
          method: "POST"
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not upload your logo.");
        window.location.reload();
      } catch (error) {
        setState({ error: error instanceof Error ? error.message : "Could not upload your logo." });
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {logoUrl ? (
        <div className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
          <p className="text-sm text-muted">Current logo</p>
          <img alt="Organization logo" className="mt-3 h-16 w-16 rounded-2xl object-cover" src={logoUrl} />
        </div>
      ) : null}
      <input
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-accentForeground"
        name="logo"
        type="file"
      />
      <FormMessage state={state} />
      <Button disabled={pending} type="submit">
        {pending ? "Uploading..." : "Upload logo"}
      </Button>
    </form>
  );
}
