import { OrganizerAuthNav } from "@/components/OrganizerAuthNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const LoginPage = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = "Logowanie — Zbieraj się!";
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Podaj adres e-mail");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      setSent(true);
      toast.success("Link logowania został wysłany");
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się wysłać linku");
    } finally {
      setSending(false);
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

          {!sent ? (
            <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizer-email">E-mail</Label>
                <Input
                  id="organizer-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="organizator@example.com"
                  className="bg-secondary/40 border-border/80"
                  disabled={sending || Boolean(user)}
                />
              </div>
              <Button
                type="submit"
                disabled={sending || Boolean(user)}
                className="w-full font-display uppercase tracking-wide sm:w-auto"
              >
                Wyślij link logowania
              </Button>
            </form>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              Sprawdź skrzynkę e-mail i kliknij link, żeby dokończyć logowanie.
            </p>
          )}
        </Card>
      </div>
    </main>
  );
};

export default LoginPage;
