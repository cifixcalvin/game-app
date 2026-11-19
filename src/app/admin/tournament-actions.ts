"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth";
import { can } from "@/lib/authz";
import { TOURNAMENT_STATUSES, type TournamentStatus } from "@/lib/constants";
import {
  createTournament,
  deleteTournament,
  getTournamentById,
  updateTournament,
  updateTournamentStatus,
} from "@/lib/tournaments";
import {
  formBoolean,
  formatZodErrors,
  parseJsonField,
  splitLines,
  tournamentFormSchema,
} from "@/lib/validation";
import { fromDateTimeLocalIST, slugify } from "@/lib/utils";
import type { PrizeItem, ScheduleItem } from "@/lib/types";

export type TournamentFormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function safeReturn(value: FormDataEntryValue | null, fallback: string) {
  if (
    typeof value === "string" &&
    value.startsWith("/admin") &&
    !value.startsWith("//")
  ) {
    return value;
  }
  return fallback;
}

export async function saveTournamentAction(
  _prevState: TournamentFormState,
  formData: FormData,
): Promise<TournamentFormState> {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const id = asString(formData.get("id")).trim();
  const existing = id ? await getTournamentById(id) : null;
  if (id && !existing) {
    return { ok: false, message: "That tournament no longer exists." };
  }

  const requiredPermission = id ? "tournament:edit" : "tournament:create";
  if (!can(user.role, requiredPermission)) {
    return { ok: false, message: "You do not have permission to do that." };
  }

  const title = asString(formData.get("title")).trim();
  const rawSlug = asString(formData.get("slug")).trim();
  const schedule = parseJsonField<ScheduleItem[]>(formData.get("schedule"), []);
  const prizeBreakdown = parseJsonField<PrizeItem[]>(
    formData.get("prizeBreakdown"),
    [],
  );

  const parsed = tournamentFormSchema.safeParse({
    title,
    slug: rawSlug || slugify(title),
    game: asString(formData.get("game")),
    status: asString(formData.get("status")),
    tagline: asString(formData.get("tagline")),
    description: asString(formData.get("description")),
    bannerUrl: asString(formData.get("bannerUrl")),
    prizePool: asString(formData.get("prizePool")) || "0",
    currency: asString(formData.get("currency")) || "INR",
    entryFee: asString(formData.get("entryFee")) || "0",
    teamSize: asString(formData.get("teamSize")) || "1",
    maxSlots: asString(formData.get("maxSlots")) || "16",
    format: asString(formData.get("format")),
    region: asString(formData.get("region")),
    platform: asString(formData.get("platform")),
    registrationDeadline: fromDateTimeLocalIST(
      asString(formData.get("registrationDeadline")),
    ),
    startAt: fromDateTimeLocalIST(asString(formData.get("startAt"))),
    endAt: fromDateTimeLocalIST(asString(formData.get("endAt"))),
    schedule,
    rules: splitLines(formData.get("rules")),
    prizeBreakdown,
    eligibility: splitLines(formData.get("eligibility")),
    contactName: asString(formData.get("contactName")),
    contactEmail: asString(formData.get("contactEmail")),
    contactPhone: asString(formData.get("contactPhone")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the highlighted fields before saving.",
      errors: formatZodErrors(parsed.error),
    };
  }

  const input = {
    ...parsed.data,
    featured: formBoolean(formData.get("featured")),
  };

  const existingStatus = existing?.status;
  const statusChanged = input.status !== existingStatus;
  if (
    statusChanged &&
    input.status !== "draft" &&
    !can(user.role, "tournament:publish")
  ) {
    return {
      ok: false,
      message: "Only admins can publish or change the live status.",
      errors: { status: ["You cannot publish this event"] },
    };
  }

  let savedId = id;
  try {
    const result = id
      ? await updateTournament(id, input, user.id)
      : await createTournament(input, user.id);

    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
        errors: { slug: [result.message] },
      };
    }
    savedId = result.id;

    revalidatePath("/");
    revalidatePath("/tournaments");
    revalidatePath(`/tournaments/${input.slug}`);
    revalidatePath("/admin");
    revalidatePath("/admin/tournaments");
    revalidatePath(`/admin/tournaments/${result.id}`);
  } catch (error) {
    console.error("[save-tournament]", error);
    return {
      ok: false,
      message: "Could not save the tournament. Please try again.",
    };
  }

  redirect(`/admin/tournaments/${savedId}?saved=1`);
}

export async function deleteTournamentAction(formData: FormData) {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");
  if (!can(user.role, "tournament:delete")) {
    redirect("/admin/tournaments?error=forbidden");
  }

  const id = asString(formData.get("id"));
  if (id) {
    await deleteTournament(id);
    revalidatePath("/");
    revalidatePath("/tournaments");
    revalidatePath("/admin");
    revalidatePath("/admin/tournaments");
  }
  redirect(safeReturn(formData.get("returnTo"), "/admin/tournaments?deleted=1"));
}

export async function setTournamentStatusAction(formData: FormData) {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const id = asString(formData.get("id"));
  const rawStatus = asString(formData.get("status"));
  const status = (TOURNAMENT_STATUSES as readonly string[]).includes(rawStatus)
    ? (rawStatus as TournamentStatus)
    : null;

  const returnTo = safeReturn(formData.get("returnTo"), "/admin/tournaments");

  if (!id || !status) redirect(returnTo);

  const permission =
    status === "draft" ? "tournament:edit" : "tournament:publish";
  if (!can(user.role, permission)) {
    redirect(`${returnTo}?error=forbidden`);
  }

  await updateTournamentStatus(id, status);
  revalidatePath("/");
  revalidatePath("/tournaments");
  revalidatePath("/admin");
  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${id}`);
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}updated=${status}`);
}
