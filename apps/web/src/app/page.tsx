"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Game } from "@/lib/types";
import GameCard from "@/components/GameCard";

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("favorites")
          .select("team_abbr")
          .eq("user_id", user.id);
        setFavorites(data?.map((f) => f.team_abbr) ?? []);
      }

      const { data: gamesData } = await supabase
        .from("games")
        .select("*")
        .order("start_time", { ascending: true });
      setGames(gamesData ?? []);
      setLoading(false);
    }
    init();

    const channel = supabase
      .channel("games-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setGames((prev) => [...prev, payload.new as Game]);
          } else if (payload.eventType === "UPDATE") {
            setGames((prev) =>
              prev.map((g) =>
                g.id === (payload.new as Game).id ? (payload.new as Game) : g
              )
            );
          } else if (payload.eventType === "DELETE") {
            setGames((prev) =>
              prev.filter((g) => g.id !== (payload.old as Game).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const displayGames =
    user && favorites.length > 0
      ? games.filter(
          (g) => favorites.includes(g.home_team) || favorites.includes(g.away_team)
        )
      : games;

  const liveGames = displayGames.filter((g) => g.status === "in_progress");
  const upcomingGames = displayGames.filter((g) => g.status === "scheduled");
  const completedGames = displayGames.filter((g) => g.status === "final");

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="text-slate-400 text-sm">Tuning in...</p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📡</div>
          <h1 className="text-2xl font-bold text-white mb-2">No Signal</h1>
          <p className="text-slate-400">
            No games on the air right now. The worker will tune in once games are live.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero header */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-black tracking-tight text-white mb-1">
          {user && favorites.length > 0 ? "MY TEAMS" : "TONIGHT\u2019S GAMES"}
        </h1>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
          <p className="text-sm font-medium tracking-widest text-amber-400/70 uppercase">
            Live Scoreboard
          </p>
          <div className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
        </div>
      </div>

      {liveGames.length > 0 && (
        <Section title="ON THE AIR" badge="LIVE" games={liveGames} />
      )}
      {upcomingGames.length > 0 && (
        <Section title="COMING UP" games={upcomingGames} />
      )}
      {completedGames.length > 0 && (
        <Section title="FINAL SCORES" games={completedGames} />
      )}

      {displayGames.length === 0 && (
        <div className="text-center mt-12 py-12 rounded-2xl border border-dashed border-slate-700">
          <p className="text-slate-500">
            No games for your favorite teams today.
          </p>
          <a
            href="/favorites"
            className="mt-2 inline-block text-sm text-amber-400 hover:text-amber-300"
          >
            Add more teams &rarr;
          </a>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  badge,
  games,
}: {
  title: string;
  badge?: string;
  games: Game[];
}) {
  return (
    <div className="mb-10">
      <div className="mb-5 flex items-center gap-3">
        {badge && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400 border border-red-500/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            {badge}
          </span>
        )}
        <h2 className="text-sm font-bold tracking-[0.2em] text-slate-400 uppercase">
          {title}
        </h2>
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-xs text-slate-600">
          {games.length} {games.length === 1 ? "game" : "games"}
        </span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
