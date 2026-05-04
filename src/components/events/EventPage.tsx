import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  countPlaying,
  getEventBySlug,
  getParticipants,
  NICKNAME_KEY,
  spotsLeft,
  upsertParticipant,
} from "@/lib/eventRules";
import type { EventRow, ParticipantRow, ResponseStatus } from "@/types/event";
import { ParticipantLists } from "./ParticipantLists";
import { Calendar, Copy, Gamepad2, MessageSquare, Users } from "lucide-react";

export function EventPage() {
  const { slug } = useParams<{ slug: string }>();
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
      toast.error("Wpisz swój nick");
      return;
    }
    setSubmitting(chosen);
    try {
      localStorage.setItem(NICKNAME_KEY, nickname.trim());
      const updated = await upsertParticipant(event, participants, nickname, chosen);
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

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link skopiowany");
  };

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
      <Card className="p-8 text-center bg-gradient-card border-border/60">
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
      {/* Header */}
      <Card className="bg-gradient-card border-border/60 shadow-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className="font-display uppercase tracking-wider mb-3 border-primary/50 text-primary">
              {event.cs_mode}
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-2 break-words">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              <span className="capitalize">{dateStr}</span>
            </div>
          </div>
          <Button variant="outline" onClick={copyLink} className="gap-2">
            <Copy className="size-4" />
            Skopiuj link
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="bg-secondary/40 rounded-md p-4">
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
          <div className="bg-secondary/40 rounded-md p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-display tracking-wider mb-1">
              <Gamepad2 className="size-3.5" /> Brakuje
            </div>
            <div className="font-display text-2xl font-bold">
              {left > 0 ? `${left} ${left === 1 ? "gracza" : "graczy"}` : "Komplet ✓"}
            </div>
          </div>
          <div className="bg-secondary/40 rounded-md p-4 sm:col-span-1 col-span-1">
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
      <Card className="bg-gradient-card border-border/60 shadow-card p-6">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide mb-4">
          Wbijasz?
        </h2>
        <div className="space-y-3">
          <Input
            placeholder="Twój nick"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={32}
          />
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleStatus("playing")}
              disabled={!!submitting}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-display uppercase tracking-wider"
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

      <ParticipantLists participants={participants} currentNickname={nickname} />
    </div>
  );
}
