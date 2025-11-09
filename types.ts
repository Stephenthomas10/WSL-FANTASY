export interface PlayerMatchStats {
  season: number;
  gameweek: number;
  match_date: string;
  // FIX: Added optional property to hold a Date object for calculations, resolving multiple type errors.
  match_date_obj?: Date;
  home_team: string;
  away_team: string;
  team: string;
  opponent: string;
  venue: 'H' | 'A';
  player_id: number;
  player: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  minutes: number;
  started: number; // 0 or 1
  goals: number;
  assists: number;
  shots: number;
  shots_ot: number;
  xg: number;
  xa: number;
  pen_won: number;
  pen_conceded: number;
  pen_scored: number;
  pen_missed: number;
  pen_saves: number;
  saves: number;
  cs: number; // clean sheet
  goals_conceded: number;
  yellow: number;
  red: number;
  own_goal: number;
  touches: number;
  passes_acc: number;
  bonus_raw?: number;
}

export interface Fixture {
  gameweek: number;
  match_date: string;
  // FIX: Added optional property to hold a Date object for calculations, resolving multiple type errors.
  match_date_obj?: Date;
  home_team: string;
  away_team: string;
}

export interface SquadAvailability {
  player_id: number;
  prob_starts: number; // 0..1
  injury_flag: number; // 0 or 1
}

export interface TeamRatings {
  team: string;
  att_strength: number;
  def_strength: number;
  pace: number;
}

export interface Popularity {
  player_id: number;
  selected_percent: number;
}

export interface Price {
  player_id: number;
  price_m: number;
}

export interface PlayerEfpOutput {
  gameweek: number;
  match_date: string;
  team: string;
  opponent: string;
  venue: 'H' | 'A';
  player_id: number;
  player: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  prob_starts: number;
  E_minutes: number;
  p60: number;
  E_goals: number;
  E_assists: number;
  P_clean_sheet: number;
  E_saves: number;
  E_bonus: number;
  E_visionary: number;
  E_min_pts: number;
  EFP: number;
  Captain_EFP: number;
  price_m: number;
  value_ep_per_m: number;
  season: string;
  data_notes: string[];
  breakdown: { [key: string]: number };
}