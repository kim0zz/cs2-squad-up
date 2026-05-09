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
          <Card key={series.id} className="border-border/80 bg-gradient-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h2 className="font-display text-xl font-bold uppercase tracking-wide">
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

              <Link
                to={`/football/${series.public_slug}`}
                className="inline-flex h-10 items-center justify-center rounded-md border border-border/80 bg-secondary/45 px-4 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
              >
                Otwórz
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
