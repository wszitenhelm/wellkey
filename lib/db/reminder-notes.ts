import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ReminderNoteKind, ReminderNoteRecord } from "@/lib/types";

export async function listReminderNotes(userId: string) {
  const supabase = getSupabaseAdmin();

  return (
    unwrapSupabaseData(
      await supabase
        .from("reminder_notes")
        .select("id, user_id, kind, content, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12)
    ) as ReminderNoteRecord[] | null
  ) ?? [];
}

export async function createReminderNote(input: {
  userId: string;
  kind: ReminderNoteKind;
  content: string;
}) {
  const supabase = getSupabaseAdmin();
  const note = unwrapSupabaseData(
    await supabase
      .from("reminder_notes")
      .insert({
        content: input.content,
        kind: input.kind,
        user_id: input.userId
      })
      .select("id, user_id, kind, content, created_at")
      .single()
  ) as ReminderNoteRecord | null;

  if (!note) {
    throw new Error("REMINDER_NOTE_CREATE_FAILED");
  }

  return note;
}
