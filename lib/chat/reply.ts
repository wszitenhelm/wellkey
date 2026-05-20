import { CRISIS_RESPONSE } from "@/lib/chat/constants";
import { isCrisisMessage } from "@/lib/chat/safety";
import { generateChatReply } from "@/lib/gemini/client";
import type { ChatMessageRecord } from "@/lib/types";

function getHeuristicReply(content: string) {
  const normalized = content.trim().toLowerCase();

  if (normalized === "okay" || normalized === "ok") {
    return "Okay can mean a lot of things. Was it mostly steady, heavy, or somewhere in between?";
  }

  if (/\b(bad|tired|overwhelmed)\b/i.test(content)) {
    return "I'm sorry today felt that heavy. Let's make this smaller. What drained you most?";
  }

  return null;
}

export async function createAssistantReply(messages: ChatMessageRecord[]) {
  const latestUserMessage = messages.at(-1);

  if (latestUserMessage && isCrisisMessage(latestUserMessage.content)) {
    return CRISIS_RESPONSE;
  }

  if (latestUserMessage) {
    const heuristicReply = getHeuristicReply(latestUserMessage.content);
    if (heuristicReply) {
      return heuristicReply;
    }
  }

  return generateChatReply(messages);
}
