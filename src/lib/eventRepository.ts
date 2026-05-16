import { supabase } from "@/integrations/supabase/client";
import { MAX_PLAYERS_BY_MODE, resolveStatus } from "@/lib/eventRules";
import type {
  CreateEventInput,
  EventComment,
  EventRow,
  ParticipantRow,
  ResponseStatus,
} from "@/types/event";

/** Event row plus playing count for public lists (not persisted). */
export type UpcomingEventListItem = EventRow & { playingCount: number };

function generateSlug(): string {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

export async function createEvent(input: CreateEventInput): Promise<EventRow> {
  const maxPlayers = MAX_PLAYERS_BY_MODE[input.cs_mode];
  const { data, error } = await supabase
    .from("events")
    .insert({
      public_slug: generateSlug(),
      title: input.title,
      starts_at: input.starts_at,
      max_players: maxPlayers,
      cs_mode: input.cs_mode,
      discord_info: input.discord_info?.trim() ? input.discord_info.trim() : null,
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

/**
 * Open events starting from now onward, sorted by start time.
 * Playing counts are loaded in one follow-up query (no schema change).
 */
export async function getUpcomingEvents(): Promise<UpcomingEventListItem[]> {
  const now = new Date().toISOString();
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "open")
    .gte("starts_at", now)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  const list = (events ?? []) as EventRow[];
  if (list.length === 0) return [];

  const ids = list.map((e) => e.id);
  const { data: playingRows, error: pErr } = await supabase
    .from("participants")
    .select("event_id")
    .in("event_id", ids)
    .eq("response_status", "playing");
  if (pErr) throw pErr;

  const playingByEvent = new Map<string, number>();
  for (const row of playingRows ?? []) {
    const eid = row.event_id as string;
    playingByEvent.set(eid, (playingByEvent.get(eid) ?? 0) + 1);
  }

  return list.map((e) => ({
    ...e,
    playingCount: playingByEvent.get(e.id) ?? 0,
  }));
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

export async function getEventComments(eventId: string): Promise<EventComment[]> {
  const { data, error } = await supabase
    .from("cs2_event_comments")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as EventComment[];
}

export async function addEventComment(
  eventId: string,
  nickname: string,
  body: string,
): Promise<EventComment> {
  const trimmedNick = nickname.trim();
  const trimmedBody = body.trim();
  if (!trimmedNick || trimmedNick.length > 80) {
    throw new Error("Nickname must be 1–80 characters");
  }
  if (!trimmedBody || trimmedBody.length > 1000) {
    throw new Error("Message must be 1–1000 characters");
  }

  const { data, error } = await supabase
    .from("cs2_event_comments")
    .insert({
      event_id: eventId,
      nickname: trimmedNick,
      body: trimmedBody,
    })
    .select()
    .single();
  if (error) throw error;
  return data as EventComment;
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
