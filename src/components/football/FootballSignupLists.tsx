import { Button } from "@/components/ui/button";
import type { FootballRegularPlayer, FootballSignup } from "@/types/football";

interface FootballSignupListsProps {
  signups: FootballSignup[];
  regularPlayers: FootballRegularPlayer[];
  busyNickname: string | null;
  signupsDisabled?: boolean;
  onAdminDecision: (nickname: string, desiredStatus: "playing" | "not_playing") => Promise<void>;
}

function nickSort(a: { nickname: string }, b: { nickname: string }): number {
  return a.nickname.localeCompare(b.nickname, "pl", { sensitivity: "base" });
}

export function FootballSignupLists({
  signups,
  regularPlayers,
  busyNickname,
  signupsDisabled = false,
  onAdminDecision,
}: FootballSignupListsProps) {
  const playing = signups
    .filter((signup) => signup.response_status === "playing")
    .sort(nickSort);
  const waitlist = signups
    .filter((signup) => signup.response_status === "waitlist")
    .sort(nickSort);
  const notPlaying = signups
    .filter((signup) => signup.response_status === "not_playing")
    .sort(nickSort);

  const decidedSet = new Set(signups.map((signup) => signup.nickname.toLowerCase()));
  const regularWithoutDecision = regularPlayers
    .filter((regular) => !decidedSet.has(regular.nickname.toLowerCase()))
    .sort(nickSort);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="font-display text-sm uppercase tracking-wide text-muted-foreground">Grają</h3>
        {playing.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {playing.map((signup) => (
              <li key={signup.id}>{signup.nickname}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="font-display text-sm uppercase tracking-wide text-muted-foreground">Rezerwa</h3>
        {waitlist.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {waitlist.map((signup) => (
              <li key={signup.id}>{signup.nickname}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="font-display text-sm uppercase tracking-wide text-muted-foreground">Nie grają</h3>
        {notPlaying.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {notPlaying.map((signup) => (
              <li key={signup.id}>{signup.nickname}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="font-display text-sm uppercase tracking-wide text-muted-foreground">
          Stali bez decyzji
        </h3>
        <p className="text-xs text-muted-foreground">Stały dał znać? Oznacz go szybko.</p>
        {regularWithoutDecision.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {regularWithoutDecision.map((regular) => (
              <li
                key={regular.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-secondary/25 px-3 py-2"
              >
                <span>{regular.nickname}</span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={signupsDisabled || busyNickname === regular.nickname}
                    onClick={() => void onAdminDecision(regular.nickname, "playing")}
                    className="font-display uppercase tracking-wide"
                  >
                    Gram
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={signupsDisabled || busyNickname === regular.nickname}
                    onClick={() => void onAdminDecision(regular.nickname, "not_playing")}
                    className="font-display uppercase tracking-wide"
                  >
                    Nie gra
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
