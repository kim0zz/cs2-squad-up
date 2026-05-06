import type { ParticipantRow, ResponseStatus } from "@/types/event";

export const NICKNAME_KEY = "zbierajsie:nickname";

export const MAX_PLAYERS_BY_MODE = {
  faceit: 5,
  premier: 5,
  mix10: 10,
} as const;

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
