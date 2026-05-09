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
      <div className="container max-w-5xl px-4 py-12 sm:py-14">
        <header className="text-center mb-10 sm:mb-12">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Zbieraj <span className="text-gradient-primary">się!</span>
          </h1>
          <div className="mx-auto mt-4 h-px w-36 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </header>

        <div className="grid grid-cols-1 items-stretch gap-10 md:grid-cols-3 md:gap-6 lg:gap-8">
          <Card className="bg-gradient-card border-border/80 flex h-full min-h-0 flex-col gap-8 p-6 sm:p-8">
            <div className="flex min-h-14 shrink-0 items-center gap-4">
              <div className="size-14 shrink-0 rounded-xl bg-gradient-primary grid place-items-center shadow-glow ring-1 ring-primary/50">
                <Crosshair className="size-7 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide leading-none">
                CS2
              </h2>
            </div>
            <div className="mt-auto flex w-full flex-col gap-3">
              <Button
                asChild
                className="h-11 w-full min-w-0 font-display text-base uppercase tracking-wider sm:h-12"
              >
                <Link to="/cs2?create=1">Utwórz zbiórkę</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 w-full min-w-0 font-display text-base uppercase tracking-wider sm:h-12"
              >
                <Link to="/cs2">Zobacz zbiórki</Link>
              </Button>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/80 flex h-full min-h-0 flex-col gap-8 p-6 sm:p-8">
            <div className="flex min-h-14 shrink-0 items-center gap-4">
              <div className="size-14 shrink-0 rounded-xl bg-gradient-primary grid place-items-center text-3xl leading-none shadow-glow ring-1 ring-primary/50">
                🎾
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide leading-none">
                Padel
              </h2>
            </div>
            <div className="mt-auto flex w-full flex-col gap-3">
              <Button
                asChild
                className="h-11 w-full min-w-0 font-display text-base uppercase tracking-wider sm:h-12"
              >
                <Link to="/padel/new">Utwórz zbiórkę</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 w-full min-w-0 font-display text-base uppercase tracking-wider sm:h-12"
              >
                <Link to="/padel">Zobacz zbiórki</Link>
              </Button>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/80 flex h-full min-h-0 flex-col gap-8 p-6 sm:p-8">
            <div className="flex min-h-14 shrink-0 items-center gap-4">
              <div className="size-14 shrink-0 rounded-xl bg-gradient-primary grid place-items-center text-3xl leading-none shadow-glow ring-1 ring-primary/50">
                ⚽
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide leading-none">
                Piłka
              </h2>
            </div>
            <div className="mt-auto flex w-full flex-col gap-3">
              <Button
                asChild
                className="h-11 w-full min-w-0 font-display text-base uppercase tracking-wider sm:h-12"
              >
                <Link to="/football/new">Utwórz zbiórkę</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 w-full min-w-0 font-display text-base uppercase tracking-wider sm:h-12"
              >
                <Link to="/football">Zobacz zbiórki</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
