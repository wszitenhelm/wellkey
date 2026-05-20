"use client";

import { useState, useTransition } from "react";
import {
  completeHabitAction,
  deleteHabitAction,
  reorderHabitsAction
} from "@/lib/actions/habit-actions";
import { reorderItemsById } from "@/lib/habits/reorder";
import type { HabitReflection, HabitWithProgress } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { HabitCard } from "@/components/habits/habit-card";

type HabitManagerProps = {
  habits: HabitWithProgress[];
};

const recommendedSlugs = new Set(["take-a-10-minute-reset", "breathing-pause"]);

export function HabitManager({ habits }: HabitManagerProps) {
  const [items, setItems] = useState(habits);
  const [editing, setEditing] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [reflections, setReflections] = useState<Record<string, HabitReflection>>({});
  const [, startTransition] = useTransition();

  function handleComplete(habitId: string) {
    setItems((current) =>
      current.map((habit) =>
        habit.id === habitId
          ? { ...habit, completedToday: true, streakCount: habit.streakCount + 1 }
          : habit
      )
    );

    startTransition(async () => {
      const formData = new FormData();
      formData.set("habitId", habitId);
      await completeHabitAction(formData);
    });
  }

  function handleDelete(habitId: string) {
    setItems((current) => current.filter((habit) => habit.id !== habitId));
    startTransition(async () => {
      const formData = new FormData();
      formData.set("habitId", habitId);
      await deleteHabitAction(formData);
    });
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }

    const nextItems = reorderItemsById(items, draggingId, targetId);
    setItems(nextItems);
    setDraggingId(null);
    startTransition(async () => {
      await reorderHabitsAction(nextItems.map((item) => item.id));
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl leading-tight">Small steps for today</h1>
        <p className="text-sm leading-6 text-muted">
          These are gentle habits. Choose what feels possible.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setEditing((value) => !value)} type="button" variant="ghost">
          {editing ? "Done" : "Edit habits"}
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((habit) => (
          <div
            key={habit.id}
            draggable={editing}
            onDragOver={(event) => {
              if (!editing) return;
              event.preventDefault();
            }}
            onDragStart={() => setDraggingId(habit.id)}
            onDrop={() => handleDrop(habit.id)}
          >
            <HabitCard
              editing={editing}
              habit={habit}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onReflect={(habitId, value) =>
                setReflections((current) => ({ ...current, [habitId]: value }))
              }
              recommended={recommendedSlugs.has(habit.slug)}
              reflection={reflections[habit.id]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
