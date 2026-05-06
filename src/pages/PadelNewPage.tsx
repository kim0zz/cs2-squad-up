import { CreatePadelGatheringForm } from "@/components/padel/CreatePadelGatheringForm";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const PadelNewPage = () => {
  useEffect(() => {
    document.title = "Nowa zbiórka — Padel — Zbieraj się!";
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
            to="/padel"
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Zbiórki padla
          </Link>
        </div>
        <CreatePadelGatheringForm />
      </div>
    </main>
  );
};

export default PadelNewPage;
