"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutWithApi } from "@/lib/auth/api";
import { SecondaryButton } from "@/components/ui/secondary-button";

type AppTopBarProps = {
  onOpenCheckIn?: () => void;
};

export function AppTopBar({ onOpenCheckIn }: AppTopBarProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-3">
      <SecondaryButton className="px-4" onClick={onOpenCheckIn} type="button">
        Today's support
      </SecondaryButton>

      <SecondaryButton
        aria-label="Log out"
        className="w-11 rounded-full p-0"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await logoutWithApi();
            window.location.href = "/";
          })
        }
      >
          <LogOut className="h-4 w-4" />
      </SecondaryButton>
    </div>
  );
}
