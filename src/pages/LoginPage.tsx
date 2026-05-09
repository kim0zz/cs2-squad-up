import { OrganizerAuthNav } from "@/components/OrganizerAuthNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Google provider must be enabled in Supabase Auth settings (Authentication → Providers).

const LoginPage = () => {
  const { user, loading } = useAuth();
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    document.title = "Logowanie — Zbieraj się!";
  }, []);

  const signInWithGoogle = async () => {
    setOauthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się rozpocząć logowania Google");
      setOauthLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="container max-w-lg px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Strona główna
          </Link>
          <OrganizerAuthNav />
        </div>

        <Card className="border-border/80 bg-gradient-card p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
            Logowanie organizatora
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Zaloguj się, żeby tworzyć i zarządzać swoimi zbiórkami. Gracze nie potrzebują konta.
          </p>

          {!loading && user && (
            <p className="mt-4 text-sm font-medium">Jesteś zalogowany jako {user.email}.</p>
          )}

          <div className="mt-8">
            <Button
              type="button"
              disabled={oauthLoading || Boolean(user)}
              className="w-full font-display uppercase tracking-wide sm:w-auto"
              size="lg"
              onClick={() => void signInWithGoogle()}
            >
              Zaloguj przez Google
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default LoginPage;
