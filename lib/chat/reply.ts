import { CRISIS_RESPONSE } from "@/lib/chat/constants";
import { isCrisisMessage } from "@/lib/chat/safety";
import { generateChatReply } from "@/lib/gemini/client";
import type { ChatMessageRecord } from "@/lib/types";

function getFallbackAssistantReply(content: string) {
  const normalized = content.trim().toLowerCase();

  if (normalized.includes("meditation")) {
    return [
      "Let's keep this very simple.",
      "Take one slower breath in through your nose for 4.",
      "Hold for 2.",
      "Exhale gently for 6.",
      "Do that three times, and while you breathe, ask yourself: what do I need most from this moment?"
    ].join(" ");
  }

  if (/\b(workload|too much|busy|swamped)\b/i.test(content)) {
    return "That sounds like a lot to carry at once. What feels most pressing right now: the amount of work, the pace, or not knowing where to start?";
  }

  if (/\b(meetings)\b/i.test(content)) {
    return "Meetings can take a lot out of a day. Was it more the number of meetings, the people in them, or not having enough space between them?";
  }

  if (/\b(sleep|tired|exhausted)\b/i.test(content)) {
    return "That kind of tiredness can make everything feel heavier. What would help most tonight: less stimulation, an earlier stop, or a gentler plan for tomorrow morning?";
  }

  if (/\b(unclear|priorities|confused|direction)\b/i.test(content)) {
    return "Unclear priorities can make the whole day feel heavier than it needs to. If we made it smaller, what feels like the one thing that matters most today?";
  }

  if (/\b(people|manager|team|coworker|colleague)\b/i.test(content)) {
    return "People stress can linger in the body. Do you want to talk through what happened, or think about the next small boundary you want to hold?";
  }

  return "I'm here with you. What feels hardest about work today: the pressure, the pace, the people, or something else?";
}

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

  try {
    return await generateChatReply(messages);
  } catch (error) {
    console.warn("gemini_unavailable_using_fallback", error);
    return getFallbackAssistantReply(latestUserMessage?.content ?? "");
  }
}
