import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const FootballNewPage = () => {
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

        <Card className="bg-gradient-card border-border/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md bg-gradient-primary grid place-items-center text-xl leading-none shadow-glow ring-1 ring-primary/50">
              ⚽
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide leading-none">
              Utwórz zbiórkę piłkarską
            </h1>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Formularz piłki będzie dostępny wkrótce.
          </p>
        </Card>
      </div>
    </main>
  );
};

export default FootballNewPage;
