import { Card } from "@/components/ui/card";
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
        <Card className="bg-gradient-card border-border/80 p-8 mt-8 text-center">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Padel</h1>
        </Card>
      </div>
    </main>
  );
};

export default PadelPage;
