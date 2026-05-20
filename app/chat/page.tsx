export const dynamic = "force-dynamic";

import { AppScreen } from "@/components/app/app-screen";
import { ChatScreen } from "@/components/chat/chat-screen";
import { requireSession } from "@/lib/auth/guards";
import { getLatestChatView } from "@/lib/db/chat";

export default async function ChatPage() {
  const session = await requireSession();
  const chatView = await getLatestChatView(session.userId);

  return (
    <AppScreen currentPath="/chat">
      <ChatScreen initialMessages={chatView.messages} />
    </AppScreen>
  );
}
