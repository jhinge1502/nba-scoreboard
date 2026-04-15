export type Game = {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: string;
  game_clock: string | null;
  home_logo: string | null;
  away_logo: string | null;
  start_time: string | null;
  updated_at: string;
};
