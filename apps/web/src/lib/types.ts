export type Leader = {
  category: string;
  name: string;
  value: string;
  headshot: string | null;
};

export type Game = {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: string;
  status_detail: string | null;
  game_clock: string | null;
  home_logo: string | null;
  away_logo: string | null;
  home_leaders: Leader[];
  away_leaders: Leader[];
  home_record: string | null;
  away_record: string | null;
  broadcast: string | null;
  start_time: string | null;
  updated_at: string;
};
