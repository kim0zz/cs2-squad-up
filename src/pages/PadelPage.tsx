import { UpcomingPadelGatheringsList } from "@/components/padel/UpcomingPadelGatheringsList";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const PadelPage = () => {
  useEffect(() => {
    document.title = "Padel — Zbieraj się!";
  }, []);

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
        >
          ← Strona główna
        </Link>
        <div className="mt-8">
          <UpcomingPadelGatheringsList />
        </div>
      </div>
    </main>
  );
};

export default PadelPage;
