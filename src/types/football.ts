export type FootballSignupStatus = "playing" | "not_playing" | "waitlist";

export type FootballOccurrenceStatus = "open" | "cancelled";

export interface FootballSeries {
  id: string;
  public_slug: string;
  admin_token: string;
  created_by: string | null;
  title: string;
  location: string;
  weekday: number;
  start_time: string;
  max_players: number;
  regular_deadline_hours_before: number;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FootballOccurrence {
  id: string;
  series_id: string;
  public_slug: string;
  starts_at: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FootballRegularPlayer {
  id: string;
  series_id: string;
  nickname: string;
  created_at: string;
}

export interface FootballSignup {
  id: string;
  occurrence_id: string;
  nickname: string;
  is_regular: boolean;
  response_status: FootballSignupStatus;
  created_at: string;
  updated_at: string;
}

export interface FootballOccurrenceComment {
  id: string;
  occurrence_id: string;
  nickname: string;
  body: string;
  created_at: string;
}

export interface UpdateFootballSeriesBasicsInput {
  title: string;
  location: string;
  max_players: number;
  regular_deadline_hours_before: number;
  description: string | null;
}

export interface CreateFootballSeriesInput {
  title: string;
  location: string;
  /** 0 = Sunday … 6 = Saturday (matches `Date#getDay`). */
  weekday: number;
  /** Local time in `HH:MM`. */
  start_time: string;
  max_players: number;
  regular_deadline_hours_before?: number;
  description?: string | null;
  /** Initial roster of regulars (case-insensitive dedupe handled by repo). */
  regular_player_nicknames: string[];
}

export interface UpsertFootballSignupInput {
  occurrence_id: string;
  nickname: string;
  /** What the user picked. The repo resolves the effective status via `footballRules`. */
  desired_status: "playing" | "not_playing";
}
