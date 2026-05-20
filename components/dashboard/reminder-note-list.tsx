import type { ReminderNoteRecord } from "@/lib/types";
import { SoftCard } from "@/components/ui/soft-card";

type ReminderNoteListProps = {
  notes: ReminderNoteRecord[];
};

function noteTone(kind: ReminderNoteRecord["kind"]) {
  if (kind === "gratitude") {
    return { label: "Gratitude", classes: "border-amber-200/70 bg-amber-50/80" };
  }

  if (kind === "small_win") {
    return { label: "A small win", classes: "border-teal-200/70 bg-teal-50/80" };
  }

  if (kind === "something_i_handled") {
    return { label: "Something I handled", classes: "border-blue-200/70 bg-sky-50/80" };
  }

  if (kind === "what_i_need_today") {
    return { label: "What I need today", classes: "border-stone-200/70 bg-stone-50/90" };
  }

  return {
    label: "Something good about me",
    classes: "border-rose-200/70 bg-rose-50/80"
  };
}

export function ReminderNoteList({ notes }: ReminderNoteListProps) {
  if (notes.length === 0) {
    return (
      <SoftCard className="p-5">
        <p className="font-semibold">No reminders yet</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Save one kind thought, one small win, or one thing you need today.
          It will stay here as a quiet reminder.
        </p>
      </SoftCard>
    );
  }

  return (
    <div className="grid gap-3">
      {notes.map((note) => {
        const tone = noteTone(note.kind);

        return (
          <SoftCard key={note.id} className={`border ${tone.classes} p-5`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {tone.label}
            </p>
            <p className="mt-3 text-sm leading-6 text-foreground">{note.content}</p>
          </SoftCard>
        );
      })}
    </div>
  );
}
