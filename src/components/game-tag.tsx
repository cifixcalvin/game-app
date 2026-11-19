import { getGame } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function GameTag({
  game,
  className,
  showGenre = false,
}: {
  game: string;
  className?: string;
  showGenre?: boolean;
}) {
  const info = getGame(game);
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.14em] text-white/55 uppercase",
        className,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: info.color, boxShadow: `0 0 12px ${info.color}80` }}
      />
      {info.name}
      {showGenre ? <span className="text-white/25">/ {info.genre}</span> : null}
    </span>
  );
}
