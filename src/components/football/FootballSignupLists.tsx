import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-4">
      <Card className="space-y-3 border-border/80 bg-gradient-card p-4 sm:p-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-emerald-400/90 border-b border-border/50 pb-2">
          Grają
        </h3>
        {playing.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {playing.map((signup) => (
              <li key={signup.id} className="break-words">
                {signup.nickname}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-3 border-border/80 bg-gradient-card p-4 sm:p-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-400/90 border-b border-border/50 pb-2">
          Rezerwa
        </h3>
        {waitlist.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {waitlist.map((signup) => (
              <li key={signup.id} className="break-words">
                {signup.nickname}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-3 border-border/80 bg-gradient-card p-4 sm:p-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-red-400/85 border-b border-border/50 pb-2">
          Nie grają
        </h3>
        {notPlaying.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {notPlaying.map((signup) => (
              <li key={signup.id} className="break-words">
                {signup.nickname}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-3 border-border/80 bg-gradient-card p-4 sm:p-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground border-b border-border/50 pb-2">
          Stali bez decyzji
        </h3>
        <p className="text-xs text-muted-foreground">Stały dał znać? Oznacz go szybko.</p>
        {regularWithoutDecision.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {regularWithoutDecision.map((regular) => (
              <li
                key={regular.id}
                className="flex flex-row items-start justify-between gap-3 rounded-md border border-border/70 bg-secondary/25 px-3 py-3"
              >
                <span className="min-w-0 flex-1 break-words leading-snug">{regular.nickname}</span>
                <div className="flex shrink-0 flex-col gap-2 self-start">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={signupsDisabled || busyNickname === regular.nickname}
                    onClick={() => void onAdminDecision(regular.nickname, "playing")}
                    className="w-[5.5rem] font-display uppercase tracking-wide text-xs sm:text-sm"
                  >
                    Gram
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={signupsDisabled || busyNickname === regular.nickname}
                    onClick={() => void onAdminDecision(regular.nickname, "not_playing")}
                    className="w-[5.5rem] font-display uppercase tracking-wide text-xs sm:text-sm"
                  >
                    Nie gra
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
