import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { RegistrationStatus, TournamentStatus } from "./constants";
import type {
  RegistrationWindow,
  TournamentPhase,
  TournamentWithCounts,
} from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number, currency = "INR") {
  if (currency !== "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return inr.format(amount);
}

export function formatCurrencyShort(amount: number) {
  if (amount >= 10000000) {
    return `₹${trimDecimal(amount / 10000000)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${trimDecimal(amount / 100000)}L`;
  }
  if (amount >= 1000) {
    return `₹${trimDecimal(amount / 1000)}K`;
  }
  return `₹${amount}`;
}

function trimDecimal(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function asDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(value: string | Date, withYear = true) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: withYear ? "numeric" : undefined,
    timeZone: "Asia/Kolkata",
  }).format(asDate(value));
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(asDate(value));
}

export function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(asDate(value));
}

export function formatDateRange(start: string, end: string) {
  const startDate = asDate(start);
  const endDate = asDate(end);
  const sameDay =
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
      startDate,
    ) ===
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
      endDate,
    );
  return sameDay
    ? `${formatDate(start)} · ${formatTime(start)} – ${formatTime(end)}`
    : `${formatDate(start)} – ${formatDate(end)}`;
}

export function formatRelative(value: string | Date) {
  const diff = asDate(value).getTime() - Date.now();
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  const label =
    minutes < 60
      ? `${Math.max(minutes, 1)}m`
      : hours < 24
        ? `${hours}h`
        : `${days}d`;
  return diff >= 0 ? `in ${label}` : `${label} ago`;
}

export function toDateTimeLocalIST(value: string | Date) {
  const date = asDate(value);
  const ist = new Date(date.getTime() + 330 * 60000);
  return ist.toISOString().slice(0, 16);
}

export function fromDateTimeLocalIST(value: string) {
  if (!value) return new Date().toISOString();
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  const parsed = new Date(`${withSeconds}+05:30`);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function getTournamentPhase(
  tournament: Pick<TournamentWithCounts, "status" | "startAt" | "endAt">,
  now = Date.now(),
): TournamentPhase {
  if (tournament.status === "draft") return "draft";
  if (tournament.status === "cancelled") return "cancelled";

  const start = asDate(tournament.startAt).getTime();
  const end = asDate(tournament.endAt).getTime();

  if (tournament.status === "completed" || end <= now) return "completed";
  if (tournament.status === "live" || (start <= now && now < end)) return "live";
  return "upcoming";
}

export function getRegistrationWindow(
  tournament: TournamentWithCounts,
  now = Date.now(),
): RegistrationWindow {
  const phase = getTournamentPhase(tournament, now);
  if (phase !== "upcoming") {
    return phase === "draft" ? "unavailable" : "closed";
  }
  if (tournament.registeredTeams >= tournament.maxSlots) return "full";
  if (asDate(tournament.registrationDeadline).getTime() <= now) return "closed";
  return "open";
}

export const PHASE_LABELS: Record<TournamentPhase, string> = {
  draft: "Draft",
  live: "Live now",
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function displayStatus(
  phase: TournamentPhase,
  window: RegistrationWindow,
) {
  if (phase === "upcoming" && window === "open") return "Registration open";
  if (phase === "upcoming" && window === "closed") return "Registration closed";
  if (phase === "upcoming" && window === "full") return "Slots full";
  return PHASE_LABELS[phase];
}

export function phaseStyle(phase: TournamentPhase) {
  switch (phase) {
    case "live":
      return "border-[#b6ff2e]/60 bg-[#b6ff2e] text-black";
    case "upcoming":
      return "border-[#b6ff2e]/30 bg-[#b6ff2e]/10 text-[#d7ff8a]";
    case "completed":
      return "border-white/10 bg-white/5 text-white/55";
    case "cancelled":
      return "border-red-400/30 bg-red-500/10 text-red-300";
    default:
      return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }
}

export function tournamentStatusStyle(status: TournamentStatus) {
  switch (status) {
    case "live":
      return "border-[#b6ff2e]/50 bg-[#b6ff2e]/15 text-[#d7ff8a]";
    case "published":
      return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
    case "completed":
      return "border-white/10 bg-white/5 text-white/50";
    case "cancelled":
      return "border-red-400/30 bg-red-500/10 text-red-300";
    default:
      return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  }
}

export function registrationStatusStyle(status: RegistrationStatus) {
  switch (status) {
    case "confirmed":
      return "border-[#b6ff2e]/40 bg-[#b6ff2e]/10 text-[#d7ff8a]";
    case "checked_in":
      return "border-sky-400/30 bg-sky-400/10 text-sky-300";
    case "waitlisted":
      return "border-amber-400/30 bg-amber-400/10 text-amber-200";
    case "rejected":
      return "border-red-400/30 bg-red-500/10 text-red-300";
    default:
      return "border-white/10 bg-white/5 text-white/60";
  }
}

export function initials(value: string) {
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}

export function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildQuery(
  base: Record<string, string | number | undefined>,
  updates: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...base, ...updates })) {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function ensureHttpUrl(value: string) {
  if (value.startsWith("/")) return value;
  if (/^https?:\/\//.test(value)) return value;
  return null;
}
