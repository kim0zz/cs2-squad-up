import { Link } from "react-router-dom";
import type { FootballOccurrence, FootballRegularPlayer, FootballSignup } from "@/types/football";
import { cn, mobileCardTopAccent } from "@/lib/utils";
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
          <Link
            key={occurrence.id}
            to={targetUrl}
            className={`block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              isCancelled ? "opacity-60" : ""
            }`}
          >
            <div
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-border/80 bg-gradient-card p-4 sm:p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/55 group-hover:shadow-glow sm:flex-row sm:items-center sm:justify-between cursor-pointer",
                mobileCardTopAccent,
              )}
            >
              <div className="space-y-1 min-w-0 flex-1">
                {isCancelled && (
                  <p className="font-display text-xs font-bold uppercase tracking-widest text-destructive">
                    ODWOŁANE
                  </p>
                )}
                <p className="font-display text-sm uppercase tracking-wide text-foreground/90 group-hover:text-primary transition-colors">
                  {DATE_FORMATTER.format(new Date(occurrence.starts_at))}
                </p>
                <p className="text-sm tabular-nums font-semibold text-primary/95 sm:font-normal sm:text-muted-foreground">
                  {playingCount}/{maxPlayers}
                </p>
                <p
                  className={
                    spotsLeft > 0
                      ? "text-sm font-medium text-primary/95 sm:text-foreground"
                      : "text-sm font-medium"
                  }
                >
                  {statusText}
                </p>
                {undecidedRegularsCount > 0 && (
                  <p className="text-xs text-muted-foreground/90">
                    Stali bez decyzji: {undecidedRegularsCount}
                  </p>
                )}
              </div>
              <span className="inline-flex shrink-0 items-center justify-center rounded-md border border-border/80 bg-secondary/45 px-4 py-2 text-sm font-display uppercase tracking-wider text-foreground transition-colors group-hover:border-primary/45 group-hover:bg-secondary/75">
                Otwórz
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
