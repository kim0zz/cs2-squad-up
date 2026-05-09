import { CreateFootballSeriesForm } from "@/components/football/CreateFootballSeriesForm";
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

        <CreateFootballSeriesForm />
      </div>
    </main>
  );
};

export default FootballNewPage;
