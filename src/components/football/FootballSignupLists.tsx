import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";
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

function StatusIconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-secondary/80 hover:text-foreground disabled:opacity-40"
    >
      <span className="flex size-full items-center justify-center text-base leading-none" aria-hidden>
        {children}
      </span>
    </Button>
  );
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
          <ul className="divide-y divide-border/50 text-sm">
            {playing.map((signup) => (
              <li key={signup.id} className="flex items-start gap-2 py-1 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 break-words leading-tight">{signup.nickname}</span>
                <StatusIconButton
                  label="Nie gra"
                  disabled={signupsDisabled || busyNickname === signup.nickname}
                  onClick={() => void onAdminDecision(signup.nickname, "not_playing")}
                >
                  ×
                </StatusIconButton>
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
          <ul className="divide-y divide-border/50 text-sm">
            {waitlist.map((signup) => (
              <li key={signup.id} className="flex items-start gap-2 py-1 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 break-words leading-tight">{signup.nickname}</span>
                <StatusIconButton
                  label="Nie gra"
                  disabled={signupsDisabled || busyNickname === signup.nickname}
                  onClick={() => void onAdminDecision(signup.nickname, "not_playing")}
                >
                  ×
                </StatusIconButton>
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
          <ul className="divide-y divide-border/50 text-sm">
            {notPlaying.map((signup) => (
              <li key={signup.id} className="flex items-start gap-2 py-1 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 break-words leading-tight">{signup.nickname}</span>
                <StatusIconButton
                  label="Gra"
                  disabled={signupsDisabled || busyNickname === signup.nickname}
                  onClick={() => void onAdminDecision(signup.nickname, "playing")}
                >
                  ✓
                </StatusIconButton>
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
          <ul className="divide-y divide-border/50 text-sm">
            {regularWithoutDecision.map((regular) => (
              <li key={regular.id} className="flex items-start gap-2 py-1 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 break-words leading-tight">{regular.nickname}</span>
                <div className="flex shrink-0 items-start gap-0.5 self-start">
                  <StatusIconButton
                    label="Gra"
                    disabled={signupsDisabled || busyNickname === regular.nickname}
                    onClick={() => void onAdminDecision(regular.nickname, "playing")}
                  >
                    ✓
                  </StatusIconButton>
                  <StatusIconButton
                    label="Nie gra"
                    disabled={signupsDisabled || busyNickname === regular.nickname}
                    onClick={() => void onAdminDecision(regular.nickname, "not_playing")}
                  >
                    ×
                  </StatusIconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
