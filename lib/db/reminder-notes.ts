import { getDb } from "@/lib/db/client";
import type { ReminderNoteKind, ReminderNoteRecord } from "@/lib/types";

export async function listReminderNotes(userId: string) {
  const db = getDb();
  return db<ReminderNoteRecord[]>`
    select id, user_id, kind, content, created_at
    from reminder_notes
    where user_id = ${userId}
    order by created_at desc
    limit 12
  `;
}

export async function createReminderNote(input: {
  userId: string;
  kind: ReminderNoteKind;
  content: string;
}) {
  const db = getDb();
  const notes = await db<ReminderNoteRecord[]>`
    insert into reminder_notes (user_id, kind, content)
    values (${input.userId}, ${input.kind}, ${input.content})
    returning id, user_id, kind, content, created_at
  `;

  return notes[0];
}
