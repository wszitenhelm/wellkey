import type { ActionState } from "@/lib/types";

type FormMessageProps = {
  state: ActionState;
};

export function FormMessage({ state }: FormMessageProps) {
  if (!state.error) {
    return null;
  }

  return <p className="text-sm text-danger">{state.error}</p>;
}
