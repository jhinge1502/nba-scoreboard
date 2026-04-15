"use client";

import type { Game, Leader } from "@/lib/types";

export default function GameCard({ game }: { game: Game }) {
  const isLive = game.status === "in_progress";
  const isFinal = game.status === "final";
  const isScheduled = game.status === "scheduled";

  return (
    <div className="retro-card group">
      {/* Retro TV frame */}
      <div
        className={`relative overflow-hidden rounded-2xl border-4 ${
          isLive
            ? "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            : isFinal
              ? "border-slate-500"
              : "border-slate-600"
        } bg-gradient-to-b from-slate-900 to-slate-950`}
      >
        {/* Top bar — status + broadcast */}
        <div
          className={`flex items-center justify-between px-4 py-2 ${
            isLive
              ? "bg-gradient-to-r from-red-900/80 to-amber-900/60"
              : isFinal
                ? "bg-slate-800/80"
                : "bg-slate-800/50"
          }`}
        >
          <StatusBadge
            status={game.status}
            clock={game.game_clock}
            detail={game.status_detail}
          />
          {game.broadcast && (
            <span className="rounded bg-slate-700/80 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-300 uppercase">
              {game.broadcast}
            </span>
          )}
        </div>

        {/* Screen area */}
        <div className="px-4 pt-4 pb-3">
          {/* Matchup */}
          <div className="flex items-center justify-between gap-3">
            {/* Away team */}
            <TeamSide
              logo={game.away_logo}
              name={game.away_team}
              record={game.away_record}
              score={game.away_score}
              isWinning={game.away_score > game.home_score}
              showScore={!isScheduled}
              isLive={isLive}
            />

            {/* Center divider */}
            <div className="flex flex-col items-center gap-1">
              {isScheduled && game.start_time ? (
                <div className="text-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                    {formatDate(game.start_time)}
                  </span>
                  <p className="text-lg font-bold text-slate-300 tabular-nums">
                    {formatTime(game.start_time)}
                  </p>
                </div>
              ) : (
                <span className="text-xl font-black text-slate-600">VS</span>
              )}
            </div>

            {/* Home team */}
            <TeamSide
              logo={game.home_logo}
              name={game.home_team}
              record={game.home_record}
              score={game.home_score}
              isWinning={game.home_score > game.away_score}
              showScore={!isScheduled}
              isLive={isLive}
              isHome
            />
          </div>

          {/* Player leaders */}
          {!isScheduled &&
            (game.home_leaders.length > 0 || game.away_leaders.length > 0) && (
              <div className="mt-3 border-t border-slate-700/50 pt-3">
                <div className="flex gap-3">
                  <LeaderColumn leaders={game.away_leaders} />
                  <div className="w-px bg-slate-700/50" />
                  <LeaderColumn leaders={game.home_leaders} />
                </div>
              </div>
            )}
        </div>

        {/* Scanlines overlay for retro feel */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)]" />
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  clock,
  detail,
}: {
  status: string;
  clock: string | null;
  detail: string | null;
}) {
  if (status === "in_progress") {
    return (
      <span className="flex items-center gap-2 text-sm font-bold text-red-400">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        {clock || "LIVE"}
      </span>
    );
  }
  if (status === "final") {
    return (
      <span className="text-sm font-bold tracking-wide text-slate-400">
        {detail || "FINAL"}
      </span>
    );
  }
  return (
    <span className="text-xs font-medium tracking-wider text-slate-500 uppercase">
      Scheduled
    </span>
  );
}

function TeamSide({
  logo,
  name,
  record,
  score,
  isWinning,
  showScore,
  isLive,
  isHome,
}: {
  logo: string | null;
  name: string;
  record: string | null;
  score: number;
  isWinning: boolean;
  showScore: boolean;
  isLive: boolean;
  isHome?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 flex-1 ${isHome ? "order-last" : ""}`}>
      {logo ? (
        <img src={logo} alt={name} className="h-14 w-14 object-contain drop-shadow-lg" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-700 text-lg font-black text-slate-300">
          {name.slice(0, 2)}
        </div>
      )}
      <div className="text-center">
        <p className={`text-sm font-bold ${isWinning && showScore ? "text-white" : "text-slate-300"}`}>
          {name}
        </p>
        {record && (
          <p className="text-[10px] text-slate-500">{record}</p>
        )}
      </div>
      {showScore && (
        <p
          className={`text-4xl font-black tabular-nums leading-none ${
            isWinning
              ? isLive
                ? "text-amber-400"
                : "text-white"
              : "text-slate-500"
          }`}
        >
          {score}
        </p>
      )}
    </div>
  );
}

function LeaderColumn({ leaders }: { leaders: Leader[] }) {
  const points = leaders.find((l) => l.category === "points");
  if (!points) return <div className="flex-1" />;

  return (
    <div className="flex flex-1 items-center gap-2">
      {points.headshot ? (
        <img
          src={points.headshot}
          alt={points.name}
          className="h-8 w-8 rounded-full object-cover border border-slate-600"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-slate-700" />
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-200">
          {points.name}
        </p>
        <p className="text-[10px] text-amber-400/80 font-medium">
          {points.value} PTS
        </p>
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
