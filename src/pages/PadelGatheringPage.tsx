import { Card } from "@/components/ui/card";
import { getPadelGatheringBySlug } from "@/lib/padelRepository";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { PadelGathering } from "@/types/padel";

const PadelGatheringPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [gathering, setGathering] = useState<PadelGathering | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    (async () => {
      try {
        const g = await getPadelGatheringBySlug(slug);
        if (active) setGathering(g);
      } catch {
        if (active) setGathering(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (gathering) document.title = `${gathering.title} — Padel — Zbieraj się!`;
  }, [gathering]);

  if (gathering === undefined) {
    return (
      <main className="min-h-screen">
        <div className="container max-w-2xl px-4 py-10">
          <div className="animate-pulse h-40 rounded-lg bg-secondary/40 border border-border/60" />
        </div>
      </main>
    );
  }

  if (!gathering) {
    return (
      <main className="min-h-screen">
        <div className="container max-w-2xl px-4 py-10">
          <Link
            to="/padel"
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Zbiórki padla
          </Link>
          <Card className="bg-gradient-card border-border/80 p-8 mt-8 text-center">
            <h1 className="font-display text-2xl font-bold">Nie znaleziono zbiórki</h1>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl px-4 py-10">
        <Link
          to="/padel"
          className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
        >
          ← Zbiórki padla
        </Link>
        <Card className="bg-gradient-card border-border/80 p-8 mt-8">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">{gathering.title}</h1>
          {gathering.description && (
            <p className="mt-4 text-muted-foreground whitespace-pre-wrap">{gathering.description}</p>
          )}
        </Card>
      </div>
    </main>
  );
};

export default PadelGatheringPage;
