import { supabase } from "@/integrations/supabase/client";
import type {
  CreateEventInput,
  EventRow,
  ParticipantRow,
  ResponseStatus,
} from "@/types/event";

export const NICKNAME_KEY = "zbierajsie:nickname";

// ---------- Pure rules ----------

export function countPlaying(participants: ParticipantRow[]): number {
  return participants.filter((p) => p.response_status === "playing").length;
}

export function spotsLeft(participants: ParticipantRow[], maxPlayers: number): number {
  return Math.max(0, maxPlayers - countPlaying(participants));
}

/**
 * If the user picks "playing" and slots are full, they go to waitlist.
 * Otherwise the chosen status is used as-is.
 * When updating, the current user's own slot is excluded from the count.
 */
export function resolveStatus(
  chosen: ResponseStatus,
  participants: ParticipantRow[],
  maxPlayers: number,
  currentNickname?: string
): ResponseStatus {
  if (chosen !== "playing") return chosen;
  const others = currentNickname
    ? participants.filter(
        (p) => p.nickname.toLowerCase() !== currentNickname.toLowerCase()
      )
    : participants;
  return countPlaying(others) < maxPlayers ? "playing" : "waitlist";
}

function generateSlug(): string {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

// ---------- Persistence ----------

export async function createEvent(input: CreateEventInput): Promise<EventRow> {
  const { data, error } = await supabase
    .from("events")
    .insert({
      public_slug: generateSlug(),
      title: input.title,
      starts_at: input.starts_at,
      max_players: input.max_players,
      cs_mode: input.cs_mode,
      discord_info: input.discord_info,
      description: input.description ?? null,
      activity_type: "cs2",
    })
    .select()
    .single();
  if (error) throw error;
  return data as EventRow;
}

export async function getEventBySlug(slug: string): Promise<EventRow | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as EventRow | null;
}

export async function getParticipants(eventId: string): Promise<ParticipantRow[]> {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ParticipantRow[];
}

export async function upsertParticipant(
  event: EventRow,
  participants: ParticipantRow[],
  nickname: string,
  chosen: ResponseStatus
): Promise<ParticipantRow> {
  const trimmed = nickname.trim();
  const effective = resolveStatus(chosen, participants, event.max_players, trimmed);
  const existing = participants.find(
    (p) => p.nickname.toLowerCase() === trimmed.toLowerCase()
  );

  if (existing) {
    const { data, error } = await supabase
      .from("participants")
      .update({ response_status: effective })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as ParticipantRow;
  }

  const { data, error } = await supabase
    .from("participants")
    .insert({
      event_id: event.id,
      nickname: trimmed,
      response_status: effective,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ParticipantRow;
}
