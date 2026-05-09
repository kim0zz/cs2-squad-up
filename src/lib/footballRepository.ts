import { supabase } from "@/integrations/supabase/client";
import {
  countPlaying,
  isRegularDeadlineOpen,
  resolveFootballSignupStatus,
} from "@/lib/footballRules";
import type {
  CreateFootballSeriesInput,
  FootballOccurrence,
  FootballOccurrenceComment,
  FootballOccurrenceStatus,
  FootballRegularPlayer,
  FootballSeries,
  FootballSignup,
  FootballSignupStatus,
  UpdateFootballSeriesBasicsInput,
  UpsertFootballSignupInput,
} from "@/types/football";

const DEFAULT_OCCURRENCE_COUNT = 5;
const DEFAULT_DEADLINE_HOURS_BEFORE = 24;

function generateSlug(): string {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

/** Short random slug for occurrence URLs (same style as series public_slug). */
function generateOccurrenceSlug(): string {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

function generateAdminToken(): string {
  return (
    Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
  );
}

/**
 * Build N upcoming weekly occurrence ISO strings starting from the next
 * matching weekday at `HH:MM` local time. If today matches and the time is
 * still in the future, today counts as the first occurrence; otherwise we
 * skip to next week, and add 7 days for each subsequent occurrence.
 */
function generateUpcomingWeeklyOccurrenceIsos(
  weekday: number,
  startTime: string,
  count: number,
  now: Date = new Date(),
): string[] {
  const [hhStr, mmStr] = startTime.split(":");
  const hh = Number.parseInt(hhStr ?? "", 10);
  const mm = Number.parseInt(mmStr ?? "", 10);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
    throw new Error(`Invalid start_time "${startTime}", expected HH:MM`);
  }
  if (weekday < 0 || weekday > 6) {
    throw new Error(`Invalid weekday ${weekday}, expected 0..6`);
  }

  const first = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hh,
    mm,
    0,
    0,
  );
  let dayDiff = (weekday - first.getDay() + 7) % 7;
  if (dayDiff === 0 && first.getTime() <= now.getTime()) {
    dayDiff = 7;
  }
  first.setDate(first.getDate() + dayDiff);

  const isos: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(first);
    d.setDate(first.getDate() + i * 7);
    isos.push(d.toISOString());
  }
  return isos;
}

function dedupeNicknames(nicknames: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of nicknames) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

export async function createFootballSeries(
  input: CreateFootballSeriesInput,
): Promise<{
  series: FootballSeries;
  occurrences: FootballOccurrence[];
  regularPlayers: FootballRegularPlayer[];
}> {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) {
    throw new Error("Wymagane logowanie organizatora");
  }

  const deadlineHours =
    input.regular_deadline_hours_before ?? DEFAULT_DEADLINE_HOURS_BEFORE;

  const { data: series, error: sErr } = await supabase
    .from("football_series")
    .insert({
      public_slug: generateSlug(),
      admin_token: generateAdminToken(),
      created_by: user.id,
      title: input.title,
      location: input.location,
      weekday: input.weekday,
      start_time: input.start_time,
      max_players: input.max_players,
      regular_deadline_hours_before: deadlineHours,
      description: input.description ?? null,
      status: "open",
    })
    .select()
    .single();
  if (sErr) throw sErr;
  const createdSeries = series as FootballSeries;

  const regulars = dedupeNicknames(input.regular_player_nicknames);
  let regularPlayers: FootballRegularPlayer[] = [];
  if (regulars.length > 0) {
    const { data: regularRows, error: rErr } = await supabase
      .from("football_regular_players")
      .insert(
        regulars.map((nickname) => ({
          series_id: createdSeries.id,
          nickname,
        })),
      )
      .select();
    if (rErr) throw rErr;
    regularPlayers = (regularRows ?? []) as FootballRegularPlayer[];
  }

  const occurrenceIsos = generateUpcomingWeeklyOccurrenceIsos(
    input.weekday,
    input.start_time,
    DEFAULT_OCCURRENCE_COUNT,
  );
  const { data: occurrenceRows, error: oErr } = await supabase
    .from("football_occurrences")
    .insert(
      occurrenceIsos.map((starts_at) => ({
        series_id: createdSeries.id,
        starts_at,
        public_slug: generateOccurrenceSlug(),
      })),
    )
    .select();
  if (oErr) throw oErr;
  const occurrences = (occurrenceRows ?? []) as FootballOccurrence[];

  return { series: createdSeries, occurrences, regularPlayers };
}

export async function getFootballSeriesBySlug(slug: string): Promise<FootballSeries | null> {
  const { data, error } = await supabase
    .from("football_series")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as FootballSeries | null;
}

