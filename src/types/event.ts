export type ResponseStatus = "playing" | "maybe" | "not_playing" | "waitlist";
export type CsMode = "premier" | "faceit" | "mix10";
export type MaxPlayers = 5 | 10;

export interface EventRow {
  id: string;
  public_slug: string;
  title: string;
  activity_type: string;
  starts_at: string;
  max_players: number;
  cs_mode: CsMode;
  discord_info: string;
  description: string | null;
  visibility: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ParticipantRow {
  id: string;
  event_id: string;
  nickname: string;
  response_status: ResponseStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  title: string;
  starts_at: string;
  cs_mode: CsMode;
  discord_info: string;
  description?: string;
}
