export const SITE = {
  name: "Nexus Arena",
  legalName: "Nexus Arena Esports Pvt. Ltd.",
  tagline: "Competitive gaming, reimagined.",
  description:
    "Nexus Arena is a premium esports tournament platform hosting elite competition across Valorant, BGMI, PUBG, CS2, Free Fire, and more.",
  email: "hello@nexusarena.gg",
  supportEmail: "support@nexusarena.gg",
  phone: "+91 98765 43210",
  address: "Indiranagar, Bengaluru, Karnataka 560038",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  socials: {
    discord: "https://discord.gg/nexusarena",
    x: "https://x.com/nexusarena",
    instagram: "https://instagram.com/nexusarena",
    youtube: "https://youtube.com/@nexusarena",
  },
} as const;

export const GAMES = [
  {
    id: "valorant",
    name: "Valorant",
    short: "VAL",
    color: "#ff4d5e",
    tint: "rgba(255, 77, 94, 0.16)",
    genre: "Tactical FPS",
  },
  {
    id: "bgmi",
    name: "BGMI",
    short: "BGMI",
    color: "#ffc53d",
    tint: "rgba(255, 197, 61, 0.15)",
    genre: "Battle Royale",
  },
  {
    id: "pubg",
    name: "PUBG Mobile",
    short: "PUBG",
    color: "#f5a623",
    tint: "rgba(245, 166, 35, 0.15)",
    genre: "Battle Royale",
  },
  {
    id: "cs2",
    name: "Counter-Strike 2",
    short: "CS2",
    color: "#55a7ff",
    tint: "rgba(85, 167, 255, 0.15)",
    genre: "Tactical FPS",
  },
  {
    id: "free-fire",
    name: "Free Fire",
    short: "FF",
    color: "#ff7a1a",
    tint: "rgba(255, 122, 26, 0.15)",
    genre: "Battle Royale",
  },
  {
    id: "cod-mobile",
    name: "Call of Duty Mobile",
    short: "CODM",
    color: "#a4ff3d",
    tint: "rgba(164, 255, 61, 0.14)",
    genre: "Arena FPS",
  },
  {
    id: "apex",
    name: "Apex Legends",
    short: "APEX",
    color: "#e34850",
    tint: "rgba(227, 72, 80, 0.15)",
    genre: "Battle Royale",
  },
  {
    id: "fortnite",
    name: "Fortnite",
    short: "FN",
    color: "#9b7bff",
    tint: "rgba(155, 123, 255, 0.16)",
    genre: "Battle Royale",
  },
] as const;

export type GameId = (typeof GAMES)[number]["id"];

export function getGame(id: string) {
  return GAMES.find((game) => game.id === id) ?? GAMES[0];
}

export const TOURNAMENT_STATUSES = [
  "draft",
  "published",
  "live",
  "completed",
  "cancelled",
] as const;

export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const REGISTRATION_STATUSES = [
  "pending",
  "confirmed",
  "waitlisted",
  "rejected",
  "checked_in",
] as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const ROLES = ["super_admin", "admin", "editor"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
};

export const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
  draft: "Draft",
  published: "Published",
  live: "Live",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
  checked_in: "Checked in",
};

export const POPULAR_FORMATS = [
  "Single Elimination",
  "Double Elimination",
  "Round Robin",
  "Swiss",
  "Battle Royale Points",
  "Group Stage + Playoffs",
] as const;

export const PAGE_SIZE = 9;
