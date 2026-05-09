import { CreateFootballSeriesForm } from "@/components/football/CreateFootballSeriesForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const FootballNewPage = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = "Nowa zbiórka — Piłka — Zbieraj się!";
  }, []);

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl px-4 py-10">
        <div className="flex flex-wrap gap-2 mb-6">
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

        {loading ? (
          <Card className="border-border/80 bg-gradient-card p-6">
            <div className="h-24 animate-pulse rounded-md bg-secondary/40" />
          </Card>
        ) : user ? (
          <CreateFootballSeriesForm />
        ) : (
          <Card className="border-border/80 bg-gradient-card p-6 sm:p-8 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Zaloguj się, żeby utworzyć zbiórkę piłkarską.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Gracze nadal mogą zapisywać się bez konta.
            </p>
            <Button asChild className="font-display uppercase tracking-wide">
              <Link to="/login">Przejdź do logowania</Link>
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
};

export default FootballNewPage;
