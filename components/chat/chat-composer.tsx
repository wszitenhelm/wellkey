import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/ui/primary-button";

type ChatComposerProps = {
  error: string;
  input: string;
  isPending: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChatComposer({
  error,
  input,
  isPending,
  onChange,
  onSubmit
}: ChatComposerProps) {
  return (
    <form className="space-y-2" onSubmit={onSubmit}>
      <div className="flex items-center gap-2 rounded-[1.9rem] border border-border/70 bg-background/96 px-1.5 py-1.5 shadow-soft backdrop-blur-md">
        <Input
          className="min-w-0 h-11 border-0 bg-transparent px-3 shadow-none focus:border-0"
          name="message"
          placeholder="Share what today has felt like..."
          value={input}
          onChange={(event) => onChange(event.target.value)}
        />
        <PrimaryButton className="h-11 shrink-0 px-4 sm:px-5" disabled={isPending} type="submit">
          {isPending ? "..." : "Send"}
        </PrimaryButton>
      </div>
      {error ? <p className="px-2 text-sm text-danger">{error}</p> : null}
    </form>
  );
}
