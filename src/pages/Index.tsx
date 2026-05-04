import { CreateEventForm } from "@/components/events/CreateEventForm";
import { Crosshair } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Zbieraj się! — Organizuj sesje CS2";
    const meta = document.querySelector('meta[name="description"]');
    const content = "Zbieraj się! — proste organizowanie sesji Counter-Strike 2 z ekipą. Twórz zbiórki, dziel się linkiem na Discordzie i Messengerze.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description"; m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl py-8 sm:py-16">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="size-12 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Crosshair className="size-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl font-bold uppercase tracking-widest">CS2</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight mb-3">
            Zbieraj <span className="text-gradient-primary">się!</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Utwórz zbiórkę, wyślij link ekipie na Discordzie. Każdy klika "Gram" — koniec scrollowania czatu.
          </p>
        </header>

        <CreateEventForm />
      </div>
    </main>
  );
};

export default Index;
