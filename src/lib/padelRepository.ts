import { supabase } from "@/integrations/supabase/client";
import { countFits } from "@/lib/padelRules";
import type {
  CreatePadelGatheringInput,
  PadelGathering,
  PadelGatheringListItem,
  PadelOption,
  PadelVote,
  PadelVoteStatus,
  UpcomingPadelGatheringItem,
} from "@/types/padel";

const MAX_OPTIONS_PER_GATHERING = 4;

/** Earliest future `starts_at`, else earliest overall; null if no options. */
function computeNextStartsAt(gOpts: PadelOption[]): string | null {
  if (gOpts.length === 0) return null;
  const now = new Date().toISOString();
  const future = gOpts.filter((o) => o.starts_at >= now);
  const pool = future.length > 0 ? future : gOpts;
  return pool.reduce((m, x) => (x.starts_at < m ? x.starts_at : m), pool[0].starts_at);
}

function generateSlug(): string {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

export async function createPadelGathering(
  input: CreatePadelGatheringInput
): Promise<{ gathering: PadelGathering; options: PadelOption[] }> {
  const n = input.options.length;
  if (n < 1 || n > MAX_OPTIONS_PER_GATHERING) {
    throw new Error(`Padel gathering must have between 1 and ${MAX_OPTIONS_PER_GATHERING} options`);
  }

  const { data: gathering, error: gErr } = await supabase
    .from("padel_gatherings")
    .insert({
      public_slug: generateSlug(),
      title: input.title,
      description: input.description ?? null,
      status: "open",
    })
    .select()
    .single();
  if (gErr) throw gErr;
  const g = gathering as PadelGathering;

  const optionRows = input.options.map((o) => ({
    gathering_id: g.id,
    venue_name: o.venue_name,
    starts_at: o.starts_at,
    duration_minutes: o.duration_minutes ?? null,
    price_per_person: o.price_per_person ?? null,
  }));

  const { data: options, error: oErr } = await supabase
    .from("padel_options")
    .insert(optionRows)
    .select();
  if (oErr) throw oErr;

  return { gathering: g, options: (options ?? []) as PadelOption[] };
}

export async function getPadelGatheringBySlug(slug: string): Promise<PadelGathering | null> {
  const { data, error } = await supabase
    .from("padel_gatherings")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as PadelGathering | null;
}

export async function getPadelOptions(gatheringId: string): Promise<PadelOption[]> {
  const { data, error } = await supabase
    .from("padel_options")
    .select("*")
    .eq("gathering_id", gatheringId)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PadelOption[];
}

export async function getPadelVotes(optionIds: string[]): Promise<PadelVote[]> {
  if (optionIds.length === 0) return [];
  const { data, error } = await supabase
    .from("padel_votes")
    .select("*")
    .in("option_id", optionIds)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PadelVote[];
}

export async function upsertPadelVote(
  optionId: string,
  nickname: string,
  voteStatus: PadelVoteStatus
): Promise<PadelVote> {
  const trimmed = nickname.trim();
  const { data: existing, error: findErr } = await supabase
    .from("padel_votes")
    .select("*")
    .eq("option_id", optionId)
    .eq("nickname", trimmed)
    .maybeSingle();
  if (findErr) throw findErr;

  if (existing) {
    const { data, error } = await supabase
      .from("padel_votes")
      .update({ vote_status: voteStatus })
      .eq("id", (existing as PadelVote).id)
      .select()
      .single();
    if (error) throw error;
    return data as PadelVote;
  }

  const { data, error } = await supabase
    .from("padel_votes")
    .insert({
      option_id: optionId,
      nickname: trimmed,
      vote_status: voteStatus,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PadelVote;
}

/** Open gatherings with option counts and best „Pasuje” summary for list UI. */
export async function getOpenPadelGatheringsList(): Promise<PadelGatheringListItem[]> {
  const { data: gatherings, error } = await supabase
    .from("padel_gatherings")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: true });
  if (error) throw error;
  const list = (gatherings ?? []) as PadelGathering[];
  if (list.length === 0) return [];

  const gIds = list.map((g) => g.id);
  const { data: allOptions, error: oErr } = await supabase
    .from("padel_options")
    .select("*")
    .in("gathering_id", gIds)
    .order("starts_at", { ascending: true });
  if (oErr) throw oErr;
  const opts = (allOptions ?? []) as PadelOption[];

  const optsByGathering = new Map<string, PadelOption[]>();
  for (const o of opts) {
    const arr = optsByGathering.get(o.gathering_id) ?? [];
    arr.push(o);
    optsByGathering.set(o.gathering_id, arr);
  }

  const optionIds = opts.map((o) => o.id);
  const votes = await getPadelVotes(optionIds);
  const votesByOption = new Map<string, PadelVote[]>();
  for (const v of votes) {
    const arr = votesByOption.get(v.option_id) ?? [];
    arr.push(v);
    votesByOption.set(v.option_id, arr);
  }

  const items: PadelGatheringListItem[] = list.map((g) => {
    const gOpts = optsByGathering.get(g.id) ?? [];
    let maxFits = 0;
    let hasComplete = false;
    for (const o of gOpts) {
      const ov = votesByOption.get(o.id) ?? [];
      const f = countFits(ov);
      if (f > maxFits) maxFits = f;
      if (f >= 4) hasComplete = true;
    }
    return {
      ...g,
      optionsCount: gOpts.length,
      hasCompleteOption: hasComplete,
      maxFitsCount: maxFits,
      nextStartsAt: computeNextStartsAt(gOpts),
    };
  });

  items.sort((a, b) => {
    const minStart = (id: string) => {
      const o = optsByGathering.get(id) ?? [];
      if (o.length === 0) return "\uffff";
      return o.reduce((m, x) => (x.starts_at < m ? x.starts_at : m), o[0].starts_at);
    };
    return minStart(a.id).localeCompare(minStart(b.id));
  });

  return items;
}

export async function getUpcomingPadelGatherings(): Promise<UpcomingPadelGatheringItem[]> {
  const now = new Date().toISOString();
  const { data: gatherings, error } = await supabase
    .from("padel_gatherings")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: true });
  if (error) throw error;
  const list = (gatherings ?? []) as PadelGathering[];
  if (list.length === 0) return [];

  const ids = list.map((g) => g.id);
  const { data: allOptions, error: oErr } = await supabase
    .from("padel_options")
    .select("*")
    .in("gathering_id", ids)
    .order("starts_at", { ascending: true });
  if (oErr) throw oErr;
  const opts = (allOptions ?? []) as PadelOption[];

  const byGathering = new Map<string, PadelOption[]>();
  for (const o of opts) {
    const arr = byGathering.get(o.gathering_id) ?? [];
    arr.push(o);
    byGathering.set(o.gathering_id, arr);
  }

  const result: UpcomingPadelGatheringItem[] = [];
  for (const g of list) {
    const gOpts = byGathering.get(g.id) ?? [];
    const hasFuture = gOpts.some((o) => o.starts_at >= now);
    if (!hasFuture) continue;
    result.push({ ...g, options: gOpts });
  }

  result.sort((a, b) => {
    const minFuture = (items: PadelOption[]) =>
      items.filter((o) => o.starts_at >= now).reduce<string | null>((acc, o) => {
        if (acc === null || o.starts_at < acc) return o.starts_at;
        return acc;
      }, null);
    const aKey = minFuture(a.options) ?? "";
    const bKey = minFuture(b.options) ?? "";
    return aKey.localeCompare(bKey);
  });

  return result;
}
