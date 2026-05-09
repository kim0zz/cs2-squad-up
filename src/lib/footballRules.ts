import type { FootballSignup, FootballSignupStatus } from "@/types/football";

export const FOOTBALL_NICKNAME_KEY = "zbierajsie:football:nickname";

/**
 * Whether the regular-player priority window is still active for an occurrence.
 * Returns `true` when `now` is strictly before `starts_at - deadlineHoursBefore`.
 */
export function isRegularDeadlineOpen(
  occurrenceStartsAt: string,
  deadlineHoursBefore: number,
  now: Date = new Date(),
): boolean {
  const start = new Date(occurrenceStartsAt).getTime();
  if (Number.isNaN(start)) return false;
  const deadline = start - deadlineHoursBefore * 60 * 60 * 1000;
  return now.getTime() < deadline;
}

export function countPlaying(signups: FootballSignup[]): number {
  return signups.filter((s) => s.response_status === "playing").length;
}

export function spotsLeft(maxPlayers: number, signups: FootballSignup[]): number {
  return Math.max(0, maxPlayers - countPlaying(signups));
}

export interface ResolveFootballSignupStatusInput {
  desiredStatus: FootballSignupStatus;
  isRegular: boolean;
  /** Result of `isRegularDeadlineOpen` for the occurrence. */
  regularDeadlineOpen: boolean;
  /** Current playing count, excluding the user being resolved. */
  playingCount: number;
  maxPlayers: number;
}

/**
 * Pure rule for what status a signup should land in.
 *
 *  a) "not_playing" → "not_playing"
 *  b) regular + "playing" → "playing" if room else "waitlist"
 *  c) guest + priority window open + "playing" → "waitlist"
 *  d) guest + priority window closed + "playing" → "playing" if room else "waitlist"
 */
export function resolveFootballSignupStatus(
  input: ResolveFootballSignupStatusInput,
): FootballSignupStatus {
  const {
    desiredStatus,
    isRegular,
    regularDeadlineOpen,
    playingCount,
    maxPlayers,
  } = input;

  if (desiredStatus === "not_playing") return "not_playing";
  if (desiredStatus === "waitlist") return "waitlist";

  if (isRegular) {
    return playingCount < maxPlayers ? "playing" : "waitlist";
  }
  if (regularDeadlineOpen) {
    return "waitlist";
  }
  return playingCount < maxPlayers ? "playing" : "waitlist";
}
