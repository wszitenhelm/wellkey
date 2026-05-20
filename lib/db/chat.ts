import { getDb } from "@/lib/db/client";
import type {
  ChatMessageRecord,
  ChatMessageRole,
  ChatSessionRecord,
  ChatViewData
} from "@/lib/types";

type ChatSessionRow = ChatSessionRecord;
type ChatMessageRow = ChatMessageRecord;

async function findLatestChatSession(userId: string) {
  const db = getDb();
  const sessions = await db<ChatSessionRow[]>`
    select id, user_id, summary, created_at, updated_at
    from chat_sessions
    where user_id = ${userId}
    order by updated_at desc
    limit 1
  `;

  return sessions[0] ?? null;
}

async function listChatMessages(userId: string, sessionId: string, newestFirst = false, limit?: number) {
  const db = getDb();

  if (newestFirst && limit) {
    const messages = await db<ChatMessageRow[]>`
      select id, session_id, user_id, role, content, created_at
      from chat_messages
      where user_id = ${userId}
        and session_id = ${sessionId}
      order by created_at desc
      limit ${limit}
    `;

    return messages;
  }

  return db<ChatMessageRow[]>`
    select id, session_id, user_id, role, content, created_at
    from chat_messages
    where user_id = ${userId}
      and session_id = ${sessionId}
    order by created_at asc
  `;
}

async function touchChatSession(sessionId: string, userId: string) {
  const db = getDb();
  await db`
    update chat_sessions
    set updated_at = timezone('utc', now())
    where id = ${sessionId}
      and user_id = ${userId}
  `;
}

export async function getLatestChatView(userId: string): Promise<ChatViewData> {
  const session = await findLatestChatSession(userId);

  if (!session) {
    return { session: null, messages: [] };
  }

  const messages = await listChatMessages(userId, session.id);

  return { session, messages };
}

export async function getOrCreateChatSession(userId: string) {
  const existingSession = await findLatestChatSession(userId);

  if (existingSession) {
    return existingSession;
  }

  const db = getDb();
  const sessions = await db<ChatSessionRow[]>`
    insert into chat_sessions (user_id)
    values (${userId})
    returning id, user_id, summary, created_at, updated_at
  `;

  return sessions[0];
}

export async function createChatMessage(input: {
  sessionId: string;
  userId: string;
  role: ChatMessageRole;
  content: string;
}) {
  const db = getDb();
  const messages = await db<ChatMessageRow[]>`
    insert into chat_messages (session_id, user_id, role, content)
    values (${input.sessionId}, ${input.userId}, ${input.role}, ${input.content})
    returning id, session_id, user_id, role, content, created_at
  `;

  await touchChatSession(input.sessionId, input.userId);

  return messages[0];
}

export async function listRecentChatMessages(userId: string, sessionId: string, limit = 12) {
  const messages = await listChatMessages(userId, sessionId, true, limit);
  return messages.reverse();
}

export async function updateChatSessionSummary(sessionId: string, userId: string, summary: string) {
  const db = getDb();
  await db`
    update chat_sessions
    set summary = ${summary},
        updated_at = timezone('utc', now())
    where id = ${sessionId}
      and user_id = ${userId}
  `;
}
