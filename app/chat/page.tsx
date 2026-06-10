export const dynamic = "force-dynamic";

import type { SearchParams } from "next/dist/server/request/search-params";
import { AppScreen } from "@/components/app/app-screen";
import { ChatScreen } from "@/components/chat/chat-screen";
import { requireSession } from "@/lib/auth/guards";
import { getLatestChatView } from "@/lib/db/chat";

type ChatPageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const session = await requireSession();
  const chatView = await getLatestChatView(session.userId);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialInput =
    typeof resolvedSearchParams?.draft === "string" ? resolvedSearchParams.draft : "";

  return (
    <AppScreen currentPath="/chat">
      <ChatScreen initialInput={initialInput} initialMessages={chatView.messages} />
    </AppScreen>
  );
}
