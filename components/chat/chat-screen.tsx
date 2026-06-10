"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { chatQuickReplies } from "@/lib/content/experience";
import { CHAT_ERROR_MESSAGE } from "@/lib/chat/constants";
import {
  createOptimisticUserMessage,
  replaceOptimisticMessage,
  sendChatMessage
} from "@/lib/chat/client";
import type { ChatMessageRecord } from "@/lib/types";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageList } from "@/components/chat/chat-message-list";

type ChatScreenProps = {
  initialInput?: string;
  initialMessages: ChatMessageRecord[];
};

export function ChatScreen({ initialInput = "", initialMessages }: ChatScreenProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState(initialInput);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitMessage(message: string) {
    const trimmedInput = message.trim();
    const lastUserMessage = [...messages].reverse().find((entry) => entry.role === "user");

    if (!trimmedInput) {
      return;
    }

    if (
      !isPending &&
      messages.at(-1)?.role === "assistant" &&
      lastUserMessage?.content.trim().toLowerCase() === trimmedInput.toLowerCase()
    ) {
      return;
    }

    const optimisticUserMessage = createOptimisticUserMessage(trimmedInput);

    setMessages((current) => [...current, optimisticUserMessage]);
    setInput("");
    setError("");

    startTransition(async () => {
      try {
        const { assistantMessage, userMessage } = await sendChatMessage(trimmedInput);

        setMessages((current) =>
          replaceOptimisticMessage(current, optimisticUserMessage.id, [
            userMessage,
            assistantMessage
          ])
        );
      } catch {
        setMessages((current) =>
          current.filter((message) => message.id !== optimisticUserMessage.id)
        );
        setError(CHAT_ERROR_MESSAGE);
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(input);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatMessageList
        isPending={isPending}
        messages={messages}
        onQuickReply={(value) => submitMessage(value)}
        quickReplies={chatQuickReplies}
      />
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+6.25rem)] left-1/2 z-20 w-full max-w-md -translate-x-1/2 px-4 sm:px-5">
        <ChatComposer
          error={error}
          input={input}
          isPending={isPending}
          onChange={setInput}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
