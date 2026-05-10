import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { countFits, isPadelOptionComplete } from "@/lib/padelRules";
import type { PadelOptionWithVotes, PadelVoteStatus } from "@/types/padel";
import { Calendar, Clock, MapPin } from "lucide-react";
import { cn, mobileCardTopAccent, mobilePrimaryCtaRing } from "@/lib/utils";

function formatOptionWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sortedNicknames(votes: PadelOptionWithVotes["votes"], status: PadelVoteStatus): string[] {
  return votes
    .filter((v) => v.vote_status === status)
    .map((v) => v.nickname)
    .sort((a, b) => a.localeCompare(b, "pl"));
}

export interface PadelOptionCardProps {
  option: PadelOptionWithVotes;
  onVote: (status: PadelVoteStatus) => void;
  /** True while any vote request is in progress (all options locked). */
  voteLocked: boolean;
}

export function PadelOptionCard({ option, onVote, voteLocked }: PadelOptionCardProps) {
  const votes = option.votes;
  const fitsCount = countFits(votes);
  const complete = isPadelOptionComplete(votes);
  const fitsNames = sortedNicknames(votes, "fits");
  const doesntNames = sortedNicknames(votes, "doesnt_fit");

  return (
    <Card
      className={cn(
        "bg-gradient-card border-border/80 p-5 sm:p-6 space-y-4",
        mobileCardTopAccent,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-foreground">
            <MapPin className="size-4 shrink-0 text-primary" />
            <h3 className="font-display text-xl font-bold break-words">{option.venue_name}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 capitalize">
              <Calendar className="size-3.5 shrink-0" />
              {formatOptionWhen(option.starts_at)}
            </span>
            {option.duration_minutes != null && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 shrink-0" />
                {option.duration_minutes} min
              </span>
            )}
          </div>
          {option.price_per_person && (
            <p className="text-sm font-medium text-foreground">{option.price_per_person}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-display text-lg font-bold tabular-nums max-sm:text-primary">
            {fitsCount}
            <span className="text-muted-foreground font-normal max-sm:text-primary/70">
              /4
            </span>
          </span>
          {complete && (
            <Badge className="font-display uppercase tracking-wider border-success/60 bg-success/15 text-success">
              KOMPLET
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          className={cn(
            "font-display uppercase tracking-wider flex-1",
            mobilePrimaryCtaRing,
          )}
          disabled={voteLocked}
          onClick={() => onVote("fits")}
        >
          Pasuje
        </Button>
        <Button
          type="button"
          variant="outline"
          className="font-display uppercase tracking-wider flex-1"
          disabled={voteLocked}
          onClick={() => onVote("doesnt_fit")}
        >
          Nie pasuje
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
        <div>
          <p className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1.5">
            Pasuje
          </p>
          {fitsNames.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <ul className="text-sm space-y-0.5">
              {fitsNames.map((n) => (
                <li key={n} className="break-words">
                  {n}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1.5">
            Nie pasuje
          </p>
          {doesntNames.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <ul className="text-sm space-y-0.5">
              {doesntNames.map((n) => (
                <li key={n} className="break-words">
                  {n}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
