import { getDb } from "@/lib/db/client";
import { starterHabits } from "@/lib/content/habits";
import { todayIsoDate } from "@/lib/habits/dates";
import { buildHabitProgress } from "@/lib/habits/progress";
import { slugifyHabitTitle } from "@/lib/habits/slugs";
import type { HabitCompletionRecord, HabitRecord, HabitWithProgress } from "@/lib/types";

async function listHabitCompletions(userId: string) {
  const db = getDb();
  return db<HabitCompletionRecord[]>`
    select id, habit_id, user_id, completed_on::text, created_at
    from habit_completions
    where user_id = ${userId}
    order by completed_on desc
  `;
}

export async function ensureStarterHabits(userId: string) {
  const db = getDb();

  for (const [index, habit] of starterHabits.entries()) {
    await db`
      insert into habits (user_id, slug, title, description, is_default, order_index)
      values (${userId}, ${habit.slug}, ${habit.title}, ${habit.description}, true, ${index})
      on conflict (user_id, slug) do nothing
    `;
  }
}

async function getNextHabitOrderIndex(userId: string) {
  const db = getDb();
  const rows = await db<{ next_order_index: number }[]>`
    select coalesce(max(order_index), -1) + 1 as next_order_index
    from habits
    where user_id = ${userId}
      and archived_at is null
  `;

  return rows[0]?.next_order_index ?? 0;
}

export async function listHabitsWithProgress(userId: string): Promise<HabitWithProgress[]> {
  await ensureStarterHabits(userId);
  const db = getDb();
  const today = todayIsoDate();
  const habits = await db<HabitRecord[]>`
    select id, user_id, slug, title, description, is_default, order_index, created_at, archived_at
    from habits
    where user_id = ${userId}
      and archived_at is null
    order by order_index asc, created_at asc
  `;
  const completions = await listHabitCompletions(userId);

  return buildHabitProgress(habits, completions, today);
}

export async function createHabit(userId: string, title: string) {
  const db = getDb();
  const baseSlug = slugifyHabitTitle(title) || "habit";
  const nextOrderIndex = await getNextHabitOrderIndex(userId);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const habits = await db<HabitRecord[]>`
      insert into habits (user_id, slug, title, description, is_default, order_index)
      values (${userId}, ${slug}, ${title.trim()}, '', false, ${nextOrderIndex})
      on conflict (user_id, slug) do nothing
      returning id, user_id, slug, title, description, is_default, order_index, created_at, archived_at
    `;

    if (habits[0]) {
      return habits[0];
    }
  }

  throw new Error("HABIT_CREATE_FAILED");
}

export async function completeHabitForToday(userId: string, habitId: string) {
  const db = getDb();
  const today = todayIsoDate();

  await db`
    insert into habit_completions (habit_id, user_id, completed_on)
    select id, ${userId}, ${today}::date
    from habits
    where id = ${habitId}
      and user_id = ${userId}
      and archived_at is null
    on conflict (habit_id, completed_on) do nothing
  `;
}

export async function reorderHabits(userId: string, orderedHabitIds: string[]) {
  const db = getDb();

  await db.begin(async (sql) => {
    for (const [index, habitId] of orderedHabitIds.entries()) {
      await sql`
        update habits
        set order_index = ${index}
        where id = ${habitId}
          and user_id = ${userId}
          and archived_at is null
      `;
    }
  });
}

export async function archiveHabit(userId: string, habitId: string) {
  const db = getDb();
  await db`
    update habits
    set archived_at = timezone('utc', now())
    where id = ${habitId}
      and user_id = ${userId}
      and archived_at is null
  `;
}
