export type PadelVoteStatus = "fits" | "doesnt_fit";

export interface PadelGathering {
  id: string;
  public_slug: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PadelOption {
  id: string;
  gathering_id: string;
  venue_name: string;
  starts_at: string;
  duration_minutes: number | null;
  price_per_person: string | null;
  created_at: string;
  updated_at: string;
}

export interface PadelVote {
  id: string;
  option_id: string;
  nickname: string;
  vote_status: PadelVoteStatus;
  created_at: string;
  updated_at: string;
}

export interface CreatePadelOptionInput {
  venue_name: string;
  starts_at: string;
  duration_minutes?: number | null;
  price_per_person?: string | null;
}

export interface CreatePadelGatheringInput {
  title: string;
  description?: string | null;
  options: CreatePadelOptionInput[];
}

export type PadelOptionWithVotes = PadelOption & { votes: PadelVote[] };

export type UpcomingPadelGatheringItem = PadelGathering & { options: PadelOption[] };
