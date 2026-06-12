"use client";

import { useEffect, useState } from "react";
import {
  getBrowserSupabaseClient,
  hasBrowserSupabaseConfig
} from "@/lib/supabase/browser-client";
import { useSupabaseRealtimeAuth } from "@/lib/supabase/realtime-client";
import type { ReminderNoteRecord } from "@/lib/types";
import { ReminderNoteList } from "@/components/dashboard/reminder-note-list";

type LiveReminderNoteListProps = {
  initialNotes: ReminderNoteRecord[];
  userId: string;
};

export function LiveReminderNoteList({ initialNotes, userId }: LiveReminderNoteListProps) {
  const [notes, setNotes] = useState(initialNotes);
  const isRealtimeReady = useSupabaseRealtimeAuth(Boolean(userId));

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    if (!hasBrowserSupabaseConfig() || !isRealtimeReady) {
      return;
    }

    const supabase = getBrowserSupabaseClient();
    const channel = supabase
      .channel(`reminder-notes:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          filter: `user_id=eq.${userId}`,
          schema: "public",
          table: "reminder_notes"
        },
        (payload) => {
          const note = payload.new as ReminderNoteRecord;
          setNotes((current) => {
            if (current.some((entry) => entry.id === note.id)) {
              return current;
            }

            return [note, ...current].slice(0, 12);
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isRealtimeReady, userId]);

  return <ReminderNoteList notes={notes} />;
}
