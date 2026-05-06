import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crosshair } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  useEffect(() => {
    document.title = "Zbieraj się!";
  }, []);

  return (
    <main className="min-h-screen">
      <div className="container max-w-4xl px-4 py-10 sm:py-14">
        <header className="text-center mb-10 sm:mb-12">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Zbieraj <span className="text-gradient-primary">się!</span>
          </h1>
          <div className="mx-auto mt-4 h-px w-36 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <Card className="bg-gradient-card border-border/80 p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="size-14 shrink-0 rounded-xl bg-gradient-primary grid place-items-center shadow-glow ring-1 ring-primary/50">
                <Crosshair className="size-7 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide">
                CS2
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <Button asChild className="flex-1 font-display uppercase tracking-wider h-11 sm:h-12 text-base">
                <Link to="/cs2?create=1">Utwórz zbiórkę</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 font-display uppercase tracking-wider h-11 sm:h-12 text-base">
                <Link to="/cs2">Zobacz zbiórki</Link>
              </Button>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/80 p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="size-14 shrink-0 rounded-xl bg-gradient-primary grid place-items-center shadow-glow ring-1 ring-primary/50 text-3xl leading-none">
                🎾
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide">
                Padel
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <Button asChild className="flex-1 font-display uppercase tracking-wider h-11 sm:h-12 text-base">
                <Link to="/padel/new">Utwórz zbiórkę</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 font-display uppercase tracking-wider h-11 sm:h-12 text-base">
                <Link to="/padel">Zobacz zbiórki</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
