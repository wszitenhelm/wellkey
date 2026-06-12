import { z } from "zod";

import { normalizeLoginCode } from "@/lib/auth/codes";

const loginCodeSchema = z
  .string()
  .trim()
  .min(6, "Login code must be at least 6 characters.")
  .max(64, "Login code is too long.")
  .transform(normalizeLoginCode)
  .refine((value) => /^[a-z0-9-]+$/.test(value), {
    message: "Use lowercase letters, numbers, and dashes only."
  });

export const signupSchema = z.object({
  loginCode: loginCodeSchema,
  organizationCode: z.string().trim().max(32, "Organization code is too long.").optional(),
  organizationSlug: z.string().trim().max(120, "Organization slug is too long.").optional(),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters.")
    .max(128, "Password is too long.")
});

export const loginSchema = z.object({
  loginCode: loginCodeSchema,
  organizationCode: z.string().trim().max(32, "Organization code is too long.").optional(),
  organizationSlug: z.string().trim().max(120, "Organization slug is too long.").optional(),
  password: z.string().min(1, "Enter your password.")
});

export const organizationSignupSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Enter your company name.")
    .max(160, "Company name is too long."),
  email: z.email("Enter a valid work email.").transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters.")
    .max(128, "Password is too long.")
});

export const organizationLoginSchema = z.object({
  email: z.email("Enter a valid work email.").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, "Enter your password.")
});

export const habitSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Habit title must be at least 3 characters.")
    .max(80, "Habit title is too long.")
});

export const reminderNoteSchema = z.object({
  kind: z.enum([
    "gratitude",
    "self_kindness",
    "small_win",
    "something_i_handled",
    "what_i_need_today"
  ]),
  content: z
    .string()
    .trim()
    .min(3, "Write a little more so the note feels meaningful.")
    .max(180, "Keep the note under 180 characters.")
});

const scoreSchema = z.coerce.number().int().min(1, "Choose a score.").max(5, "Choose a score.");

export const quickCheckInSchema = z.object({
  quick_energy_level: scoreSchema,
  quick_stress_level: scoreSchema,
  quick_switch_off_level: scoreSchema,
  quick_biggest_factor: z.enum([
    "workload",
    "meetings",
    "sleep",
    "unclear_priorities",
    "interactions_with_others",
    "something_else"
  ])
});

export const regularCheckInSchema = z.object({
  regular_q1_drained: scoreSchema,
  regular_q3_switch_off_hard: scoreSchema,
  regular_q5_focus_trouble: scoreSchema,
  regular_q6_emotional_strain: scoreSchema,
  regular_q7_recovery_good: scoreSchema,
  regular_q8_workload_manageable: scoreSchema,
  regular_q9_supported: scoreSchema,
  regular_q10_priorities_clear: scoreSchema
});
