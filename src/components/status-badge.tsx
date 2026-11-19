import { cn, displayStatus, phaseStyle } from "@/lib/utils";
import type { RegistrationWindow, TournamentPhase } from "@/lib/types";

export function StatusBadge({
  phase,
  window,
  className,
}: {
  phase: TournamentPhase;
  window: RegistrationWindow;
  className?: string;
}) {
  return (
    <span className={cn("chip backdrop-blur-md", phaseStyle(phase), className)}>
      {phase === "live" ? (
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-current" />
      ) : null}
      {displayStatus(phase, window)}
    </span>
  );
}
