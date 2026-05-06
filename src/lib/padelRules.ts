import type { PadelOptionWithVotes, PadelVote } from "@/types/padel";

export function countFits(votes: PadelVote[]): number {
  return votes.filter((v) => v.vote_status === "fits").length;
}

export function isPadelOptionComplete(votes: PadelVote[]): boolean {
  return countFits(votes) >= 4;
}

export function sortPadelOptions(optionsWithVotes: PadelOptionWithVotes[]): PadelOptionWithVotes[] {
  return [...optionsWithVotes].sort((a, b) => {
    const aComplete = isPadelOptionComplete(a.votes);
    const bComplete = isPadelOptionComplete(b.votes);
    if (aComplete !== bComplete) return aComplete ? -1 : 1;
    const fitsDiff = countFits(b.votes) - countFits(a.votes);
    if (fitsDiff !== 0) return fitsDiff;
    return a.starts_at.localeCompare(b.starts_at);
  });
}
