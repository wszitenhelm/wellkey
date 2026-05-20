"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";
import { SecondaryButton } from "@/components/ui/secondary-button";

type AppTopBarProps = {
  onOpenCheckIn?: () => void;
};

export function AppTopBar({ onOpenCheckIn }: AppTopBarProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <SecondaryButton className="px-4" onClick={onOpenCheckIn} type="button">
        Today's support
      </SecondaryButton>

      <form action={logoutAction}>
        <SecondaryButton aria-label="Log out" className="w-11 rounded-full p-0">
          <LogOut className="h-4 w-4" />
        </SecondaryButton>
      </form>
    </div>
  );
}
