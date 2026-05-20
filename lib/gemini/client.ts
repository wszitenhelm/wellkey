import { getEnv } from "@/lib/config/env";
import { CHAT_SYSTEM_INSTRUCTION } from "@/lib/chat/constants";
import type { ChatMessageRecord } from "@/lib/types";

type GeminiPart = {
  text: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiPart[];
  };
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
};

function toGeminiRole(role: ChatMessageRecord["role"]) {
  return role === "assistant" ? "model" : "user";
}

export async function generateChatReply(messages: ChatMessageRecord[]) {
  const env = getEnv();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: CHAT_SYSTEM_INSTRUCTION }]
        },
        contents: messages.map((message) => ({
          role: toGeminiRole(message.role),
          parts: [{ text: message.content }]
        }))
      }),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("GEMINI_REQUEST_FAILED");
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .join("")
    .trim();

  if (!text) {
    throw new Error("GEMINI_EMPTY_RESPONSE");
  }

  return text;
}
