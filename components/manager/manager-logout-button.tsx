"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { getCsrfToken } from "@/lib/security/csrf/client";
import { Button } from "@/components/ui/button";

export function ManagerLogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      className="w-full justify-start rounded-2xl px-4"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const csrfToken = await getCsrfToken();
          await fetch("/api/org-auth/logout", {
            headers: { "X-CSRF-Token": csrfToken },
            method: "POST"
          });
          window.location.href = "/";
        })
      }
      variant="ghost"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </Button>
  );
}
