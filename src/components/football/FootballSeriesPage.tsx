import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  getFootballOccurrences,
  getFootballSeriesBySlug,
  getFootballSignupsForOccurrences,
} from "@/lib/footballRepository";
import type { FootballOccurrence, FootballSeries, FootballSignup } from "@/types/football";
import { FootballOccurrencesList } from "./FootballOccurrencesList";

const WEEKDAY_LABELS: ReadonlyArray<string> = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];

function formatDeadline(hours: number): string {
  if (hours === 1) return "1 godzinę przed grą";
  if (hours >= 2 && hours <= 4) return `${hours} godziny przed grą`;
  return `${hours} godzin przed grą`;
}

export function FootballSeriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [phase, setPhase] = useState<"loading" | "notfound" | "ready">("loading");
  const [series, setSeries] = useState<FootballSeries | null>(null);
  const [occurrences, setOccurrences] = useState<FootballOccurrence[]>([]);
  const [signups, setSignups] = useState<FootballSignup[]>([]);

  useEffect(() => {
    if (!slug) {
      setPhase("notfound");
      return;
    }
    let active = true;
    (async () => {
      setPhase("loading");
      try {
        const loadedSeries = await getFootballSeriesBySlug(slug);
        if (!active) return;
        if (!loadedSeries) {
          setSeries(null);
          setOccurrences([]);
          setSignups([]);
          setPhase("notfound");
          return;
        }

        const loadedOccurrences = await getFootballOccurrences(loadedSeries.id);
        if (!active) return;
        const openOccurrences = loadedOccurrences.filter(
          (occurrence) => occurrence.status === "open",
        );

        const loadedSignups = await getFootballSignupsForOccurrences(
          openOccurrences.map((occurrence) => occurrence.id),
        );
        if (!active) return;

        setSeries(loadedSeries);
        setOccurrences(openOccurrences);
        setSignups(loadedSignups);
        setPhase("ready");
      } catch (error) {
        console.error(error);
        if (!active) return;
        setSeries(null);
        setOccurrences([]);
        setSignups([]);
        setPhase("notfound");
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (phase === "ready" && series) {
      document.title = `${series.title} — Piłka — Zbieraj się!`;
      return;
    }
    document.title = "Cykl zbiórek — Piłka — Zbieraj się!";
  }, [phase, series]);

  const adminToken = searchParams.get("admin");
  const weekdayTimeLabel = useMemo(() => {
    if (!series) return "";
    const weekday = WEEKDAY_LABELS[series.weekday] ?? "Nieznany dzień";
    return `${weekday}, ${series.start_time}`;
  }, [series]);

  if (phase === "loading") {
    return (
      <main className="min-h-screen">
        <div className="container max-w-2xl px-4 py-10">
          <div className="h-40 animate-pulse rounded-lg border border-border/60 bg-secondary/40" />
        </div>
      </main>
    );
  }

  if (phase === "notfound" || !series) {
    return (
      <main className="min-h-screen">
        <div className="container max-w-2xl px-4 py-10">
          <Link
            to="/football"
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Zbiórki piłkarskie
          </Link>
          <Card className="mt-8 border-border/80 bg-gradient-card p-8 text-center">
            <h1 className="font-display text-2xl font-bold">Nie znaleziono cyklu</h1>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl space-y-6 px-4 py-10">
        <Link
          to="/football"
          className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
        >
          ← Zbiórki piłkarskie
        </Link>

        <Card className="space-y-4 border-border/80 bg-gradient-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-gradient-primary text-xl leading-none shadow-glow ring-1 ring-primary/50">
              ⚽
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
              {series.title}
            </h1>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Miejsce:</span> {series.location}
            </p>
            <p>
              <span className="text-muted-foreground">Dzień i godzina:</span> {weekdayTimeLabel}
            </p>
            <p>
              <span className="text-muted-foreground">Max graczy:</span> {series.max_players}
            </p>
            <p>
              <span className="text-muted-foreground">Deadline stałych:</span>{" "}
              {formatDeadline(series.regular_deadline_hours_before)}
            </p>
          </div>
        </Card>

        <Card className="space-y-4 border-border/80 bg-gradient-card p-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            Nadchodzące terminy
          </h2>
          <FootballOccurrencesList
            occurrences={occurrences}
            signups={signups}
            maxPlayers={series.max_players}
            seriesSlug={series.public_slug}
            adminToken={adminToken}
          />
        </Card>
      </div>
    </main>
  );
}
