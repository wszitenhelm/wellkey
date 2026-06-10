import type { ChatMessageRecord } from "@/lib/types";

function normalizeContent(content: string) {
  return content.trim().toLowerCase();
}

function isSameMessage(a: ChatMessageRecord, b: ChatMessageRecord) {
  return a.role === b.role && normalizeContent(a.content) === normalizeContent(b.content);
}

function isRepeatedPair(messages: ChatMessageRecord[], index: number) {
  if (index + 3 >= messages.length) {
    return false;
  }

  return (
    isSameMessage(messages[index], messages[index + 2]) &&
    isSameMessage(messages[index + 1], messages[index + 3])
  );
}

export function compactChatMessages(messages: ChatMessageRecord[]) {
  const compacted: ChatMessageRecord[] = [];

  for (let index = 0; index < messages.length; index += 1) {
    const current = messages[index];
    const lastCompacted = compacted.at(-1);

    if (lastCompacted && isSameMessage(lastCompacted, current)) {
      continue;
    }

    if (isRepeatedPair(messages, index)) {
      compacted.push(current, messages[index + 1]);

      while (isRepeatedPair(messages, index)) {
        index += 2;
      }

      continue;
    }

    compacted.push(current);
  }

  return compacted;
}

export function getVisibleChatMessages(messages: ChatMessageRecord[], maxMessages = 4) {
  return compactChatMessages(messages).slice(-maxMessages);
}
