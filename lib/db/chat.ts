import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  ChatMessageRecord,
  ChatMessageRole,
  ChatSessionRecord,
  ChatViewData
} from "@/lib/types";

type ChatSessionRow = ChatSessionRecord;
type ChatMessageRow = ChatMessageRecord;

function normalizeContent(content: string) {
  return content.trim().toLowerCase();
}

function isSameMessage(a: ChatMessageRecord, b: ChatMessageRecord) {
  return a.role === b.role && normalizeContent(a.content) === normalizeContent(b.content);
}

function compactChatHistory(messages: ChatMessageRecord[]) {
  const compacted: ChatMessageRecord[] = [];

  for (const message of messages) {
    const previous = compacted.at(-1);

    if (previous && isSameMessage(previous, message)) {
      continue;
    }

    compacted.push(message);
  }

  return compacted;
}

async function findLatestChatSession(userId: string) {
  const supabase = getSupabaseAdmin();
  return (
    unwrapSupabaseData(
      await supabase
        .from("chat_sessions")
        .select("id, user_id, summary, created_at, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ) as ChatSessionRow | null
  ) ?? null;
}

async function findChatSessionById(userId: string, sessionId: string) {
  const supabase = getSupabaseAdmin();
  return (
    unwrapSupabaseData(
      await supabase
        .from("chat_sessions")
        .select("id, user_id, summary, created_at, updated_at")
        .eq("user_id", userId)
        .eq("id", sessionId)
        .maybeSingle()
    ) as ChatSessionRow | null
  ) ?? null;
}

async function listChatMessages(userId: string, sessionId: string, newestFirst = false, limit?: number) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("chat_messages")
    .select("id, session_id, user_id, role, content, created_at")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: !newestFirst });

  if (newestFirst && limit) {
    query = query.limit(limit);
  }

  return (unwrapSupabaseData(await query) as ChatMessageRow[] | null) ?? [];
}

async function touchChatSession(sessionId: string, userId: string) {
  const supabase = getSupabaseAdmin();
  unwrapSupabaseData(
    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("user_id", userId)
  );
}

export async function getLatestChatView(userId: string): Promise<ChatViewData> {
  const session = await findLatestChatSession(userId);

  if (!session) {
    return { session: null, messages: [] };
  }

  const messages = compactChatHistory(
    await listRecentChatMessages(userId, session.id, 24)
  ).slice(-12);

  return { session, messages };
}

export async function getOrCreateChatSession(userId: string) {
  const existingSession = await findLatestChatSession(userId);

  if (existingSession) {
    return existingSession;
  }

  const supabase = getSupabaseAdmin();
  const session = unwrapSupabaseData(
    await supabase
      .from("chat_sessions")
      .insert({ user_id: userId })
      .select("id, user_id, summary, created_at, updated_at")
      .single()
  ) as ChatSessionRow | null;

  if (!session) {
    throw new Error("CHAT_SESSION_CREATE_FAILED");
  }

  return session;
}

export async function getChatSessionForUser(userId: string, sessionId: string) {
  return findChatSessionById(userId, sessionId);
}

export async function createChatMessage(input: {
  sessionId: string;
  userId: string;
  role: ChatMessageRole;
  content: string;
}) {
  const supabase = getSupabaseAdmin();
  const message = unwrapSupabaseData(
    await supabase
      .from("chat_messages")
      .insert({
        content: input.content,
        role: input.role,
        session_id: input.sessionId,
        user_id: input.userId
      })
      .select("id, session_id, user_id, role, content, created_at")
      .single()
  ) as ChatMessageRow | null;

  await touchChatSession(input.sessionId, input.userId);

  if (!message) {
    throw new Error("CHAT_MESSAGE_CREATE_FAILED");
  }

  return message;
}

export async function listRecentChatMessages(userId: string, sessionId: string, limit = 12) {
  const messages = await listChatMessages(userId, sessionId, true, limit);
  return messages.reverse();
}

export async function updateChatSessionSummary(sessionId: string, userId: string, summary: string) {
  const supabase = getSupabaseAdmin();
  unwrapSupabaseData(
    await supabase
      .from("chat_sessions")
      .update({
        summary,
        updated_at: new Date().toISOString()
      })
      .eq("id", sessionId)
      .eq("user_id", userId)
  );
}
