import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export function OrganizerAuthNav() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="max-w-[200px] truncate text-xs text-muted-foreground sm:text-sm">
          {user.email}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="font-display uppercase tracking-wide"
          onClick={() => void signOut()}
        >
          Wyloguj
        </Button>
      </div>
    );
  }

  return (
    <Link
      to="/login"
      className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-xs font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75 sm:text-sm"
    >
      Logowanie organizatora
    </Link>
  );
}
