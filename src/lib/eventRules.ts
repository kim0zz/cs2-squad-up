import type { ParticipantRow, ResponseStatus } from "@/types/event";

export function countPlaying(participants: ParticipantRow[]): number {
  return participants.filter((p) => p.response_status === "playing").length;
}

export function spotsLeft(participants: ParticipantRow[], maxPlayers: number): number {
  return Math.max(0, maxPlayers - countPlaying(participants));
}

/**
 * Determine the effective status when a participant chooses "playing".
 * If full, send to waitlist. Otherwise, playing.
 * For "maybe" / "not_playing" the chosen status is kept as-is.
 *
 * When a participant is updating their status and is currently "playing",
 * their slot is excluded from the count so they can stay "playing".
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

export function generateSlug(): string {
  // 8-char URL-friendly slug
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

export const NICKNAME_KEY = "zbierajsie:nickname";
