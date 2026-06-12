import { starterHabits } from "@/lib/content/habits";
import { todayIsoDate } from "@/lib/habits/dates";
import { buildHabitProgress } from "@/lib/habits/progress";
import { slugifyHabitTitle } from "@/lib/habits/slugs";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { HabitCompletionRecord, HabitRecord, HabitWithProgress } from "@/lib/types";

async function listHabitCompletions(userId: string) {
  const supabase = getSupabaseAdmin();
  return (
    unwrapSupabaseData(
      await supabase
        .from("habit_completions")
        .select("id, habit_id, user_id, completed_on, created_at")
        .eq("user_id", userId)
        .order("completed_on", { ascending: false })
    ) as HabitCompletionRecord[] | null
  ) ?? [];
}

export async function ensureStarterHabits(userId: string) {
  const supabase = getSupabaseAdmin();

  for (const [index, habit] of starterHabits.entries()) {
    unwrapSupabaseData(
      await supabase
        .from("habits")
        .upsert(
          {
            description: habit.description,
            is_default: true,
            order_index: index,
            slug: habit.slug,
            title: habit.title,
            user_id: userId
          },
          { ignoreDuplicates: true, onConflict: "user_id,slug" }
        )
    );
  }
}

async function getNextHabitOrderIndex(userId: string) {
  const supabase = getSupabaseAdmin();
  const rows =
    (unwrapSupabaseData(
      await supabase
        .from("habits")
        .select("order_index")
        .eq("user_id", userId)
        .is("archived_at", null)
        .order("order_index", { ascending: false })
        .limit(1)
    ) as Array<Pick<HabitRecord, "order_index">> | null) ?? [];

  return rows[0] ? rows[0].order_index + 1 : 0;
}

export async function listHabitsWithProgress(userId: string): Promise<HabitWithProgress[]> {
  await ensureStarterHabits(userId);
  const supabase = getSupabaseAdmin();
  const today = todayIsoDate();
  const habits =
    (unwrapSupabaseData(
      await supabase
        .from("habits")
        .select("id, user_id, slug, title, description, is_default, order_index, created_at, archived_at")
        .eq("user_id", userId)
        .is("archived_at", null)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true })
    ) as HabitRecord[] | null) ?? [];
  const completions = await listHabitCompletions(userId);

  return buildHabitProgress(habits, completions, today);
}

export async function createHabit(userId: string, title: string) {
  const supabase = getSupabaseAdmin();
  const baseSlug = slugifyHabitTitle(title) || "habit";
  const nextOrderIndex = await getNextHabitOrderIndex(userId);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const habits = unwrapSupabaseData(
      await supabase
        .from("habits")
        .upsert(
          {
            description: "",
            is_default: false,
            order_index: nextOrderIndex,
            slug,
            title: title.trim(),
            user_id: userId
          },
          { ignoreDuplicates: true, onConflict: "user_id,slug" }
        )
        .select("id, user_id, slug, title, description, is_default, order_index, created_at, archived_at")
    ) as HabitRecord[] | null;

    if (habits?.[0]) {
      return habits[0];
    }
  }

  throw new Error("HABIT_CREATE_FAILED");
}

export async function completeHabitForToday(userId: string, habitId: string) {
  const supabase = getSupabaseAdmin();
  const today = todayIsoDate();
  const habit = unwrapSupabaseData(
    await supabase
      .from("habits")
      .select("id")
      .eq("id", habitId)
      .eq("user_id", userId)
      .is("archived_at", null)
      .maybeSingle()
  );

  if (!habit) {
    return;
  }

  unwrapSupabaseData(
    await supabase
      .from("habit_completions")
      .upsert(
        {
          completed_on: today,
          habit_id: habitId,
          user_id: userId
        },
        { ignoreDuplicates: true, onConflict: "habit_id,completed_on" }
      )
  );
}

export async function reorderHabits(userId: string, orderedHabitIds: string[]) {
  const supabase = getSupabaseAdmin();

  for (const [index, habitId] of orderedHabitIds.entries()) {
    unwrapSupabaseData(
      await supabase
        .from("habits")
        .update({ order_index: index })
        .eq("id", habitId)
        .eq("user_id", userId)
        .is("archived_at", null)
    );
  }
}

export async function archiveHabit(userId: string, habitId: string) {
  const supabase = getSupabaseAdmin();
  unwrapSupabaseData(
    await supabase
      .from("habits")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", habitId)
      .eq("user_id", userId)
      .is("archived_at", null)
  );
}
