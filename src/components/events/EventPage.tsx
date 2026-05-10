import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buildInvitationMessage } from "@/lib/invitationMessage";
import { toast } from "sonner";
import {
  getEventBySlug,
  getParticipants,
  upsertParticipant,
} from "@/lib/eventRepository";
import { countPlaying, NICKNAME_KEY, spotsLeft } from "@/lib/eventRules";
import type { EventRow, ParticipantRow, ResponseStatus } from "@/types/event";
import { ParticipantLists } from "./ParticipantLists";
import { Calendar, Copy, Gamepad2, MessageSquare, Users } from "lucide-react";

const MODE_LABELS: Record<EventRow["cs_mode"], string> = {
  faceit: "Faceit",
  premier: "Premier",
  mix10: "MIX10",
};

const MODE_BADGE_VARIANT: Record<EventRow["cs_mode"], "modeFaceit" | "modePremier" | "modeMix10"> = {
  faceit: "modeFaceit",
  premier: "modePremier",
  mix10: "modeMix10",
};

export function EventPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [nickname, setNickname] = useState(() => localStorage.getItem(NICKNAME_KEY) ?? "");
  const [submitting, setSubmitting] = useState<ResponseStatus | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const ev = await getEventBySlug(slug);
        if (!active) return;
        if (!ev) {
          setNotFound(true);
          return;
        }
        setEvent(ev);
        const ps = await getParticipants(ev.id);
        if (!active) return;
        setParticipants(ps);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    if (!slug || !event || event.public_slug !== slug) return;
    const eventId = event.id;
    let active = true;
    const tick = async () => {
      try {
        const ps = await getParticipants(eventId);
        if (!active) return;
        setParticipants(ps);
      } catch (err) {
        console.error(err);
      }
    };
    const id = window.setInterval(() => {
      void tick();
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [slug, event?.id, event?.public_slug]);

  // SEO
  useEffect(() => {
    if (event) {
      document.title = `${event.title} — Zbieraj się!`;
    }
  }, [event]);

  const playingCount = useMemo(() => countPlaying(participants), [participants]);
  const left = event ? spotsLeft(participants, event.max_players) : 0;

  const handleStatus = async (chosen: ResponseStatus) => {
    if (!event) return;
    if (!nickname.trim()) {
      toast.error("Wpisz nick gracza");
      return;
    }
    setSubmitting(chosen);
    try {
      localStorage.setItem(NICKNAME_KEY, nickname.trim());
      const updated = await upsertParticipant(event, participants, nickname, chosen);
      // Refresh local list (no realtime in MVP)
      const fresh = await getParticipants(event.id);
      setParticipants(fresh);
      const msg =
        updated.response_status === "waitlist"
          ? "Komplet — jesteś na rezerwie"
          : "Zaktualizowano!";
      toast.success(msg);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Coś poszło nie tak");
    } finally {
      setSubmitting(null);
    }
  };

  const getCanonicalEventUrl = () =>
    event
      ? `${window.location.origin}/e/${event.public_slug}`
      : window.location.origin;

  const copyLink = async () => {
    await navigator.clipboard.writeText(getCanonicalEventUrl());
    toast.success("Link skopiowany");
  };

  const copyInvitation = async () => {
    if (!event) return;
    const message = buildInvitationMessage({
      event,
      modeLabel: MODE_LABELS[event.cs_mode],
      playingCount,
      spotsLeftCount: left,
      url: getCanonicalEventUrl(),
    });
    await navigator.clipboard.writeText(message);
    toast.success("Zaproszenie skopiowane");
  };

  const clearCreatedParam = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("created");
    setSearchParams(next, { replace: true });
  };

  const showCreatedSuccessModal = searchParams.get("created") === "1";

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (notFound || !event) {
    return (
      <Card className="p-8 text-center bg-gradient-card border-border/80">
        <h1 className="font-display text-3xl font-bold mb-2">Zbiórka nie istnieje</h1>
        <p className="text-muted-foreground">Sprawdź link i spróbuj jeszcze raz.</p>
      </Card>
    );
  }

  const startsDate = new Date(event.starts_at);
  const dateStr = startsDate.toLocaleString("pl-PL", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <Link
        to="/cs2"
        className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
      >
        ← Utwórz kolejną zbiórkę
      </Link>

      {/* Header */}
      <Card className="bg-gradient-card border-border/80 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <Badge variant={MODE_BADGE_VARIANT[event.cs_mode]} className="font-display uppercase tracking-wider mb-3">
              {MODE_LABELS[event.cs_mode]}
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-2 break-words">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              <span className="capitalize">{dateStr}</span>
            </div>
            <div className="mt-4 h-px w-28 bg-gradient-to-r from-primary/65 to-transparent" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={copyInvitation} className="gap-2 font-display uppercase tracking-wide">
              <Copy className="size-4" />
              Kopiuj zaproszenie
            </Button>
            <Button variant="outline" onClick={copyLink} className="gap-2 font-display uppercase tracking-wide">
              <Copy className="size-4" />
              Skopiuj link
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="rounded-lg border border-border/75 bg-secondary/55 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-display tracking-wider mb-1">
              <Users className="size-3.5" /> Skład
            </div>
            <div className="font-display text-2xl font-bold">
              <span className={playingCount >= event.max_players ? "text-success" : "text-foreground"}>
                {playingCount}
              </span>
              <span className="text-muted-foreground">/{event.max_players}</span>
            </div>
          </div>
          <div className="rounded-lg border border-border/75 bg-secondary/55 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-display tracking-wider mb-1">
              <Gamepad2 className="size-3.5" /> Brakuje
            </div>
            <div className="font-display text-2xl font-bold text-primary">
              {left > 0 ? `${left} ${left === 1 ? "gracza" : "graczy"}` : "Komplet ✓"}
            </div>
          </div>
          <div className="rounded-lg border border-border/75 bg-secondary/55 p-4 sm:col-span-1 col-span-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-display tracking-wider mb-1">
              <MessageSquare className="size-3.5" /> Discord
            </div>
            <div className="font-medium text-sm truncate" title={event.discord_info}>
              {event.discord_info}
            </div>
          </div>
        </div>

        {event.description && (
          <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap border-l-2 border-primary/40 pl-4">
            {event.description}
          </p>
        )}
      </Card>

      {/* Join */}
      <Card className="bg-gradient-card border-border/80 p-6">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide mb-4">
          Dodaj / zaktualizuj gracza
        </h2>
        <div className="space-y-3">
          <Input
            placeholder="Nick gracza"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={32}
          />
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleStatus("playing")}
              disabled={!!submitting}
              className="font-display uppercase tracking-wider"
            >
              Gram
            </Button>
            <Button
              onClick={() => handleStatus("maybe")}
              disabled={!!submitting}
              variant="secondary"
              className="font-display uppercase tracking-wider"
            >
              Może
            </Button>
            <Button
              onClick={() => handleStatus("not_playing")}
              disabled={!!submitting}
              variant="outline"
              className="font-display uppercase tracking-wider"
            >
              Nie gram
            </Button>
          </div>
        </div>
      </Card>

      <ParticipantLists participants={participants} />

      <Dialog
        open={showCreatedSuccessModal}
        onOpenChange={(open) => {
          if (!open) clearCreatedParam();
        }}
      >
        <DialogContent className="border-border/80 bg-gradient-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl uppercase tracking-wide">
              Zbiórka utworzona!
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Wrzuć zaproszenie na grupę, żeby inni mogli się wpisać.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="font-display uppercase tracking-wide"
              onClick={clearCreatedParam}
            >
              Zamknij
            </Button>
            <Button
              type="button"
              className="gap-2 font-display uppercase tracking-wide"
              onClick={async () => {
                await copyInvitation();
                clearCreatedParam();
              }}
            >
              <Copy className="size-4" />
              Kopiuj zaproszenie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
