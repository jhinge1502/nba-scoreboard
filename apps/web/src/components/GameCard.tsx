"use client";

import type { Game } from "@/lib/types";

export default function GameCard({ game }: { game: Game }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      {/* Status badge */}
      <div className="mb-3 flex items-center justify-between">
        <StatusBadge status={game.status} clock={game.game_clock} />
        {game.status === "scheduled" && game.start_time && (
          <span className="text-xs text-slate-400">
            {formatTime(game.start_time)}
          </span>
        )}
      </div>

      {/* Teams and scores */}
      <div className="flex flex-col gap-3">
        <TeamRow
          logo={game.away_logo}
          name={game.away_team}
          score={game.away_score}
          isWinning={game.away_score > game.home_score}
          showScore={game.status !== "scheduled"}
        />
        <TeamRow
          logo={game.home_logo}
          name={game.home_team}
          score={game.home_score}
          isWinning={game.home_score > game.away_score}
          showScore={game.status !== "scheduled"}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status, clock }: { status: string; clock: string | null }) {
  if (status === "in_progress") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        {clock || "Live"}
      </span>
    );
  }
  if (status === "final") {
    return (
      <span className="rounded bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-300">
        Final
      </span>
    );
  }
  return (
    <span className="text-xs text-slate-500">Scheduled</span>
  );
}

function TeamRow({
  logo,
  name,
  score,
  isWinning,
  showScore,
}: {
  logo: string | null;
  name: string;
  score: number;
  isWinning: boolean;
  showScore: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {logo ? (
          <img src={logo} alt={name} className="h-8 w-8 object-contain" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
            {name.slice(0, 2)}
          </div>
        )}
        <span
          className={`text-sm font-semibold ${
            isWinning && showScore ? "text-white" : "text-slate-300"
          }`}
        >
          {name}
        </span>
      </div>
      {showScore && (
        <span
          className={`text-lg font-bold tabular-nums ${
            isWinning ? "text-white" : "text-slate-400"
          }`}
        >
          {score}
        </span>
      )}
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
