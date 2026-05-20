import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

type CredentialsPanelProps = {
  loginCode: string;
  recoveryCode: string;
};

export function CredentialsPanel({
  loginCode,
  recoveryCode
}: CredentialsPanelProps) {
  return (
    <Card className="space-y-5 border-accent/20 bg-accent/5 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-accent/10 p-2 text-accent">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Your private credentials</h2>
          <p className="text-sm text-muted">These codes are shown only once.</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Login code</p>
          <p className="mt-2 break-all text-lg font-semibold">{loginCode}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Recovery code</p>
          <p className="mt-2 break-all text-lg font-semibold">{recoveryCode}</p>
        </div>
      </div>

      <p className="text-sm leading-6 text-muted">
        We do not collect email or phone number. Save your login code and recovery
        code. If you lose them, we cannot recover your account.
      </p>
    </Card>
  );
}
