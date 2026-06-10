export const dynamic = "force-dynamic";

import { MobileAppShell } from "@/components/app/mobile-app-shell";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { requireSession } from "@/lib/auth/guards";
import { listReminderNotes } from "@/lib/db/reminder-notes";

export default async function DashboardPage() {
  const session = await requireSession();
  const reminderNotes = await listReminderNotes(session.userId);

  return (
    <MobileAppShell currentPath="/dashboard">
      <DashboardHome notes={reminderNotes} />
    </MobileAppShell>
  );
}
