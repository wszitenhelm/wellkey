export const dynamic = "force-dynamic";

import { AppScreen } from "@/components/app/app-screen";
import { AddHabitForm } from "@/components/habits/add-habit-form";
import { HabitManager } from "@/components/habits/habit-manager";
import { SoftCard } from "@/components/ui/soft-card";
import { requireSession } from "@/lib/auth/guards";
import { listHabitsWithProgress } from "@/lib/db/habits";

export default async function HabitsPage() {
  const session = await requireSession();
  const habits = await listHabitsWithProgress(session.userId);

  return (
    <AppScreen currentPath="/habits">
      <HabitManager habits={habits} />

      <SoftCard className="p-5">
        <AddHabitForm />
      </SoftCard>
    </AppScreen>
  );
}
