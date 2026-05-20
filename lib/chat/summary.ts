import type { ChatMessageRecord } from "@/lib/types";

function shorten(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}...`;
}

export function buildSessionSummary(messages: ChatMessageRecord[]) {
  const recentUserMessages = messages
    .filter((message) => message.role === "user")
    .slice(-3)
    .map((message) => shorten(message.content.trim(), 80));

  const recentAssistantMessages = messages
    .filter((message) => message.role === "assistant")
    .slice(-2)
    .map((message) => shorten(message.content.trim(), 100));

  const parts = [
    recentUserMessages.length > 0 ? `User shared: ${recentUserMessages.join(" | ")}` : "",
    recentAssistantMessages.length > 0
      ? `Assistant support: ${recentAssistantMessages.join(" | ")}`
      : ""
  ].filter(Boolean);

  return shorten(parts.join(" || "), 500);
}
