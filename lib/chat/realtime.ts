"use client";

import { useEffect, useEffectEvent } from "react";
import {
  getBrowserSupabaseClient,
  hasBrowserSupabaseConfig
} from "@/lib/supabase/browser-client";
import { useSupabaseRealtimeAuth } from "@/lib/supabase/realtime-client";
import type { ChatMessageRecord } from "@/lib/types";

type UseChatRealtimeInput = {
  enabled: boolean;
  onMessage: (message: ChatMessageRecord) => void;
  sessionId: string | null;
};

export function useChatRealtime({ enabled, onMessage, sessionId }: UseChatRealtimeInput) {
  const isRealtimeReady = useSupabaseRealtimeAuth(enabled && Boolean(sessionId));
  const handleMessage = useEffectEvent(onMessage);

  useEffect(() => {
    if (!enabled || !sessionId || !hasBrowserSupabaseConfig() || !isRealtimeReady) {
      return;
    }

    const supabase = getBrowserSupabaseClient();
    const channel = supabase
      .channel(`chat-messages:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          filter: `session_id=eq.${sessionId}`,
          schema: "public",
          table: "chat_messages"
        },
        (payload) => {
          handleMessage(payload.new as ChatMessageRecord);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, handleMessage, isRealtimeReady, sessionId]);
}
