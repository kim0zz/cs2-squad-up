import { Link } from "react-router-dom";
import type { FootballOccurrence, FootballRegularPlayer, FootballSignup } from "@/types/football";
import { countPlaying } from "@/lib/footballRules";

interface FootballOccurrencesListProps {
  occurrences: FootballOccurrence[];
  signups: FootballSignup[];
  regularPlayers: FootballRegularPlayer[];
  maxPlayers: number;
  seriesSlug: string;
  adminToken: string | null;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function FootballOccurrencesList({
  occurrences,
  signups,
  regularPlayers,
  maxPlayers,
  seriesSlug,
  adminToken,
}: FootballOccurrencesListProps) {
  if (occurrences.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Brak nadchodzących terminów
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {occurrences.map((occurrence) => {
        const isCancelled = occurrence.status === "cancelled";
        const occurrenceSignups = signups.filter((s) => s.occurrence_id === occurrence.id);
        const decidedNickSet = new Set(
          occurrenceSignups.map((s) => s.nickname.toLowerCase()),
        );
        const undecidedRegularsCount = regularPlayers.filter(
          (r) => !decidedNickSet.has(r.nickname.toLowerCase()),
        ).length;
        const playingCount = countPlaying(occurrenceSignups);
        const spotsLeft = Math.max(0, maxPlayers - playingCount);
        const statusText = spotsLeft === 0 ? "Komplet" : `Brakuje ${spotsLeft}`;
        const suffix = adminToken ? `?admin=${encodeURIComponent(adminToken)}` : "";
        const targetUrl = `/football/${seriesSlug}/${occurrence.public_slug}${suffix}`;

        return (
          <div
            key={occurrence.id}
            className={`flex flex-col gap-3 rounded-xl border border-border/90 bg-card/85 p-4 shadow-md shadow-black/25 ring-1 ring-white/5 sm:flex-row sm:items-center sm:justify-between ${
              isCancelled ? "opacity-60" : ""
            }`}
          >
            <div className="space-y-1">
              {isCancelled && (
                <p className="font-display text-xs font-bold uppercase tracking-widest text-destructive">
                  ODWOŁANE
                </p>
              )}
              <p className="font-display text-sm uppercase tracking-wide text-foreground/90">
                {DATE_FORMATTER.format(new Date(occurrence.starts_at))}
              </p>
              <p className="text-sm text-muted-foreground">
                {playingCount}/{maxPlayers}
              </p>
              <p className="text-sm font-medium">{statusText}</p>
              {undecidedRegularsCount > 0 && (
                <p className="text-xs text-muted-foreground/90">
                  Stali bez decyzji: {undecidedRegularsCount}
                </p>
              )}
            </div>
            <Link
              to={targetUrl}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border/80 bg-secondary/45 px-4 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
            >
              Otwórz
            </Link>
          </div>
        );
      })}
    </div>
  );
}