export async function updateFootballSeriesBasics(
  seriesId: string,
  input: UpdateFootballSeriesBasicsInput,
): Promise<FootballSeries> {
  const { data, error } = await supabase
    .from("football_series")
    .update({
      title: input.title,
      location: input.location,
      max_players: input.max_players,
      regular_deadline_hours_before: input.regular_deadline_hours_before,
      description: input.description,
    })
    .eq("id", seriesId)
    .select()
    .single();
  if (error) throw error;
  return data as FootballSeries;
}

export async function getFootballOccurrences(seriesId: string): Promise<FootballOccurrence[]> {
  const { data, error } = await supabase
    .from("football_occurrences")
    .select("*")
    .eq("series_id", seriesId)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FootballOccurrence[];
}

export async function getFootballOccurrenceById(
  occurrenceId: string,
): Promise<FootballOccurrence | null> {
  const { data, error } = await supabase
    .from("football_occurrences")
    .select("*")
    .eq("id", occurrenceId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as FootballOccurrence | null;
}

export async function getFootballOccurrenceByPublicSlug(
  publicSlug: string,
): Promise<FootballOccurrence | null> {
  const { data, error } = await supabase
    .from("football_occurrences")
    .select("*")
    .eq("public_slug", publicSlug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as FootballOccurrence | null;
}

function isUuidRouteParam(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Resolve occurrence from the second URL segment: public_slug first, then legacy UUID id.
 */
export async function getFootballOccurrenceBySlugOrId(
  occurrenceSlugOrId: string,
): Promise<FootballOccurrence | null> {
  const bySlug = await getFootballOccurrenceByPublicSlug(occurrenceSlugOrId);
  if (bySlug) return bySlug;
  if (isUuidRouteParam(occurrenceSlugOrId)) {
    return getFootballOccurrenceById(occurrenceSlugOrId);
  }
  return null;
}

export async function updateFootballOccurrenceStatus(
  occurrenceId: string,
  status: FootballOccurrenceStatus,
): Promise<FootballOccurrence> {
  const { data, error } = await supabase
    .from("football_occurrences")
    .update({ status })
    .eq("id", occurrenceId)
    .select()
    .single();
  if (error) throw error;
  return data as FootballOccurrence;
}

export async function getFootballRegularPlayers(
  seriesId: string,
): Promise<FootballRegularPlayer[]> {
  const { data, error } = await supabase
    .from("football_regular_players")
    .select("*")
    .eq("series_id", seriesId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FootballRegularPlayer[];
}

/**
 * Replace the full regular-player roster for a series. Does not touch signups.
 * Nicknames are trimmed, empties dropped, duplicates removed (case-insensitive).
 */
export async function replaceFootballRegularPlayers(
  seriesId: string,
  nicknames: string[],
): Promise<FootballRegularPlayer[]> {
  const normalized = dedupeNicknames(nicknames);

  const { error: delErr } = await supabase
    .from("football_regular_players")
    .delete()
    .eq("series_id", seriesId);
  if (delErr) throw delErr;

  if (normalized.length === 0) {
    return [];
  }

  const { data, error: insErr } = await supabase
    .from("football_regular_players")
    .insert(
      normalized.map((nickname) => ({
        series_id: seriesId,
        nickname,
      })),
    )
    .select();
  if (insErr) throw insErr;
  return (data ?? []) as FootballRegularPlayer[];
}

export async function getFootballSignups(occurrenceId: string): Promise<FootballSignup[]> {
  const { data, error } = await supabase
    .from("football_signups")
    .select("*")
    .eq("occurrence_id", occurrenceId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FootballSignup[];
}

export async function getFootballOccurrenceComments(
  occurrenceId: string,
): Promise<FootballOccurrenceComment[]> {
  const { data, error } = await supabase
    .from("football_occurrence_comments")
    .select("*")
    .eq("occurrence_id", occurrenceId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FootballOccurrenceComment[];
}

export async function addFootballOccurrenceComment(
  occurrenceId: string,
  nickname: string,
  body: string,
): Promise<FootballOccurrenceComment> {
  const trimmedNick = nickname.trim();
  const trimmedBody = body.trim();
  if (!trimmedNick || trimmedNick.length > 80) {
    throw new Error("Nickname must be 1–80 characters");
  }
  if (!trimmedBody || trimmedBody.length > 1000) {
    throw new Error("Message must be 1–1000 characters");
  }

  const { data, error } = await supabase
    .from("football_occurrence_comments")
    .insert({
      occurrence_id: occurrenceId,
      nickname: trimmedNick,
      body: trimmedBody,
    })
    .select()
    .single();
  if (error) throw error;
  return data as FootballOccurrenceComment;
}

export async function getFootballSignupsForOccurrences(
  occurrenceIds: string[],
): Promise<FootballSignup[]> {
  if (occurrenceIds.length === 0) return [];
  const { data, error } = await supabase
    .from("football_signups")
    .select("*")
    .in("occurrence_id", occurrenceIds)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FootballSignup[];
}

export async function getFootballSeriesList(): Promise<FootballSeries[]> {
  const { data, error } = await supabase
    .from("football_series")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FootballSeries[];
}

export async function getMyFootballSeries(userId: string): Promise<FootballSeries[]> {
  const { data, error } = await supabase
    .from("football_series")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FootballSeries[];
}

/**
 * Resolve and persist a signup decision for an occurrence.
 * Status is computed via `resolveFootballSignupStatus` so the priority/waitlist
 * rules live in `footballRules.ts` (the repo only orchestrates IO).
 */
export async function upsertFootballSignup(
  input: UpsertFootballSignupInput,
): Promise<FootballSignup> {
  const trimmedNick = input.nickname.trim();
  if (!trimmedNick) {
    throw new Error("Nickname is required");
  }

  const { data: occurrence, error: oErr } = await supabase
    .from("football_occurrences")
    .select("*")
    .eq("id", input.occurrence_id)
    .maybeSingle();
  if (oErr) throw oErr;
  if (!occurrence) throw new Error("Occurrence not found");
  const occ = occurrence as FootballOccurrence;

  const { data: series, error: sErr } = await supabase
    .from("football_series")
    .select("*")
    .eq("id", occ.series_id)
    .single();
  if (sErr) throw sErr;
  const seriesRow = series as FootballSeries;

  const [signups, regulars] = await Promise.all([
    getFootballSignups(occ.id),
    getFootballRegularPlayers(seriesRow.id),
  ]);

  const isRegular = regulars.some(
    (r) => r.nickname.toLowerCase() === trimmedNick.toLowerCase(),
  );

  const existing = signups.find(
    (s) => s.nickname.toLowerCase() === trimmedNick.toLowerCase(),
  );
  const others = existing ? signups.filter((s) => s.id !== existing.id) : signups;
  const playingCount = countPlaying(others);

  const effectiveStatus: FootballSignupStatus = resolveFootballSignupStatus({
    desiredStatus: input.desired_status,
    isRegular,
    regularDeadlineOpen: isRegularDeadlineOpen(
      occ.starts_at,
      seriesRow.regular_deadline_hours_before,
    ),
    playingCount,
    maxPlayers: seriesRow.max_players,
  });

  if (existing) {
    const { data, error } = await supabase
      .from("football_signups")
      .update({
        response_status: effectiveStatus,
        is_regular: isRegular,
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as FootballSignup;
  }

  const { data, error } = await supabase
    .from("football_signups")
    .insert({
      occurrence_id: occ.id,
      nickname: trimmedNick,
      is_regular: isRegular,
      response_status: effectiveStatus,
    })
    .select()
    .single();
  if (error) throw error;
  return data as FootballSignup;
}

/**
 * Organizer override: force a signup to `playing` without priority/deadline/capacity rules.
 * Caller must enforce admin-only use in the UI.
 */
export async function adminPromoteFootballSignupToPlaying(input: {
  occurrence_id: string;
  nickname: string;
}): Promise<FootballSignup> {
  const trimmedNick = input.nickname.trim();
  if (!trimmedNick) {
    throw new Error("Nickname is required");
  }

  const { data: occurrence, error: oErr } = await supabase
    .from("football_occurrences")
    .select("*")
    .eq("id", input.occurrence_id)
    .maybeSingle();
  if (oErr) throw oErr;
  if (!occurrence) throw new Error("Occurrence not found");
  const occ = occurrence as FootballOccurrence;

  const { data: series, error: sErr } = await supabase
    .from("football_series")
    .select("*")
    .eq("id", occ.series_id)
    .single();
  if (sErr) throw sErr;
  const seriesRow = series as FootballSeries;

  const [signups, regulars] = await Promise.all([
    getFootballSignups(occ.id),
    getFootballRegularPlayers(seriesRow.id),
  ]);

  const existing = signups.find(
    (s) => s.nickname.toLowerCase() === trimmedNick.toLowerCase(),
  );
  if (!existing) {
    throw new Error("Signup not found");
  }

  const isRegular = regulars.some(
    (r) => r.nickname.toLowerCase() === trimmedNick.toLowerCase(),
  );

  const { data, error } = await supabase
    .from("football_signups")
    .update({
      response_status: "playing",
      is_regular: isRegular,
    })
    .eq("id", existing.id)
    .select()
    .single();
  if (error) throw error;
  return data as FootballSignup;
}
