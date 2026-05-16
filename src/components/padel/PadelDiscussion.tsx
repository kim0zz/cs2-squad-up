import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addPadelGatheringComment } from "@/lib/padelRepository";
import { PADEL_NICKNAME_KEY } from "@/lib/padelRules";
import type { PadelGatheringComment } from "@/types/padel";

const COMMENT_DATE_FORMATTER = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const BODY_MAX = 1000;
const NICK_MAX = 80;

interface PadelDiscussionProps {
  gatheringId: string;
  comments: PadelGatheringComment[];
  onCommentsRefresh: () => Promise<void>;
}

export function PadelDiscussion({
  gatheringId,
  comments,
  onCommentsRefresh,
}: PadelDiscussionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [nick, setNick] = useState(() => localStorage.getItem(PADEL_NICKNAME_KEY) ?? "");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedNick = nick.trim();
    const trimmedBody = body.trim();
    if (!trimmedNick) {
      toast.error("Podaj nick");
      return;
    }
    if (trimmedNick.length > NICK_MAX) {
      toast.error(`Nick może mieć maksymalnie ${NICK_MAX} znaków`);
      return;
    }
    if (!trimmedBody) {
      toast.error("Wpisz treść wiadomości");
      return;
    }
    if (trimmedBody.length > BODY_MAX) {
      toast.error(`Wiadomość może mieć maksymalnie ${BODY_MAX} znaków`);
      return;
    }

    setSubmitting(true);
    try {
      await addPadelGatheringComment(gatheringId, trimmedNick, trimmedBody);
      localStorage.setItem(PADEL_NICKNAME_KEY, trimmedNick);
      setBody("");
      await onCommentsRefresh();
      toast.success("Wiadomość wysłana");
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się wysłać wiadomości");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="space-y-3 border-border/80 bg-gradient-card p-4 sm:p-5">
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary/90 border-b border-border/50 pb-2">
        Dyskusja
      </h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak wiadomości. Napisz coś jako pierwszy.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {comments.map((c) => (
            <li key={c.id} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <span className="font-medium text-foreground">{c.nickname}</span>
                <time
                  className="shrink-0 text-xs text-muted-foreground tabular-nums"
                  dateTime={c.created_at}
                >
                  {COMMENT_DATE_FORMATTER.format(new Date(c.created_at))}
                </time>
              </div>
              <p className="mt-1 break-words whitespace-pre-wrap leading-snug text-foreground/95">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {!formOpen ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="font-display uppercase tracking-wide"
          onClick={() => setFormOpen(true)}
        >
          Dodaj wiadomość
        </Button>
      ) : (
        <div className="space-y-3 border-t border-border/50 pt-3">
          <div className="space-y-1.5">
            <Label htmlFor="padel-discussion-nick">Nick</Label>
            <Input
              id="padel-discussion-nick"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              maxLength={NICK_MAX}
              placeholder="Twój nick"
              className="bg-secondary/40 border-border/80"
              disabled={submitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="padel-discussion-body">Wiadomość</Label>
            <Textarea
              id="padel-discussion-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={BODY_MAX}
              placeholder="Np. Mam rakietę…"
              className="min-h-[72px] resize-y bg-secondary/40 border-border/80"
              disabled={submitting}
            />
            <p className="text-[11px] text-muted-foreground tabular-nums">
              {body.length}/{BODY_MAX}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="font-display uppercase tracking-wide"
              disabled={submitting}
              onClick={() => void handleSubmit()}
            >
              Wyślij
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="font-display uppercase tracking-wide text-muted-foreground"
              disabled={submitting}
              onClick={() => setFormOpen(false)}
            >
              Zwiń
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
