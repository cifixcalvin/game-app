"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function getRemaining(target: string): Remaining {
  const diff = new Date(target).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function Countdown({
  target,
  label = "Registration closes",
  variant = "inline",
  className,
}: {
  target: string;
  label?: string;
  variant?: "inline" | "blocks";
  className?: string;
}) {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const update = () => setRemaining(getRemaining(target));
    const initial = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [target]);

  if (variant === "blocks") {
    const parts = [
      { value: remaining?.days, unit: "Days" },
      { value: remaining?.hours, unit: "Hours" },
      { value: remaining?.minutes, unit: "Mins" },
      { value: remaining?.seconds, unit: "Secs" },
    ];
    return (
      <div className={className}>
        <p className="mono text-[9px] font-medium tracking-[0.2em] text-white/35 uppercase">
          {remaining?.expired ? "Registration closed" : label}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {parts.map((part) => (
            <div
              key={part.unit}
              className="rounded-lg border border-white/10 bg-black/25 px-2 py-2.5 text-center"
            >
              <span className="display block text-xl font-semibold text-white tabular-nums sm:text-2xl">
                {remaining ? String(part.value ?? 0).padStart(2, "0") : "--"}
              </span>
              <span className="mono mt-1 block text-[8px] tracking-[0.12em] text-white/30 uppercase">
                {part.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const inline = remaining?.expired
    ? "Registration closed"
    : remaining
      ? `${remaining.days}d ${remaining.hours}h ${remaining.minutes}m left`
      : "—";

  return (
    <span className={cn("mono tabular-nums", className)}>{inline}</span>
  );
}
