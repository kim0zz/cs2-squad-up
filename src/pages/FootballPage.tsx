import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FootballSeriesList } from "@/components/football/FootballSeriesList";
import { getFootballOccurrences, getFootballSeriesList } from "@/lib/footballRepository";
import type { FootballSeries } from "@/types/football";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn, mobilePrimaryCtaRing } from "@/lib/utils";

const FootballPage = () => {
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [seriesList, setSeriesList] = useState<FootballSeries[]>([]);
  const [nextOccurrenceBySeriesId, setNextOccurrenceBySeriesId] = useState<Record<string, string | null>>(
    {},
  );

  useEffect(() => {
    document.title = "Piłka — Zbieraj się!";
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setPhase("loading");
      try {
        const loadedSeries = await getFootballSeriesList();
        if (!active) return;
        const entries = await Promise.all(
          loadedSeries.map(async (series) => {
            const occurrences = await getFootballOccurrences(series.id);
            const next = occurrences.find((occurrence) => occurrence.status === "open");
            return [series.id, next?.starts_at ?? null] as const;
          }),
        );
        if (!active) return;
        setSeriesList(loadedSeries);
        setNextOccurrenceBySeriesId(Object.fromEntries(entries));
      } catch (error) {
        console.error(error);
        if (!active) return;
        setSeriesList([]);
        setNextOccurrenceBySeriesId({});
      } finally {
        if (active) setPhase("ready");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const listItems = useMemo(
    () =>
      seriesList.map((series) => ({
        series,
        nextOccurrenceStartsAt: nextOccurrenceBySeriesId[series.id] ?? null,
      })),
    [seriesList, nextOccurrenceBySeriesId],
  );

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
        >
          ← Strona główna
        </Link>

        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-gradient-primary grid place-items-center text-xl leading-none shadow-glow ring-1 ring-primary/50">
                ⚽
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide leading-none">
                Zbiórki piłkarskie
              </h1>
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
              <Button
                asChild
                variant="outline"
                className="h-11 min-w-0 flex-1 font-display text-base uppercase tracking-wider sm:h-12 sm:flex-initial"
              >
                <Link to="/my">Moje zbiórki</Link>
              </Button>
              <Button
                asChild
                className={cn(
                  "h-11 min-w-0 flex-1 font-display text-base uppercase tracking-wider sm:h-12 sm:flex-initial",
                  mobilePrimaryCtaRing,
                )}
              >
                <Link to="/football/new">Utwórz zbiórkę</Link>
              </Button>
            </div>
          </div>

          {phase === "loading" ? (
            <Card className="bg-gradient-card border-border/80 p-6">
              <div className="h-20 animate-pulse rounded-md bg-secondary/40" />
            </Card>
          ) : listItems.length === 0 ? (
            <Card className="bg-gradient-card border-border/80 p-6 sm:p-8 space-y-4">
              <p className="text-muted-foreground">Nie ma jeszcze żadnych zbiórek piłkarskich</p>
              <Button
                asChild
                className="w-full sm:w-auto h-11 font-display uppercase tracking-wider"
              >
                <Link to="/football/new">Utwórz pierwszą zbiórkę</Link>
              </Button>
            </Card>
          ) : (
            <FootballSeriesList items={listItems} />
          )}
        </div>
      </div>
    </main>
  );
};

export default FootballPage;
