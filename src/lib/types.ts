import type {
  RegistrationStatus,
  Role,
  TournamentStatus,
} from "./constants";

export type ScheduleItem = {
  title: string;
  at: string;
  detail?: string;
};

export type PrizeItem = {
  place: string;
  amount: number;
  note?: string;
};

export type Tournament = {
  id: string;
  slug: string;
  title: string;
  game: string;
  status: TournamentStatus;
  featured: boolean;
  bannerUrl: string;
  tagline: string;
  description: string;
  prizePool: number;
  currency: string;
  entryFee: number;
  teamSize: number;
  maxSlots: number;
  format: string;
  region: string;
  platform: string;
  registrationDeadline: string;
  startAt: string;
  endAt: string;
  schedule: ScheduleItem[];
  rules: string[];
  prizeBreakdown: PrizeItem[];
  eligibility: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
};

export type TournamentWithCounts = Tournament & {
  registeredTeams: number;
};

export type Registration = {
  id: string;
  reference: string;
  tournamentId: string;
  teamName: string;
  whatsapp: string;
  contactName: string;
  email: string;
  status: RegistrationStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type RegistrationWithTournament = Registration & {
  tournamentTitle: string;
  tournamentSlug: string;
  game: string;
  entryFee: number;
  prizePool: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type TournamentPhase =
  | "draft"
  | "live"
  | "upcoming"
  | "completed"
  | "cancelled";

export type RegistrationWindow = "open" | "closed" | "full" | "unavailable";

export type ActionResult = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  reference?: string;
};
