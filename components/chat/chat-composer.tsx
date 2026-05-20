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
      <div className="flex items-center gap-2 rounded-[1.75rem] border border-border/80 bg-background/95 px-2 py-2 shadow-soft backdrop-blur-sm">
        <Input
          className="h-11 border-0 bg-transparent px-3 shadow-none focus:border-0"
          name="message"
          placeholder="Share what today has felt like..."
          value={input}
          onChange={(event) => onChange(event.target.value)}
        />
        <PrimaryButton className="h-11 px-5" disabled={isPending} type="submit">
          {isPending ? "..." : "Send"}
        </PrimaryButton>
      </div>
      {error ? <p className="px-2 text-sm text-danger">{error}</p> : null}
    </form>
  );
}
