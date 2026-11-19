"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarPlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

import {
  saveTournamentAction,
  type TournamentFormState,
} from "@/app/admin/tournament-actions";
import { GAMES, POPULAR_FORMATS, getGame } from "@/lib/constants";
import type { PrizeItem, ScheduleItem, TournamentWithCounts } from "@/lib/types";
import {
  cn,
  fromDateTimeLocalIST,
  slugify,
  toDateTimeLocalIST,
} from "@/lib/utils";

const initialState: TournamentFormState = { ok: false };

const DEFAULT_RULES = [
  "All players must use their registered in-game ID for the entire event.",
  "Rosters lock 24 hours before the first match. Substitutes must be declared at check-in.",
  "Toxic conduct, harassment, or hate speech results in immediate disqualification.",
  "Cheating, scripting, or unauthorised third-party software leads to a permanent ban.",
].join("\n");

const DEFAULT_ELIGIBILITY = [
  "Open to residents of India aged 16 and above.",
  "A valid government-issued ID is required for prize verification.",
  "One player may only compete for one team in the same tournament.",
].join("\n");

type ScheduleRow = ScheduleItem & { key: string };
type PrizeRow = PrizeItem & { key: string };

function makeKey() {
  return Math.random().toString(36).slice(2, 10);
}

export function TournamentForm({
  tournament,
  canPublish,
  canDelete,
  defaultTimes,
  defaultContact,
}: {
  tournament: TournamentWithCounts | null;
  canPublish: boolean;
  canDelete: boolean;
  defaultTimes: { registrationDeadline: string; startAt: string; endAt: string };
  defaultContact: { name: string; email: string };
}) {
  const [state, formAction, pending] = useActionState(
    saveTournamentAction,
    initialState,
  );

  const [title, setTitle] = useState(tournament?.title ?? "");
  const [slug, setSlug] = useState(tournament?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(tournament));
  const [game, setGame] = useState(tournament?.game ?? "valorant");
  const [banner, setBanner] = useState(
    tournament?.bannerUrl ?? "/banners/valorant.svg",
  );
  const [schedule, setSchedule] = useState<ScheduleRow[]>(() => {
    if (tournament?.schedule.length) {
      return [...tournament.schedule]
        .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
        .map((item) => ({
          ...item,
          at: toDateTimeLocalIST(item.at),
          key: makeKey(),
        }));
    }
    return [
      {
        key: makeKey(),
        title: "Registration closes",
        at: defaultTimes.registrationDeadline,
        detail: "Final roster verification for all submitted teams.",
      },
    ];
  });
  const [prizes, setPrizes] = useState<PrizeRow[]>(() =>
    (tournament?.prizeBreakdown ?? []).map((item) => ({
      ...item,
      key: makeKey(),
    })),
  );

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function updateGame(value: string) {
    setGame(value);
    if (!banner || banner.startsWith("/banners/")) {
      setBanner(`/banners/${value}.svg`);
    }
  }

  const scheduleJson = JSON.stringify(
    schedule.map(({ title: itemTitle, at, detail }) => ({
      title: itemTitle,
      at: fromDateTimeLocalIST(at),
      detail: detail ?? "",
    })),
  );
  const prizeJson = JSON.stringify(
    prizes.map(({ place, amount, note }) => ({
      place,
      amount: Number(amount) || 0,
      note: note ?? "",
    })),
  );

  const gameInfo = getGame(game);

  return (
    <form action={formAction} className="mx-auto max-w-[1280px] pb-16">
      {tournament ? <input type="hidden" name="id" value={tournament.id} /> : null}
      <input type="hidden" name="bannerUrl" value={banner} />
      <input type="hidden" name="schedule" value={scheduleJson} />
      <input type="hidden" name="prizeBreakdown" value={prizeJson} />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/admin/tournaments"
            className="mono inline-flex items-center gap-1.5 text-[8px] tracking-[0.14em] text-white/25 uppercase hover:text-white/60"
          >
            <ArrowLeft className="h-3 w-3" />
            All tournaments
          </Link>
          <h1 className="display mt-2 text-[30px] font-semibold tracking-tight text-white sm:text-[36px]">
            {tournament ? "Edit tournament" : "New tournament"}
          </h1>
          <p className="mt-1 text-[12px] text-white/35">
            {tournament
              ? `Editing /${tournament.slug}`
              : "Set the stage, lock the details, and publish when ready."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tournament ? (
            <Link
              href={`/tournaments/${tournament.slug}`}
              target="_blank"
              className="btn-secondary h-10 px-4 text-[9px]"
            >
              Live view <ArrowUpRight className="h-3 w-3" />
            </Link>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="btn-primary h-10 px-5 text-[9px]"
          >
            {pending ? (
              <>
                Saving <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                {tournament ? "Save changes" : "Create tournament"}
              </>
            )}
          </button>
        </div>
      </div>

      {state.message ? (
        <div
          className={cn(
            "mt-5 rounded-lg border px-4 py-3 text-[12px]",
            state.ok
              ? "border-[#b6ff2e]/25 bg-[#b6ff2e]/[0.06] text-[#d7ff8a]"
              : "border-red-400/25 bg-red-500/10 text-red-200",
          )}
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="space-y-5">
          <Section number="01" title="Event identity">
            <div className="grid gap-4">
              <Field label="Tournament title" error={state.errors?.title?.[0]}>
                <input
                  name="title"
                  value={title}
                  onChange={(event) => updateTitle(event.target.value)}
                  required
                  maxLength={90}
                  placeholder="e.g. Valorant Ascension"
                  className="field-lg"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="URL slug"
                  error={state.errors?.slug?.[0]}
                  hint={`nexusarena.gg/tournaments/${slug || "your-event"}`}
                >
                  <input
                    name="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlug(event.target.value);
                      setSlugTouched(true);
                    }}
                    required
                    maxLength={70}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    placeholder="valorant-ascension"
                    className="field-lg font-mono text-[12px]"
                  />
                </Field>
                <Field label="Game" error={state.errors?.game?.[0]}>
                  <select
                    name="game"
                    value={game}
                    onChange={(event) => updateGame(event.target.value)}
                    className="field-lg"
                  >
                    {GAMES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Tagline" error={state.errors?.tagline?.[0]}>
                <input
                  name="tagline"
                  defaultValue={tournament?.tagline ?? ""}
                  required
                  maxLength={160}
                  placeholder="One line that sells the stakes."
                  className="field-lg"
                />
              </Field>

              <Field
                label="Description"
                error={state.errors?.description?.[0]}
                hint="What makes this event worth showing up for?"
              >
                <textarea
                  name="description"
                  defaultValue={tournament?.description ?? ""}
                  required
                  rows={6}
                  maxLength={5000}
                  placeholder="Describe the format, the stakes, and the story of this bracket…"
                  className="field resize-y"
                />
              </Field>
            </div>
          </Section>

          <Section number="02" title="Format & capacity">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prize pool (INR)" error={state.errors?.prizePool?.[0]}>
                <input
                  name="prizePool"
                  type="number"
                  min={0}
                  step={1000}
                  defaultValue={tournament?.prizePool ?? 50000}
                  required
                  className="field-lg"
                />
              </Field>
              <Field label="Entry fee (INR)" error={state.errors?.entryFee?.[0]}>
                <input
                  name="entryFee"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={tournament?.entryFee ?? 0}
                  required
                  className="field-lg"
                />
              </Field>
              <Field label="Team size" error={state.errors?.teamSize?.[0]}>
                <input
                  name="teamSize"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={tournament?.teamSize ?? 5}
                  required
                  className="field-lg"
                />
              </Field>
              <Field label="Max slots" error={state.errors?.maxSlots?.[0]}>
                <input
                  name="maxSlots"
                  type="number"
                  min={2}
                  max={2048}
                  defaultValue={tournament?.maxSlots ?? 16}
                  required
                  className="field-lg"
                />
              </Field>
              <Field label="Format" error={state.errors?.format?.[0]}>
                <input
                  name="format"
                  list="format-options"
                  defaultValue={tournament?.format ?? "Single Elimination"}
                  required
                  className="field-lg"
                />
                <datalist id="format-options">
                  {POPULAR_FORMATS.map((format) => (
                    <option key={format} value={format} />
                  ))}
                </datalist>
              </Field>
              <Field label="Currency" error={state.errors?.currency?.[0]}>
                <input
                  name="currency"
                  defaultValue={tournament?.currency ?? "INR"}
                  maxLength={3}
                  className="field-lg font-mono uppercase"
                />
              </Field>
              <Field label="Region" error={state.errors?.region?.[0]}>
                <input
                  name="region"
                  defaultValue={tournament?.region ?? "India"}
                  required
                  className="field-lg"
                />
              </Field>
              <Field label="Platform" error={state.errors?.platform?.[0]}>
                <input
                  name="platform"
                  defaultValue={tournament?.platform ?? "Cross-platform"}
                  required
                  className="field-lg"
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field
                label="Registration closes"
                error={state.errors?.registrationDeadline?.[0]}
              >
                <input
                  name="registrationDeadline"
                  type="datetime-local"
                  defaultValue={
                    tournament
                      ? toDateTimeLocalIST(tournament.registrationDeadline)
                      : defaultTimes.registrationDeadline
                  }
                  required
                  className="field-lg text-[12px]"
                />
              </Field>
              <Field label="Starts" error={state.errors?.startAt?.[0]}>
                <input
                  name="startAt"
                  type="datetime-local"
                  defaultValue={
                    tournament
                      ? toDateTimeLocalIST(tournament.startAt)
                      : defaultTimes.startAt
                  }
                  required
                  className="field-lg text-[12px]"
                />
              </Field>
              <Field label="Ends" error={state.errors?.endAt?.[0]}>
                <input
                  name="endAt"
                  type="datetime-local"
                  defaultValue={
                    tournament
                      ? toDateTimeLocalIST(tournament.endAt)
                      : defaultTimes.endAt
                  }
                  required
                  className="field-lg text-[12px]"
                />
              </Field>
            </div>
            <p className="mono mt-2 text-[8px] tracking-[0.08em] text-white/20">
              Times are entered and displayed in IST (Asia/Kolkata).
            </p>
          </Section>

          <Section
            number="03"
            title="Schedule"
            action={
              <button
                type="button"
                onClick={() =>
                  setSchedule((rows) => [
                    ...rows,
                    { key: makeKey(), title: "", at: "", detail: "" },
                  ])
                }
                className="mono inline-flex items-center gap-1 text-[8px] tracking-[0.1em] text-[#b6ff2e]/80 uppercase hover:text-[#b6ff2e]"
              >
                <CalendarPlus className="h-3 w-3" /> Add step
              </button>
            }
          >
            <div className="space-y-3">
              {schedule.map((item, index) => (
                <div
                  key={item.key}
                  className="rounded-lg border border-white/[0.07] bg-black/20 p-3.5"
                >
                  <div className="flex items-center justify-between pb-2">
                    <span className="mono text-[8px] tracking-[0.14em] text-white/25 uppercase">
                      Step {String(index + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSchedule((rows) =>
                          rows.length > 1
                            ? rows.filter((row) => row.key !== item.key)
                            : rows,
                        )
                      }
                      disabled={schedule.length === 1}
                      className="text-white/20 hover:text-red-300 disabled:opacity-20"
                      aria-label="Remove schedule step"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1.2fr_0.9fr]">
                    <input
                      value={item.title}
                      onChange={(event) =>
                        setSchedule((rows) =>
                          rows.map((row) =>
                            row.key === item.key
                              ? { ...row, title: event.target.value }
                              : row,
                          ),
                        )
                      }
                      required
                      placeholder="Check-in & briefing"
                      className="field h-10 text-[12px]"
                    />
                    <input
                      type="datetime-local"
                      value={item.at}
                      onChange={(event) =>
                        setSchedule((rows) =>
                          rows.map((row) =>
                            row.key === item.key
                              ? { ...row, at: event.target.value }
                              : row,
                          ),
                        )
                      }
                      required
                      className="field h-10 text-[12px]"
                    />
                  </div>
                  <input
                    value={item.detail ?? ""}
                    onChange={(event) =>
                      setSchedule((rows) =>
                        rows.map((row) =>
                          row.key === item.key
                            ? { ...row, detail: event.target.value }
                            : row,
                        ),
                      )
                    }
                    placeholder="Optional detail shown on the event page"
                    className="field mt-2 h-9 text-[11px]"
                  />
                </div>
              ))}
            </div>
          </Section>

          <Section
            number="04"
            title="Prize distribution"
            action={
              <button
                type="button"
                onClick={() =>
                  setPrizes((rows) => [
                    ...rows,
                    { key: makeKey(), place: "", amount: 0, note: "" },
                  ])
                }
                className="mono inline-flex items-center gap-1 text-[8px] tracking-[0.1em] text-[#b6ff2e]/80 uppercase hover:text-[#b6ff2e]"
              >
                <Plus className="h-3 w-3" /> Add placement
              </button>
            }
          >
            {prizes.length ? (
              <div className="space-y-2">
                {prizes.map((prize, index) => (
                  <div
                    key={prize.key}
                    className="grid gap-2 rounded-lg border border-white/[0.07] bg-black/20 p-3.5 sm:grid-cols-[1fr_0.7fr_1fr_auto]"
                  >
                    <input
                      value={prize.place}
                      onChange={(event) =>
                        setPrizes((rows) =>
                          rows.map((row) =>
                            row.key === prize.key
                              ? { ...row, place: event.target.value }
                              : row,
                          ),
                        )
                      }
                      required
                      placeholder={`Placement ${index + 1}`}
                      className="field h-10 text-[12px]"
                    />
                    <input
                      type="number"
                      min={0}
                      value={prize.amount}
                      onChange={(event) =>
                        setPrizes((rows) =>
                          rows.map((row) =>
                            row.key === prize.key
                              ? { ...row, amount: Number(event.target.value) }
                              : row,
                          ),
                        )
                      }
                      required
                      placeholder="Amount"
                      className="field h-10 text-[12px]"
                    />
                    <input
                      value={prize.note ?? ""}
                      onChange={(event) =>
                        setPrizes((rows) =>
                          rows.map((row) =>
                            row.key === prize.key
                              ? { ...row, note: event.target.value }
                              : row,
                          ),
                        )
                      }
                      placeholder="Note (optional)"
                      className="field h-10 text-[12px]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPrizes((rows) =>
                          rows.filter((row) => row.key !== prize.key),
                        )
                      }
                      className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white/25 hover:border-red-400/30 hover:text-red-300"
                      aria-label="Remove placement"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-[12px] text-white/30">
                No prize split added. The total prize pool still shows on the
                event page.
              </p>
            )}
          </Section>

          <Section number="05" title="Rules & eligibility">
            <div className="grid gap-4">
              <Field
                label="Rules"
                error={state.errors?.rules?.[0]}
                hint="One rule per line."
              >
                <textarea
                  name="rules"
                  defaultValue={tournament?.rules.join("\n") ?? DEFAULT_RULES}
                  required
                  rows={7}
                  className="field text-[12px] leading-6"
                />
              </Field>
              <Field
                label="Eligibility"
                error={state.errors?.eligibility?.[0]}
                hint="One requirement per line."
              >
                <textarea
                  name="eligibility"
                  defaultValue={
                    tournament?.eligibility.join("\n") ?? DEFAULT_ELIGIBILITY
                  }
                  required
                  rows={4}
                  className="field text-[12px] leading-6"
                />
              </Field>
            </div>
          </Section>

          <Section number="06" title="Event contacts">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Contact name" error={state.errors?.contactName?.[0]}>
                <input
                  name="contactName"
                  defaultValue={tournament?.contactName ?? defaultContact.name}
                  required
                  className="field-lg"
                />
              </Field>
              <Field label="Contact email" error={state.errors?.contactEmail?.[0]}>
                <input
                  name="contactEmail"
                  type="email"
                  defaultValue={tournament?.contactEmail ?? defaultContact.email}
                  required
                  className="field-lg"
                />
              </Field>
              <Field label="Contact phone" error={state.errors?.contactPhone?.[0]}>
                <input
                  name="contactPhone"
                  defaultValue={tournament?.contactPhone ?? "+91 98765 43210"}
                  required
                  className="field-lg"
                />
              </Field>
            </div>
          </Section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:h-fit">
          <div className="surface rounded-xl p-5">
            <h2 className="display text-sm font-semibold text-white">
              Publishing
            </h2>
            <div className="mt-4">
              <label htmlFor="status" className="label">
                Status
              </label>
              {canPublish ? (
                <select
                  id="status"
                  name="status"
                  defaultValue={tournament?.status ?? "draft"}
                  className="field"
                >
                  <option value="draft">Draft — hidden</option>
                  <option value="published">Published — registration open</option>
                  <option value="live">Live — in progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              ) : (
                <>
                  <input
                    type="hidden"
                    name="status"
                    value={tournament?.status ?? "draft"}
                  />
                  <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[12px] text-white/50 capitalize">
                    {tournament?.status ?? "draft"}
                  </p>
                  <p className="mt-2 text-[10px] leading-5 text-white/30">
                    Publishing is restricted to admins. Save changes safely.
                  </p>
                </>
              )}
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-white/[0.08] bg-black/20 p-3">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={tournament?.featured ?? false}
                className="mt-0.5 h-4 w-4 accent-[#b6ff2e]"
              />
              <span>
                <span className="block text-[12px] text-white/80">
                  Feature this event
                </span>
                <span className="mt-0.5 block text-[10px] leading-4 text-white/30">
                  Highlights on the homepage and top of the board.
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={pending}
              className="btn-primary mt-4 h-10 w-full text-[9px]"
            >
              {pending ? (
                <>
                  Saving <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  {tournament ? "Save changes" : "Create draft"}
                </>
              )}
            </button>
          </div>

          <div className="surface rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="display text-sm font-semibold text-white">Banner</h2>
              <span
                className="mono text-[8px] uppercase"
                style={{ color: gameInfo.color }}
              >
                {gameInfo.short}
              </span>
            </div>
            <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
              {banner ? (
                <img
                  src={banner}
                  alt="Tournament banner preview"
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="grid aspect-video place-items-center bg-black/30 text-[10px] text-white/25">
                  No banner selected
                </div>
              )}
            </div>
            {state.errors?.bannerUrl?.[0] ? (
              <p className="mt-2 text-[10px] text-red-300">
                {state.errors.bannerUrl[0]}
              </p>
            ) : null}

            <BannerUpload onUploaded={setBanner} />

            <p className="mono mt-4 text-[8px] tracking-[0.12em] text-white/25 uppercase">
              Or use game art
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {GAMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBanner(`/banners/${item.id}.svg`)}
                  className={cn(
                    "overflow-hidden rounded-md border transition-colors",
                    banner === `/banners/${item.id}.svg`
                      ? "border-[#b6ff2e]"
                      : "border-white/10 hover:border-white/30",
                  )}
                  aria-label={`Use ${item.name} banner`}
                >
                  <img
                    src={`/banners/${item.id}.svg`}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {tournament ? (
            <div className="surface rounded-xl p-5">
              <h2 className="display text-sm font-semibold text-white">
                Registration load
              </h2>
              <p className="display mt-3 text-2xl font-semibold text-[#d7ff8a]">
                {tournament.registeredTeams}
                <span className="text-sm text-white/30">
                  {" "}
                  / {tournament.maxSlots}
                </span>
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-[#b6ff2e]"
                  style={{
                    width: `${Math.min(100, (tournament.registeredTeams / tournament.maxSlots) * 100)}%`,
                  }}
                />
              </div>
              <Link
                href={`/admin/registrations?tournamentId=${tournament.id}`}
                className="mono mt-4 inline-flex items-center gap-1 text-[9px] tracking-[0.1em] text-[#b6ff2e]/80 uppercase hover:text-[#b6ff2e]"
              >
                Manage entries <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          ) : null}

          {tournament && canDelete ? (
            <div className="rounded-xl border border-red-400/15 bg-red-500/[0.035] p-5">
              <h2 className="text-[12px] font-medium text-red-200">Danger zone</h2>
              <p className="mt-1 text-[10px] leading-5 text-red-200/45">
                Deleting the tournament also removes every registration attached
                to it. This cannot be undone.
              </p>
              <Link
                href={`/admin/tournaments/${tournament.id}/delete`}
                className="btn-danger mt-3 h-8 w-full text-[8px]"
              >
                Delete tournament
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </form>
  );
}

function Section({
  number,
  title,
  action,
  children,
}: {
  number: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="surface rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="mono text-[8px] tracking-[0.12em] text-[#b6ff2e]/60">
            {number}
          </span>
          <h2 className="display text-sm font-semibold text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {error ? (
        <p className="mt-1.5 text-[10px] text-red-300">{error}</p>
      ) : hint ? (
        <p className="mono mt-1.5 text-[8px] tracking-[0.04em] text-white/22">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function BannerUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onUploaded(data.url);
    } catch {
      setError("Upload failed. Try a smaller image.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-secondary h-9 w-full text-[8px]"
      >
        {uploading ? (
          <>
            Uploading <Loader2 className="h-3 w-3 animate-spin" />
          </>
        ) : (
          <>
            <Upload className="h-3 w-3" /> Upload custom image
          </>
        )}
      </button>
      <p className="mono mt-1.5 text-center text-[7px] tracking-[0.06em] text-white/20">
        JPG, PNG or WebP · max 4MB · 16:9 recommended
      </p>
      {error ? (
        <p className="mt-1 text-center text-[9px] text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
