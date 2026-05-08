import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const FootballOccurrencePage = () => {
  const { slug, occurrenceId } = useParams<{ slug: string; occurrenceId: string }>();

  useEffect(() => {
    document.title = "Termin zbiórki — Piłka — Zbieraj się!";
  }, []);

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/football"
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Zbiórki piłkarskie
          </Link>
          {slug && (
            <Link
              to={`/football/${slug}`}
              className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
            >
              ← Cykl
            </Link>
          )}
        </div>

        <Card className="bg-gradient-card border-border/80 p-6 sm:p-8 mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md bg-gradient-primary grid place-items-center text-xl leading-none shadow-glow ring-1 ring-primary/50">
              ⚽
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide leading-none">
              Termin zbiórki
            </h1>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Szczegóły pojedynczego terminu pojawią się tutaj wkrótce.
          </p>
          {(slug || occurrenceId) && (
            <div className="space-y-1 text-xs font-display uppercase tracking-widest text-muted-foreground">
              {slug && (
                <p>
                  Slug: <span className="text-foreground/80">{slug}</span>
                </p>
              )}
              {occurrenceId && (
                <p>
                  Termin: <span className="text-foreground/80">{occurrenceId}</span>
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
};

export default FootballOccurrencePage;
