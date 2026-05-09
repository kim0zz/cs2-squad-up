import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Crosshair } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const sportCardLinkClass =
  "group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const sportCardClass =
  "bg-gradient-card border-border/80 flex h-full min-h-[7.5rem] flex-col justify-center p-6 sm:min-h-[8.5rem] sm:p-8 transition-[border-color,box-shadow,transform] duration-200 group-hover:border-primary/45 group-hover:shadow-glow group-hover:shadow-primary/15 group-active:scale-[0.99]";

const HomePage = () => {
  useEffect(() => {
    document.title = "Zbieraj się!";
  }, []);

  return (
    <main className="min-h-screen">
      <div className="container max-w-5xl px-4 py-12 sm:py-14">
        <header className="mb-10 text-center sm:mb-12">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Zbieraj <span className="text-gradient-primary">się!</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Jednym kliknięciem dołączasz. Utwórz nową, gdy potrzebujesz.
          </p>
          <div className="mx-auto mt-4 h-px w-36 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </header>

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-6 lg:gap-8">
          <Link to="/cs2" className={sportCardLinkClass}>
            <Card className={cn(sportCardClass)}>
              <div className="flex min-h-14 shrink-0 items-center gap-4">
                <div className="size-14 shrink-0 rounded-xl bg-gradient-primary grid place-items-center shadow-glow ring-1 ring-primary/50">
                  <Crosshair className="size-7 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide leading-none sm:text-3xl">
                  CS2
                </h2>
              </div>
            </Card>
          </Link>

          <Link to="/padel" className={sportCardLinkClass}>
            <Card className={cn(sportCardClass)}>
              <div className="flex min-h-14 shrink-0 items-center gap-4">
                <div className="size-14 shrink-0 rounded-xl bg-gradient-primary grid place-items-center text-3xl leading-none shadow-glow ring-1 ring-primary/50">
                  🎾
                </div>
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide leading-none sm:text-3xl">
                  Padel
                </h2>
              </div>
            </Card>
          </Link>

          <Link to="/football" className={sportCardLinkClass}>
            <Card className={cn(sportCardClass)}>
              <div className="flex min-h-14 shrink-0 items-center gap-4">
                <div className="size-14 shrink-0 rounded-xl bg-gradient-primary grid place-items-center text-3xl leading-none shadow-glow ring-1 ring-primary/50">
                  ⚽
                </div>
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide leading-none sm:text-3xl">
                  Piłka
                </h2>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
