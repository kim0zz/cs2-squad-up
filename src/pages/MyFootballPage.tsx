import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getMyFootballSeries } from "@/lib/footballRepository";
import type { FootballSeries } from "@/types/football";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const WEEKDAY_LABELS: ReadonlyArray<string> = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];

const MyFootballPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [seriesList, setSeriesList] = useState<FootballSeries[]>([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    document.title = "Moje zbiórki — Zbieraj się!";
  }, []);

  useEffect(() => {
    if (!user) {
      setSeriesList([]);
      return;
    }
    let active = true;
    setListLoading(true);
    void getMyFootballSeries(user.id)
      .then((rows) => {
        if (active) setSeriesList(rows);
      })
      .catch((e) => {
        console.error(e);
        if (active) setSeriesList([]);
      })
      .finally(() => {
        if (active) setListLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl px-4 py-10 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Strona główna
          </Link>
          <Link
            to="/football"
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Zbiórki piłkarskie
          </Link>
        </div>

        {authLoading ? (
          <Card className="border-border/80 bg-gradient-card p-6">
            <div className="h-24 animate-pulse rounded-md bg-secondary/40" />
          </Card>
        ) : !user ? (
          <Card className="border-border/80 bg-gradient-card p-6 sm:p-8 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Zaloguj się, żeby zobaczyć swoje zbiórki.
            </p>
            <Button asChild className="font-display uppercase tracking-wide">
              <Link to="/login">Przejdź do logowania</Link>
            </Button>
          </Card>
        ) : (
          <>
            <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide">
              Moje zbiórki
            </h1>

            {listLoading ? (
              <Card className="border-border/80 bg-gradient-card p-6">
                <div className="h-20 animate-pulse rounded-md bg-secondary/40" />
              </Card>
            ) : seriesList.length === 0 ? (
              <Card className="border-border/80 bg-gradient-card p-6 text-sm text-muted-foreground">
                Nie masz jeszcze żadnych zbiórek.{" "}
                <Link to="/football/new" className="text-foreground underline underline-offset-2">
                  Utwórz zbiórkę
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {seriesList.map((series) => {
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
                            <span className="text-muted-foreground">Dzień i godzina:</span>{" "}
                            {weekdayLabel}, {series.start_time}
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Max graczy:</span>{" "}
                            {series.max_players}
                          </p>
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
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default MyFootballPage;
