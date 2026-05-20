export const dynamic = "force-dynamic";

import { MobileAppShell } from "@/components/app/mobile-app-shell";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { requireSession } from "@/lib/auth/guards";
import { listHabitsWithProgress } from "@/lib/db/habits";
import { listReminderNotes } from "@/lib/db/reminder-notes";

export default async function DashboardPage() {
  const session = await requireSession();
  const [reminderNotes, habits] = await Promise.all([
    listReminderNotes(session.userId),
    listHabitsWithProgress(session.userId)
  ]);

  return (
    <MobileAppShell currentPath="/dashboard">
      <DashboardHome habits={habits} notes={reminderNotes} />
    </MobileAppShell>
  );
}
