"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const NBA_TEAMS = [
  { abbr: "ATL", name: "Atlanta Hawks" },
  { abbr: "BOS", name: "Boston Celtics" },
  { abbr: "BKN", name: "Brooklyn Nets" },
  { abbr: "CHA", name: "Charlotte Hornets" },
  { abbr: "CHI", name: "Chicago Bulls" },
  { abbr: "CLE", name: "Cleveland Cavaliers" },
  { abbr: "DAL", name: "Dallas Mavericks" },
  { abbr: "DEN", name: "Denver Nuggets" },
  { abbr: "DET", name: "Detroit Pistons" },
  { abbr: "GSW", name: "Golden State Warriors" },
  { abbr: "HOU", name: "Houston Rockets" },
  { abbr: "IND", name: "Indiana Pacers" },
  { abbr: "LAC", name: "LA Clippers" },
  { abbr: "LAL", name: "Los Angeles Lakers" },
  { abbr: "MEM", name: "Memphis Grizzlies" },
  { abbr: "MIA", name: "Miami Heat" },
  { abbr: "MIL", name: "Milwaukee Bucks" },
  { abbr: "MIN", name: "Minnesota Timberwolves" },
  { abbr: "NOP", name: "New Orleans Pelicans" },
  { abbr: "NYK", name: "New York Knicks" },
  { abbr: "OKC", name: "Oklahoma City Thunder" },
  { abbr: "ORL", name: "Orlando Magic" },
  { abbr: "PHI", name: "Philadelphia 76ers" },
  { abbr: "PHX", name: "Phoenix Suns" },
  { abbr: "POR", name: "Portland Trail Blazers" },
  { abbr: "SAC", name: "Sacramento Kings" },
  { abbr: "SAS", name: "San Antonio Spurs" },
  { abbr: "TOR", name: "Toronto Raptors" },
  { abbr: "UTA", name: "Utah Jazz" },
  { abbr: "WAS", name: "Washington Wizards" },
];

export default function FavoritesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin");
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from("favorites")
        .select("team_abbr")
        .eq("user_id", user.id);

      setFavorites(data?.map((f) => f.team_abbr) ?? []);
      setLoading(false);
    }
    init();
  }, []);

  async function toggleFavorite(abbr: string) {
    if (!user) return;

    if (favorites.includes(abbr)) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("team_abbr", abbr);
      setFavorites(favorites.filter((f) => f !== abbr));
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, team_abbr: abbr });
      setFavorites([...favorites, abbr]);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-white">My Teams</h1>
      <p className="mb-8 text-slate-400">
        Pick at least 3 teams to follow.{" "}
        <span className="text-amber-400 font-medium">
          {favorites.length} selected
        </span>
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {NBA_TEAMS.map((team) => {
          const isFav = favorites.includes(team.abbr);
          return (
            <button
              key={team.abbr}
              onClick={() => toggleFavorite(team.abbr)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer ${
                isFav
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-slate-700 bg-slate-800 hover:border-slate-500"
              }`}
            >
              <span className="text-2xl">{isFav ? "\u2605" : "\u2606"}</span>
              <span className="text-sm font-bold text-white">{team.abbr}</span>
              <span className="text-xs text-slate-400 text-center leading-tight">
                {team.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
