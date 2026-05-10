import { CreateEventForm } from "@/components/events/CreateEventForm";
import { UpcomingEventsList } from "@/components/events/UpcomingEventsList";
import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn, mobilePrimaryCtaRing } from "@/lib/utils";

const Cs2Page = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const createFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "1") {
      setIsCreateFormOpen(true);
    }
  }, []);

  useEffect(() => {
    document.title = "Zbieraj się! — Organizuj sesje CS2";
    const meta = document.querySelector('meta[name="description"]');
    const content =
      "Zbieraj się! — proste organizowanie sesji Counter-Strike 2 z ekipą. Twórz zbiórki, dziel się linkiem na Discordzie i Messengerze.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
    if (!isCreateFormOpen) return;
    const scrollToForm = () =>
      createFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToForm);
    });
    // Re-align once the async events list has rendered and layout settled,
    // otherwise the initial scroll lands above the form (the list pushes it down).
    const timeout = window.setTimeout(scrollToForm, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [isCreateFormOpen]);

  const openCreateForm = () => setIsCreateFormOpen(true);

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl px-4 py-6 sm:py-10">
        <Link
          to="/"
          className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75 mb-6"
        >
          ← Wybierz sport
        </Link>

        <header className="text-center mb-7 sm:mb-8">
          <div className="inline-flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <div className="size-11 shrink-0 rounded-lg bg-gradient-primary grid place-items-center shadow-glow ring-1 ring-primary/50 sm:size-12">
              <Crosshair className="size-5 text-primary-foreground sm:size-6" strokeWidth={2.5} />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Zbieraj <span className="text-gradient-primary">się!</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mt-3 leading-relaxed">
            Nadchodzące zbiórki CS2 — jednym kliknięciem dołączasz. Utwórz nową, gdy potrzebujesz.
          </p>
          <div className="mx-auto mt-4 h-px w-36 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </header>

        <div className="flex justify-center mb-6 sm:mb-8">
          <Button
            type="button"
            size="lg"
            variant={isCreateFormOpen ? "outline" : "default"}
            className={cn(
              isCreateFormOpen
                ? "font-display uppercase tracking-wider"
                : "w-full max-w-sm font-display uppercase tracking-wider sm:w-auto",
              !isCreateFormOpen && mobilePrimaryCtaRing,
            )}
            onClick={() => setIsCreateFormOpen((open) => !open)}
          >
            {isCreateFormOpen ? "Ukryj formularz" : "+ Utwórz zbiórkę"}
          </Button>
        </div>

        <UpcomingEventsList onExpandCreate={openCreateForm} />

        {isCreateFormOpen && (
          <div ref={createFormRef} id="create-event-form" className="mt-8 scroll-mt-6">
            <CreateEventForm />
          </div>
        )}
      </div>
    </main>
  );
};

export default Cs2Page;
