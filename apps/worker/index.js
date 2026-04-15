require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
const POLL_INTERVAL = 30_000; // 30 seconds

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function parseStatus(statusType) {
  switch (statusType) {
    case "STATUS_IN_PROGRESS":
      return "in_progress";
    case "STATUS_FINAL":
      return "final";
    case "STATUS_SCHEDULED":
    default:
      return "scheduled";
  }
}

function buildGameClock(status) {
  if (status.type.name !== "STATUS_IN_PROGRESS") return null;
  const period = status.period;
  const clock = status.displayClock;
  const quarterNames = { 1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4" };
  const qtr = quarterNames[period] || `OT${period - 4 > 1 ? period - 4 : ""}`;
  return `${qtr} ${clock}`;
}

function parseGames(data) {
  const events = data.events || [];
  return events.map((event) => {
    const comp = event.competitions[0];
    const home = comp.competitors.find((c) => c.homeAway === "home");
    const away = comp.competitors.find((c) => c.homeAway === "away");
    const status = comp.status;

    return {
      id: event.id,
      home_team: home.team.abbreviation,
      away_team: away.team.abbreviation,
      home_score: parseInt(home.score) || 0,
      away_score: parseInt(away.score) || 0,
      status: parseStatus(status.type.name),
      game_clock: buildGameClock(status),
      home_logo: home.team.logo,
      away_logo: away.team.logo,
      start_time: event.date,
      updated_at: new Date().toISOString(),
    };
  });
}

async function fetchAndUpsert() {
  try {
    const res = await fetch(ESPN_URL);
    if (!res.ok) {
      console.error(`ESPN API error: ${res.status}`);
      return;
    }
    const data = await res.json();
    const games = parseGames(data);

    if (games.length === 0) {
      console.log(`[${new Date().toLocaleTimeString()}] No games today.`);
      return;
    }

    const { error } = await supabase
      .from("games")
      .upsert(games, { onConflict: "id" });

    if (error) {
      console.error("Supabase upsert error:", error.message);
    } else {
      const live = games.filter((g) => g.status === "in_progress").length;
      const scheduled = games.filter((g) => g.status === "scheduled").length;
      const final = games.filter((g) => g.status === "final").length;
      console.log(
        `[${new Date().toLocaleTimeString()}] Upserted ${games.length} games (${live} live, ${scheduled} upcoming, ${final} final)`
      );
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

// Run immediately, then every 30 seconds
console.log("NBA Scoreboard Worker started. Polling every 30s...");
fetchAndUpsert();
setInterval(fetchAndUpsert, POLL_INTERVAL);
