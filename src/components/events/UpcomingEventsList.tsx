import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUpcomingEvents, type UpcomingEventListItem } from "@/lib/eventRepository";
import type { CsMode } from "@/types/event";
import { toast } from "sonner";

const MODE_LABELS: Record<CsMode, string> = {
  faceit: "Faceit",
  premier: "Premier",
  mix10: "MIX10",
};

const MODE_BADGE_VARIANT: Record<CsMode, "modeFaceit" | "modePremier" | "modeMix10"> = {
  faceit: "modeFaceit",
  premier: "modePremier",
  mix10: "modeMix10",
};

const sectionClass = "mt-0 space-y-4";

type UpcomingEventsListProps = {
  onExpandCreate?: () => void;
};

export function UpcomingEventsList({ onExpandCreate }: UpcomingEventsListProps) {
  const [items, setItems] = useState<UpcomingEventListItem[] | null>(null);

  useEffect(() => {
    let active = true;
    const load = async (isInitial: boolean) => {
      try {
        const data = await getUpcomingEvents();
        if (!active) return;
        setItems(data);
      } catch (err) {
        console.error(err);
        if (!active) return;
        if (isInitial) {
          setItems([]);
          toast.error("Nie udało się wczytać zbiórek");
        }
      }
    };
    void load(true);
    const id = window.setInterval(() => {
      void load(false);
    }, 30_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  if (items === null) {
    return (
      <section className={sectionClass} aria-busy="true">
        <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide">
          Nadchodzące zbiórki
        </h2>
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={sectionClass}>
        <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide">
          Nadchodzące zbiórki
        </h2>
        <Card className="bg-gradient-card border-border/80 p-6 sm:p-8 text-center space-y-4">
          <h3 className="font-display text-lg sm:text-xl font-bold leading-snug">
            Nie ma jeszcze żadnych nadchodzących zbiórek
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Utwórz pierwszą zbiórkę i wrzuć link na grupę.
          </p>
          {onExpandCreate && (
            <Button
              type="button"
              size="lg"
              className="w-full max-w-xs mx-auto font-display uppercase tracking-wider"
              onClick={onExpandCreate}
            >
              + Utwórz pierwszą zbiórkę
            </Button>
          )}
        </Card>
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide">
        Nadchodzące zbiórki
      </h2>
      <ul className="space-y-3">
        {items.map((event) => {
          const starts = new Date(event.starts_at);
          const dateStr = starts.toLocaleString("pl-PL", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });
          const playing = event.playingCount;
          const max = event.max_players;
          const missing = Math.max(0, max - playing);

          return (
            <li key={event.id}>
              <Link to={`/e/${event.public_slug}`} className="block group">
                <Card className="bg-gradient-card border-border/80 p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-glow">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={MODE_BADGE_VARIANT[event.cs_mode]}
                          className="font-display uppercase tracking-wider"
                        >
                          {MODE_LABELS[event.cs_mode]}
                        </Badge>
                      </div>
                      <h3 className="font-display text-lg font-bold leading-tight break-words group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">{dateStr}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
                        <span className="inline-flex items-center rounded-md border border-primary/45 bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                          {playing}/{max} graczy
                        </span>
                        <span className="inline-flex items-center rounded-md border border-border/80 bg-secondary/55 px-2.5 py-1 text-muted-foreground">
                          {missing > 0 ? `Brakuje ${missing}` : "Komplet ✓"}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center justify-center rounded-md border border-border/80 bg-secondary/45 px-4 py-2 text-sm font-display uppercase tracking-wider text-foreground transition-colors group-hover:border-primary/45 group-hover:bg-secondary/75">
                      Otwórz
                    </span>
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
