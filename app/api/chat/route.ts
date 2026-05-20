import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { CHAT_ERROR_MESSAGE } from "@/lib/chat/constants";
import { createAssistantReply } from "@/lib/chat/reply";
import { buildSessionSummary } from "@/lib/chat/summary";
import {
  createChatMessage,
  getOrCreateChatSession,
  listRecentChatMessages,
  updateChatSessionSummary
} from "@/lib/db/chat";

type ChatRequest = {
  message?: string;
};

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ChatRequest;
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json({ error: CHAT_ERROR_MESSAGE }, { status: 400 });
  }

  try {
    const chatSession = await getOrCreateChatSession(session.userId);
    const recentMessages = await listRecentChatMessages(session.userId, chatSession.id);
    const pendingUserMessage = {
      id: "pending-user-message",
      session_id: chatSession.id,
      user_id: session.userId,
      role: "user" as const,
      content: message,
      created_at: new Date().toISOString()
    };
    const assistantContent = await createAssistantReply([
      ...recentMessages,
      pendingUserMessage
    ]);

    const userMessage = await createChatMessage({
      sessionId: chatSession.id,
      userId: session.userId,
      role: "user",
      content: message
    });

    const assistantMessage = await createChatMessage({
      sessionId: chatSession.id,
      userId: session.userId,
      role: "assistant",
      content: assistantContent
    });

    await updateChatSessionSummary(
      chatSession.id,
      session.userId,
      buildSessionSummary([...recentMessages, userMessage, assistantMessage])
    );

    return NextResponse.json({
      assistantMessage,
      userMessage
    });
  } catch {
    return NextResponse.json({ error: CHAT_ERROR_MESSAGE }, { status: 500 });
  }
}
