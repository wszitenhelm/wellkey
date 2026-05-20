"use client";

import { useEffect, useRef } from "react";
import { SoftCard } from "@/components/ui/soft-card";
import type { ChatMessageRecord } from "@/lib/types";

type ChatMessageListProps = {
  isPending: boolean;
  messages: ChatMessageRecord[];
  onQuickReply: (value: string) => void;
  quickReplies: { label: string; value: string }[];
};

export function ChatMessageList({
  isPending,
  messages,
  onQuickReply,
  quickReplies
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAssistantId = [...messages].reverse().find((message) => message.role === "assistant")?.id;

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [isPending, messages]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-1" ref={containerRef}>
      <div className="space-y-3 pb-[calc(env(safe-area-inset-bottom,0px)+11rem)]">
        <SoftCard className="mr-8 p-5 sm:mr-10">
          <p className="text-sm leading-6 text-foreground">How has work felt today?</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            I'm here with you. You can share as much or as little as you want.
          </p>
          {messages.length === 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply.value}
                  className="rounded-full bg-accent/10 px-3.5 py-2 text-sm font-medium text-accent"
                  onClick={() => onQuickReply(reply.value)}
                  type="button"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          ) : null}
        </SoftCard>

        {messages.map((message) => (
          <SoftCard
            key={message.id}
            className={message.role === "user" ? "ml-8 p-4 sm:ml-10" : "mr-8 p-4 sm:mr-10"}
          >
            {message.role === "assistant" ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Assistant
              </p>
            ) : null}
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
            {message.role === "assistant" && message.id === lastAssistantId ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply.value}
                    className="rounded-full bg-foreground/5 px-3.5 py-2 text-sm font-medium text-foreground"
                    onClick={() => onQuickReply(reply.value)}
                    type="button"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            ) : null}
          </SoftCard>
        ))}

        {isPending ? (
          <SoftCard className="mr-8 p-4 sm:mr-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Assistant
            </p>
            <p className="mt-2 text-sm text-muted">Thinking...</p>
          </SoftCard>
        ) : null}
      </div>
    </div>
  );
}
