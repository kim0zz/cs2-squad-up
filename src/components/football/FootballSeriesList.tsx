import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import type { FootballSeries } from "@/types/football";

interface FootballSeriesListItem {
  series: FootballSeries;
  nextOccurrenceStartsAt: string | null;
}

interface FootballSeriesListProps {
  items: FootballSeriesListItem[];
}

const WEEKDAY_LABELS: ReadonlyArray<string> = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];

const DATE_FORMATTER = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function FootballSeriesList({ items }: FootballSeriesListProps) {
  return (
    <div className="space-y-4">
      {items.map(({ series, nextOccurrenceStartsAt }) => {
        const weekdayLabel = WEEKDAY_LABELS[series.weekday] ?? "Nieznany dzień";
        return (
          <Link
            key={series.id}
            to={`/football/${series.public_slug}`}
            className="block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Card className="border-border/80 bg-gradient-card p-5 sm:p-6 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/55 group-hover:shadow-glow">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2 min-w-0 flex-1">
                  <h2 className="font-display text-xl font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
                    {series.title}
                  </h2>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Miejsce:</span> {series.location}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Dzień i godzina:</span> {weekdayLabel},{" "}
                    {series.start_time}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Max graczy:</span> {series.max_players}
                  </p>
                  {nextOccurrenceStartsAt && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Najbliższy termin:</span>{" "}
                      {DATE_FORMATTER.format(new Date(nextOccurrenceStartsAt))}
                    </p>
                  )}
                </div>

                <span className="inline-flex shrink-0 items-center justify-center rounded-md border border-border/80 bg-secondary/45 px-4 py-2 text-sm font-display uppercase tracking-wider text-foreground transition-colors group-hover:border-primary/45 group-hover:bg-secondary/75">
                  Otwórz
                </span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
