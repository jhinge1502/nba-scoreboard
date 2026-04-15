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

    // Subscribe to real-time updates on the games table
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
        <p className="text-slate-400">Loading scores...</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">NBA Scoreboard</h1>
          <p className="text-slate-400 text-lg">
            No games right now. The worker will populate scores once it&apos;s running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-white">
        {user && favorites.length > 0 ? "My Teams" : "All Games"}
      </h1>

      {liveGames.length > 0 && (
        <Section title="Live" games={liveGames} />
      )}
      {upcomingGames.length > 0 && (
        <Section title="Upcoming" games={upcomingGames} />
      )}
      {completedGames.length > 0 && (
        <Section title="Completed" games={completedGames} />
      )}

      {displayGames.length === 0 && (
        <p className="text-slate-400 text-center mt-12">
          No games for your favorite teams today. Try adding more teams in{" "}
          <a href="/favorites" className="text-blue-400 hover:text-blue-300">
            My Teams
          </a>
          .
        </p>
      )}
    </div>
  );
}

function Section({ title, games }: { title: string; games: Game[] }) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-300">
        {title === "Live" && (
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
        )}
        {title}
        <span className="text-sm font-normal text-slate-500">
          ({games.length})
        </span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
