import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ParticipantRow, ResponseStatus } from "@/types/event";
import { Crosshair, HelpCircle, X, Hourglass } from "lucide-react";

const META: Record<ResponseStatus, { label: string; icon: typeof Crosshair; color: string }> = {
  playing:     { label: "Grają",   icon: Crosshair,  color: "text-success" },
  maybe:       { label: "Może",    icon: HelpCircle, color: "text-warning" },
  not_playing: { label: "Nie gra", icon: X,          color: "text-destructive" },
  waitlist:    { label: "Rezerwa", icon: Hourglass,  color: "text-accent" },
};

interface Props {
  participants: ParticipantRow[];
}

export function ParticipantLists({ participants }: Props) {
  const groups: ResponseStatus[] = ["playing", "waitlist", "maybe", "not_playing"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {groups.map((status) => {
        const list = participants.filter((p) => p.response_status === status);
        if (list.length === 0 && (status === "waitlist" || status === "not_playing")) return null;
        const { label, icon: Icon, color } = META[status];
        return (
          <Card key={status} className="bg-gradient-card border-border/80 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`size-4 ${color}`} />
              <h3 className="font-display text-lg font-semibold uppercase tracking-wide">
                {label}
              </h3>
              <Badge variant="secondary" className="ml-auto font-mono bg-secondary/85 border border-border/70">{list.length}</Badge>
            </div>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Brak</p>
            ) : (
              <ul className="space-y-1.5">
                {list.map((p) => {
                  return (
                    <li
                      key={p.id}
                      className="text-sm py-1.5 px-3 rounded-md flex items-center justify-between border border-border/65 bg-secondary/55"
                    >
                      <span className="font-medium truncate">{p.nickname}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}
