import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  countPlaying,
  FOOTBALL_NICKNAME_KEY,
  isRegularDeadlineOpen,
} from "@/lib/footballRules";
import {
  buildFootballInvitationMessage,
  buildFootballRegularReminderMessage,
} from "@/lib/footballInvitationMessage";
import {
  getFootballOccurrenceBySlugOrId,
  getFootballRegularPlayers,
  getFootballSeriesBySlug,
  getFootballSignups,
  upsertFootballSignup,
} from "@/lib/footballRepository";
import type {
  FootballOccurrence,
  FootballRegularPlayer,
  FootballSeries,
  FootballSignup,
  FootballSignupStatus,
} from "@/types/football";
import { FootballSignupLists } from "./FootballSignupLists";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function FootballOccurrencePage() {
  const { slug, occurrenceId } = useParams<{ slug: string; occurrenceId: string }>();
  const [searchParams] = useSearchParams();
  const [phase, setPhase] = useState<"loading" | "notfound" | "ready">("loading");
  const [series, setSeries] = useState<FootballSeries | null>(null);
  const [occurrence, setOccurrence] = useState<FootballOccurrence | null>(null);
  const [regularPlayers, setRegularPlayers] = useState<FootballRegularPlayer[]>([]);
  const [signups, setSignups] = useState<FootballSignup[]>([]);
  const [nickname, setNickname] = useState(() => localStorage.getItem(FOOTBALL_NICKNAME_KEY) ?? "");
  const [savingStatus, setSavingStatus] = useState<FootballSignupStatus | null>(null);
  const [busyNickname, setBusyNickname] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!slug || !occurrenceId) {
      setPhase("notfound");
      return;
    }
    setPhase("loading");
    try {
      const loadedSeries = await getFootballSeriesBySlug(slug);
      if (!loadedSeries) {
        setPhase("notfound");
        return;
      }
      const loadedOccurrence = await getFootballOccurrenceBySlugOrId(occurrenceId);
      if (!loadedOccurrence || loadedOccurrence.series_id !== loadedSeries.id) {
        setPhase("notfound");
        return;
      }
      const [loadedRegulars, loadedSignups] = await Promise.all([
        getFootballRegularPlayers(loadedSeries.id),
        getFootballSignups(loadedOccurrence.id),
      ]);
      setSeries(loadedSeries);
      setOccurrence(loadedOccurrence);
      setRegularPlayers(loadedRegulars);
      setSignups(loadedSignups);
      setPhase("ready");
    } catch (error) {
      console.error(error);
      setPhase("notfound");
    }
  }, [slug, occurrenceId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (phase === "ready" && series && occurrence) {
      document.title = `${series.title} — ${DATE_TIME_FORMATTER.format(new Date(occurrence.starts_at))} — Piłka`;
      return;
    }
    document.title = "Termin zbiórki — Piłka — Zbieraj się!";
  }, [phase, series, occurrence]);

  const adminToken = searchParams.get("admin");
  const hasValidAdminToken = Boolean(series && adminToken && adminToken === series.admin_token);
  const seriesBackLink = useMemo(() => {
    if (!slug) return "/football";
    if (!adminToken) return `/football/${slug}`;
    return `/football/${slug}?admin=${encodeURIComponent(adminToken)}`;
  }, [slug, adminToken]);

  const playingCount = countPlaying(signups);
  const spotsLeft = Math.max(0, (series?.max_players ?? 0) - playingCount);
  const capacityText = spotsLeft > 0 ? `Brakuje ${spotsLeft}` : "Komplet";
  const regularDeadlineOpen =
    series && occurrence
      ? isRegularDeadlineOpen(occurrence.starts_at, series.regular_deadline_hours_before)
      : false;
  const undecidedRegularNicknames = useMemo(() => {
    const decidedSet = new Set(signups.map((signup) => signup.nickname.toLowerCase()));
    return regularPlayers
      .filter((regular) => !decidedSet.has(regular.nickname.toLowerCase()))
      .map((regular) => regular.nickname)
      .sort((a, b) => a.localeCompare(b, "pl", { sensitivity: "base" }));
  }, [regularPlayers, signups]);
  const deadlineDate = useMemo(() => {
    if (!series || !occurrence) return null;
    const startMs = new Date(occurrence.starts_at).getTime();
    return new Date(startMs - series.regular_deadline_hours_before * 60 * 60 * 1000);
  }, [series, occurrence]);
  const cleanOccurrenceUrl = useMemo(() => {
    if (!series || !occurrence) return "";
    return `${window.location.origin}/football/${series.public_slug}/${occurrence.public_slug}`;
  }, [series, occurrence]);

  const submitDecision = async (desiredStatus: "playing" | "not_playing") => {
    if (!occurrence) return;
    const trimmedNick = nickname.trim();
    if (!trimmedNick) {
      toast.error("Podaj nick gracza");
      return;
    }

    setSavingStatus(desiredStatus);
    try {
      localStorage.setItem(FOOTBALL_NICKNAME_KEY, trimmedNick);
      await upsertFootballSignup({
        occurrence_id: occurrence.id,
        nickname: trimmedNick,
        desired_status: desiredStatus,
      });
      const nextSignups = await getFootballSignups(occurrence.id);
      setSignups(nextSignups);
      toast.success("Zapisano decyzję");
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się zapisać");
    } finally {
      setSavingStatus(null);
    }
  };

  const handleAdminDecision = async (
    regularNickname: string,
    desiredStatus: "playing" | "not_playing",
  ) => {
    if (!occurrence) return;
    setBusyNickname(regularNickname);
    try {
      await upsertFootballSignup({
        occurrence_id: occurrence.id,
        nickname: regularNickname,
        desired_status: desiredStatus,
      });
      const nextSignups = await getFootballSignups(occurrence.id);
      setSignups(nextSignups);
      toast.success("Zapisano decyzję gracza");
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się zapisać");
    } finally {
      setBusyNickname(null);
    }
  };

  const copyInvitation = async () => {
    if (!series || !occurrence) return;
    const text = buildFootballInvitationMessage({
      series,
      occurrence,
      location: series.location,
      playingCount,
      maxPlayers: series.max_players,
      url: cleanOccurrenceUrl,
    });
    await navigator.clipboard.writeText(text);
    toast.success("Zaproszenie skopiowane");
  };

  const copyRegularReminder = async () => {
    if (!series || !occurrence || undecidedRegularNicknames.length === 0) return;
    const text = buildFootballRegularReminderMessage({
      title: series.title,
      undecidedRegularNicknames,
      url: cleanOccurrenceUrl,
    });
    await navigator.clipboard.writeText(text);
    toast.success("Przypominajka skopiowana");
  };

  if (phase === "loading") {
    return (
      <main className="min-h-screen">
        <div className="container max-w-2xl px-4 py-10">
          <div className="h-40 animate-pulse rounded-lg border border-border/60 bg-secondary/40" />
        </div>
      </main>
    );
  }

  if (phase === "notfound" || !series || !occurrence) {
    return (
      <main className="min-h-screen">
        <div className="container max-w-2xl px-4 py-10 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Link
              to="/football"
              className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
            >
              ← Zbiórki piłkarskie
            </Link>
          </div>
          <Card className="border-border/80 bg-gradient-card p-8 text-center">
            <h1 className="font-display text-2xl font-bold">Nie znaleziono terminu</h1>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl space-y-6 px-4 py-10">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/football"
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Zbiórki piłkarskie
          </Link>
          <Link
            to={seriesBackLink}
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Cykl
          </Link>
          <Button
            type="button"
            variant="outline"
            className="font-display uppercase tracking-wide"
            onClick={() => void copyInvitation()}
          >
            Kopiuj zaproszenie
          </Button>
          {undecidedRegularNicknames.length > 0 && (
            <Button
              type="button"
              variant="outline"
              className="font-display uppercase tracking-wide"
              onClick={() => void copyRegularReminder()}
            >
              Kopiuj przypominajkę dla stałych
            </Button>
          )}
        </div>

        <Card className="space-y-3 border-border/80 bg-gradient-card p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
            {series.title}
          </h1>
          <p className="text-sm">
            <span className="text-muted-foreground">Termin:</span>{" "}
            {DATE_TIME_FORMATTER.format(new Date(occurrence.starts_at))}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Miejsce:</span> {series.location}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Skład:</span> {playingCount}/{series.max_players}
          </p>
          <p className="text-sm font-medium">{capacityText}</p>
        </Card>

        <Card className="space-y-4 border-border/80 bg-gradient-card p-6">
          <p className="text-sm">
            {regularDeadlineOpen && deadlineDate
              ? `Stali mają pierwszeństwo do ${DATE_TIME_FORMATTER.format(deadlineDate)}`
              : "Zapisy otwarte dla wszystkich"}
          </p>

          <div className="space-y-2">
            <Label htmlFor="football-nickname">Nick gracza</Label>
            <Input
              id="football-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={32}
              placeholder="Twój nick"
              className="bg-secondary/40 border-border/80"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={savingStatus !== null}
              onClick={() => void submitDecision("playing")}
              className="font-display uppercase tracking-wide"
            >
              Gram
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={savingStatus !== null}
              onClick={() => void submitDecision("not_playing")}
              className="font-display uppercase tracking-wide"
            >
              Nie gram
            </Button>
          </div>
        </Card>

        <Card className="border-border/80 bg-gradient-card p-6">
          <FootballSignupLists
            signups={signups}
            regularPlayers={regularPlayers}
            busyNickname={busyNickname}
            onAdminDecision={handleAdminDecision}
          />
          {hasValidAdminToken && (
            <p className="mt-4 text-xs text-muted-foreground">
              Tryb admin aktywny. Dodatkowe akcje administracyjne pojawią się tutaj w kolejnych
              krokach.
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}
