import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getOpenPadelGatheringsList } from "@/lib/padelRepository";
import { cn, mobileCardTopAccent, mobilePrimaryCtaRing } from "@/lib/utils";
import type { PadelGatheringListItem } from "@/types/padel";
import { toast } from "sonner";

const sectionClass = "mt-0 space-y-4";

const NEXT_TERMIN_FORMATTER = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function formatNextTerminLabel(iso: string): string {
  return NEXT_TERMIN_FORMATTER.format(new Date(iso));
}

function variantsLabel(n: number): string {
  if (n === 0) return "0 wariantów";
  if (n === 1) return "1 wariant";
  return `${n} warianty`;
}

function summaryText(item: PadelGatheringListItem): string {
  if (item.hasCompleteOption) return "Jest komplet";
  return `Najbliżej kompletu: ${item.maxFitsCount}/4`;
}

export function UpcomingPadelGatheringsList() {
  const [items, setItems] = useState<PadelGatheringListItem[] | null>(null);

  useEffect(() => {
    let active = true;
    const load = async (isInitial: boolean) => {
      try {
        const data = await getOpenPadelGatheringsList();
        if (!active) return;
        setItems(data);
      } catch (err) {
        console.error(err);
        if (!active) return;
        if (isInitial) {
          setItems([]);
          toast.error("Nie udało się wczytać zbiórek padla");
        }
      }
    };
    void load(true);
    const id = window.setInterval(() => {
      void load(false);
    }, 30_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  const headerRow = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide">
        Zbiórki padla
      </h2>
      <Button
        asChild
        className={cn(
          "font-display uppercase tracking-wider w-full sm:w-auto shrink-0",
          mobilePrimaryCtaRing,
        )}
      >
        <Link to="/padel/new">Utwórz zbiórkę</Link>
      </Button>
    </div>
  );

  if (items === null) {
    return (
      <section className={sectionClass} aria-busy="true">
        {headerRow}
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={sectionClass}>
        {headerRow}
        <Card className="bg-gradient-card border-border/80 p-6 sm:p-8 text-center space-y-4">
          <h3 className="font-display text-lg sm:text-xl font-bold leading-snug">
            Nie ma jeszcze żadnych zbiórek padla
          </h3>
          <Button
            asChild
            size="lg"
            className={cn(
              "w-full max-w-xs mx-auto font-display uppercase tracking-wider",
              mobilePrimaryCtaRing,
            )}
          >
            <Link to="/padel/new">Utwórz pierwszą zbiórkę</Link>
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      {headerRow}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={`/padel/${item.public_slug}`} className="block group">
              <Card
                className={cn(
                  "bg-gradient-card border-border/80 p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-glow",
                  mobileCardTopAccent,
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <span className="inline-flex w-fit rounded-md border border-primary/35 bg-primary/[0.07] px-2 py-0.5 text-[10px] font-display font-semibold uppercase tracking-wider text-primary/90 sm:border-border/60 sm:bg-transparent sm:text-muted-foreground">
                      Padel
                    </span>
                    <h3 className="font-display text-lg font-bold leading-tight break-words group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.nextStartsAt != null && (
                      <p className="text-sm text-muted-foreground">
                        Najbliższy termin: {formatNextTerminLabel(item.nextStartsAt)}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">{variantsLabel(item.optionsCount)}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
                      <span className="inline-flex items-center rounded-md border border-primary/55 bg-primary/[0.12] px-2.5 py-1 font-semibold text-primary sm:border-primary/45 sm:bg-primary/10">
                        {summaryText(item)}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center justify-center rounded-md border border-border/80 bg-secondary/45 px-4 py-2 text-sm font-display uppercase tracking-wider text-foreground transition-colors group-hover:border-primary/45 group-hover:bg-secondary/75">
                    Otwórz
                  </span>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
