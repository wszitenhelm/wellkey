import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { CHAT_ERROR_MESSAGE } from "@/lib/chat/constants";
import { createAssistantReply } from "@/lib/chat/reply";
import { buildSessionSummary } from "@/lib/chat/summary";
import { validateCsrf } from "@/lib/security/csrf/server";
import { applyCorsHeaders } from "@/lib/security/headers";
import { isAllowedOrigin, isSameOriginRequest } from "@/lib/security/origins";
import { handleApiError, jsonApiError } from "@/lib/server/api/apiErrors";
import { recordApiMetric, startApiTimer } from "@/lib/server/api/metrics";
import { jsonApiResponse } from "@/lib/server/api/responses";
import { rateLimitRequest } from "@/lib/server/ratelimits";
import {
  createChatMessage,
  getChatSessionForUser,
  getOrCreateChatSession,
  listRecentChatMessages,
  updateChatSessionSummary
} from "@/lib/db/chat";

type ChatRequest = {
  message?: string;
  sessionId?: string;
};

function withMetrics(request: Request, response: NextResponse, startedAt: () => number) {
  const durationMs = startedAt();
  const metrics = recordApiMetric("/api/chat", durationMs);

  response.headers.set("Server-Timing", `app;dur=${durationMs}`);
  response.headers.set("X-Response-Time-Ms", `${durationMs}`);
  response.headers.set("X-API-P95-Ms", `${metrics.p95}`);
  response.headers.set("X-API-P99-Ms", `${metrics.p99}`);
  return response;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");

  if (origin && !isAllowedOrigin(origin) && !isSameOriginRequest(request)) {
    return jsonApiError(request, {
      code: "origin_not_allowed",
      message: "Origin not allowed.",
      status: 403
    });
  }

  const response = new NextResponse(null, { status: 204 });
  applyCorsHeaders(response, origin);
  return response;
}

export async function POST(request: Request) {
  const stopTimer = startApiTimer();
  const session = await getSession();

  if (!session) {
    return withMetrics(
      request,
      jsonApiError(request, {
        code: "unauthorized",
        message: "Unauthorized",
        status: 401
      }),
      stopTimer
    );
  }

  const csrfCheck = validateCsrf(request);

  if (!csrfCheck.ok) {
    return withMetrics(
      request,
      jsonApiError(request, {
        code: "csrf_rejected",
        message: csrfCheck.reason,
        status: csrfCheck.status
      }),
      stopTimer
    );
  }

  const limit = rateLimitRequest(request, {
    limit: 20,
    userId: session.userId,
    windowMs: 60_000
  });

  if (!limit.ok) {
    const response = jsonApiError(request, {
      code: "rate_limited",
      message: "Too many requests. Please slow down.",
      status: 429
    });

    response.headers.set("Retry-After", `${Math.ceil((limit.resetAt - Date.now()) / 1000)}`);
    return withMetrics(request, response, stopTimer);
  }

  const body = (await request.json()) as ChatRequest;
  const message = body.message?.trim();
  const requestedSessionId = body.sessionId?.trim();

  if (!message) {
    return withMetrics(
      request,
      jsonApiError(request, {
        code: "invalid_message",
        message: CHAT_ERROR_MESSAGE,
        status: 400
      }),
      stopTimer
    );
  }

  try {
    const chatSession =
      requestedSessionId
        ? (await getChatSessionForUser(session.userId, requestedSessionId)) ??
          (await getOrCreateChatSession(session.userId))
        : await getOrCreateChatSession(session.userId);
    const recentMessages = await listRecentChatMessages(session.userId, chatSession.id);
    const latestStoredUserMessage = [...recentMessages].reverse().find(
      (entry) => entry.role === "user"
    );
    const latestStoredAssistantMessage = [...recentMessages].reverse().find(
      (entry) => entry.role === "assistant"
    );

    if (
      latestStoredUserMessage &&
      latestStoredAssistantMessage &&
      latestStoredUserMessage.created_at < latestStoredAssistantMessage.created_at &&
      latestStoredUserMessage.content.trim().toLowerCase() === message.toLowerCase()
    ) {
      return withMetrics(
        request,
        jsonApiResponse(request, {
          assistantMessage: latestStoredAssistantMessage,
          userMessage: latestStoredUserMessage
        }),
        stopTimer
      );
    }

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

    return withMetrics(
      request,
      jsonApiResponse(request, {
        assistantMessage,
        userMessage
      }),
      stopTimer
    );
  } catch (error) {
    return withMetrics(request, handleApiError(request, error, CHAT_ERROR_MESSAGE), stopTimer);
  }
}
