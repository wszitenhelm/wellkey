import type { ChatMessageRecord } from "@/lib/types";

type ChatApiResponse = {
  assistantMessage?: ChatMessageRecord;
  error?: string;
  userMessage?: ChatMessageRecord;
};

export function createOptimisticUserMessage(content: string): ChatMessageRecord {
  return {
    id: `local-${crypto.randomUUID()}`,
    session_id: "pending",
    user_id: "pending",
    role: "user",
    content,
    created_at: new Date().toISOString()
  };
}

export function replaceOptimisticMessage(
  messages: ChatMessageRecord[],
  optimisticId: string,
  nextMessages: ChatMessageRecord[]
) {
  return [
    ...messages.filter((message) => message.id !== optimisticId),
    ...nextMessages
  ];
}

export async function sendChatMessage(message: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });

  const data = (await response.json()) as ChatApiResponse;

  if (!response.ok || !data.assistantMessage || !data.userMessage) {
    throw new Error(data.error ?? "Something went wrong. Please try again.");
  }

  return {
    assistantMessage: data.assistantMessage,
    userMessage: data.userMessage
  };
}
