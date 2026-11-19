import { z } from "zod";

import {
  GAMES,
  REGISTRATION_STATUSES,
  ROLES,
  TOURNAMENT_STATUSES,
} from "./constants";

const gameIds = GAMES.map((game) => game.id) as [string, ...string[]];
const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

export const scheduleItemSchema = z.object({
  title: z.string().trim().min(2, "Schedule title is too short").max(90),
  at: isoDate,
  detail: z.string().trim().max(300).optional().default(""),
});

export const prizeItemSchema = z.object({
  place: z.string().trim().min(1, "Placement is required").max(60),
  amount: z.coerce.number().int().min(0).max(100000000),
  note: z.string().trim().max(160).optional().default(""),
});

export const tournamentFormSchema = z
  .object({
    title: z.string().trim().min(4, "Title needs at least 4 characters").max(90),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(70)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers and hyphens only",
      ),
    game: z.enum(gameIds, "Choose a supported game"),
    status: z.enum(TOURNAMENT_STATUSES),
    tagline: z.string().trim().min(8, "Add a short tagline").max(160),
    description: z.string().trim().min(30, "Description needs more detail").max(5000),
    bannerUrl: z
      .string()
      .trim()
      .min(1, "Banner is required")
      .max(500)
      .refine(
        (value) =>
          value.startsWith("/banners/") ||
          value.startsWith("/api/uploads/") ||
          /^https:\/\//.test(value),
        "Use an uploaded image or a supported banner path",
      ),
    prizePool: z.coerce.number().int().min(0).max(100000000),
    currency: z.string().trim().length(3, "Use a 3-letter currency code"),
    entryFee: z.coerce.number().int().min(0).max(100000),
    teamSize: z.coerce.number().int().min(1).max(10),
    maxSlots: z.coerce.number().int().min(2).max(2048),
    format: z.string().trim().min(2).max(60),
    region: z.string().trim().min(2).max(60),
    platform: z.string().trim().min(2).max(60),
    registrationDeadline: isoDate,
    startAt: isoDate,
    endAt: isoDate,
    schedule: z.array(scheduleItemSchema).min(1, "Add at least one schedule item").max(20),
    rules: z.array(z.string().trim().min(3).max(300)).min(1, "Add at least one rule").max(25),
    prizeBreakdown: z.array(prizeItemSchema).max(20),
    eligibility: z.array(z.string().trim().min(2).max(220)).min(1).max(15),
    contactName: z.string().trim().min(2).max(60),
    contactEmail: z.string().trim().email("Enter a valid email").max(120),
    contactPhone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number")
      .max(20),
  })
  .superRefine((data, ctx) => {
    const deadline = Date.parse(data.registrationDeadline);
    const start = Date.parse(data.startAt);
    const end = Date.parse(data.endAt);
    if (end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "End time must be after the start time",
      });
    }
    if (deadline > start) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationDeadline"],
        message: "Registration must close before the tournament starts",
      });
    }
    if (data.maxSlots < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["maxSlots"],
        message: "Allow at least two teams",
      });
    }
  });

export const registrationFormSchema = z.object({
  tournamentId: z.string().trim().min(1),
  token: z.string().trim().min(10, "Form token is missing"),
  teamName: z
    .string()
    .trim()
    .min(2, "Team name is too short")
    .max(40, "Team name is too long")
    .regex(
      /^[a-zA-Z0-9 .'&_-]+$/,
      "Use letters, numbers, spaces and basic punctuation only",
    ),
  contactName: z.string().trim().min(2, "Enter the captain's name").max(60),
  email: z
    .string()
    .trim()
    .max(120)
    .transform((value) => value.toLowerCase())
    .pipe(z.email("Enter a valid email address")),
  whatsapp: z
    .string()
    .trim()
    .min(10, "Enter a valid WhatsApp number")
    .max(20),
  website: z.string().max(0).optional().or(z.literal("")),
  acceptRules: z
    .string()
    .refine((value) => value === "on", "Accept the tournament rules to continue"),
});

export const loginSchema = z.object({
  email: z.string().trim().max(120).pipe(z.email("Enter a valid email")),
  password: z.string().min(1, "Enter your password").max(200),
});

export const adminCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    email: z.string().trim().max(120).pipe(z.email("Enter a valid email")),
    role: z.enum(ROLES),
    password: z
      .string()
      .min(10, "Use at least 10 characters")
      .max(100)
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(200),
    newPassword: z
      .string()
      .min(10, "Use at least 10 characters")
      .max(100)
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const registrationUpdateSchema = z.object({
  status: z.enum(REGISTRATION_STATUSES),
  notes: z.string().trim().max(1000).optional().default(""),
});

export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .max(160)
    .transform((value) => value.toLowerCase())
    .pipe(z.email("Enter a valid email")),
  source: z.string().trim().max(60).optional().default("footer"),
});

export function formatZodErrors(error: z.ZodError) {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    errors[key] = [...(errors[key] ?? []), issue.message];
  }
  return errors;
}

export function formBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

export function splitLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
