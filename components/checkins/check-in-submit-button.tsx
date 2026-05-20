"use client";

import { useFormStatus } from "react-dom";
import { PrimaryButton } from "@/components/ui/primary-button";

type CheckInSubmitButtonProps = {
  children: string;
};

export function CheckInSubmitButton({ children }: CheckInSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <PrimaryButton className="w-full" disabled={pending} type="submit">
      {pending ? "Saving..." : children}
    </PrimaryButton>
  );
}
