import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getFootballOccurrences,
  getFootballRegularPlayers,
  getFootballSeriesBySlug,
  getFootballSignupsForOccurrences,
  replaceFootballRegularPlayers,
  updateFootballSeriesBasics,
} from "@/lib/footballRepository";
import { isFootballSeriesAdmin } from "@/lib/footballSeriesAdmin";
import type {
  FootballOccurrence,
  FootballRegularPlayer,
  FootballSeries,
  FootballSignup,
} from "@/types/football";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { FootballOccurrencesList } from "./FootballOccurrencesList";

const MIN_MAX_PLAYERS = 4;
const MAX_MAX_PLAYERS = 30;
const MIN_DEADLINE = 1;
const MAX_DEADLINE = 168;

const WEEKDAY_LABELS: ReadonlyArray<string> = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];

function formatDeadline(hours: number): string {
  if (hours === 1) return "1 godzinę przed grą";
  if (hours >= 2 && hours <= 4) return `${hours} godziny przed grą`;
  return `${hours} godzin przed grą`;
}

export function FootballSeriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [phase, setPhase] = useState<"loading" | "notfound" | "ready">("loading");
  const [series, setSeries] = useState<FootballSeries | null>(null);
  const [occurrences, setOccurrences] = useState<FootballOccurrence[]>([]);
  const [signups, setSignups] = useState<FootballSignup[]>([]);
  const [regularPlayers, setRegularPlayers] = useState<FootballRegularPlayer[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editMaxPlayers, setEditMaxPlayers] = useState("");
  const [editDeadlineHours, setEditDeadlineHours] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingBasics, setSavingBasics] = useState(false);
  const [editRegularsOpen, setEditRegularsOpen] = useState(false);
  const [editRegularsText, setEditRegularsText] = useState("");
  const [savingRegulars, setSavingRegulars] = useState(false);

  useEffect(() => {
    if (!slug) {
      setPhase("notfound");
      return;
    }
    let active = true;
    (async () => {
      setPhase("loading");
      try {
        const loadedSeries = await getFootballSeriesBySlug(slug);
        if (!active) return;
        if (!loadedSeries) {
          setSeries(null);
          setOccurrences([]);
          setSignups([]);
          setRegularPlayers([]);
          setPhase("notfound");
          return;
        }

        const [loadedOccurrences, loadedRegulars] = await Promise.all([
          getFootballOccurrences(loadedSeries.id),
          getFootballRegularPlayers(loadedSeries.id),
        ]);
        if (!active) return;
        const listOccurrences = loadedOccurrences.filter(
          (occurrence) => occurrence.status === "open" || occurrence.status === "cancelled",
        );

        const loadedSignups = await getFootballSignupsForOccurrences(
          listOccurrences.map((occurrence) => occurrence.id),
        );
        if (!active) return;

        setSeries(loadedSeries);
        setOccurrences(listOccurrences);
        setSignups(loadedSignups);
        setRegularPlayers(loadedRegulars);
        setPhase("ready");
      } catch (error) {
        console.error(error);
        if (!active) return;
        setSeries(null);
        setOccurrences([]);
        setSignups([]);
        setRegularPlayers([]);
        setPhase("notfound");
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (phase === "ready" && series) {
      document.title = `${series.title} — Piłka — Zbieraj się!`;
      return;
    }
    document.title = "Cykl zbiórek — Piłka — Zbieraj się!";
  }, [phase, series]);

  const adminToken = searchParams.get("admin");
  const isAdmin = Boolean(series && isFootballSeriesAdmin(series, user, adminToken));
  const weekdayTimeLabel = useMemo(() => {
    if (!series) return "";
    const weekday = WEEKDAY_LABELS[series.weekday] ?? "Nieznany dzień";
    return `${weekday}, ${series.start_time}`;
  }, [series]);

  const syncEditFormFromSeries = (s: FootballSeries) => {
    setEditTitle(s.title);
    setEditLocation(s.location);
    setEditMaxPlayers(String(s.max_players));
    setEditDeadlineHours(String(s.regular_deadline_hours_before));
    setEditDescription(s.description ?? "");
  };

  const openEdit = () => {
    if (series) syncEditFormFromSeries(series);
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (series) syncEditFormFromSeries(series);
    setEditOpen(false);
  };

  const saveBasics = async () => {
    if (!series) return;
    const errors: string[] = [];
    if (!editTitle.trim()) errors.push("Podaj nazwę zbiórki");
    if (!editLocation.trim()) errors.push("Podaj miejsce");
    const maxNum = Number.parseInt(editMaxPlayers, 10);
    if (
      !Number.isFinite(maxNum) ||
      maxNum < MIN_MAX_PLAYERS ||
      maxNum > MAX_MAX_PLAYERS
    ) {
      errors.push(`Liczba miejsc musi być między ${MIN_MAX_PLAYERS} a ${MAX_MAX_PLAYERS}`);
    }
    const deadlineNum = Number.parseInt(editDeadlineHours, 10);
    if (
      !Number.isFinite(deadlineNum) ||
      deadlineNum < MIN_DEADLINE ||
      deadlineNum > MAX_DEADLINE
    ) {
      errors.push(`Deadline musi być między ${MIN_DEADLINE} a ${MAX_DEADLINE} godzin`);
    }
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setSavingBasics(true);
    try {
      const updated = await updateFootballSeriesBasics(series.id, {
        title: editTitle.trim(),
        location: editLocation.trim(),
        max_players: maxNum,
        regular_deadline_hours_before: deadlineNum,
        description: editDescription.trim() || null,
      });
      setSeries(updated);
      setEditOpen(false);
      toast.success("Zapisano zmiany");
    } catch (e) {
      console.error(e);
      toast.error("Nie udało się zapisać");
    } finally {
      setSavingBasics(false);
    }
  };

  const syncRegularsFormFromState = (rows: FootballRegularPlayer[]) => {
    setEditRegularsText(rows.map((r) => r.nickname).join("\n"));
  };

  const openRegularsEdit = () => {
    syncRegularsFormFromState(regularPlayers);
    setEditRegularsOpen(true);
  };

  const closeRegularsEdit = () => {
    syncRegularsFormFromState(regularPlayers);
    setEditRegularsOpen(false);
  };

  const saveRegulars = async () => {
    if (!series) return;
    const lines = editRegularsText.split(/\r?\n/);
    setSavingRegulars(true);
    try {
      const updated = await replaceFootballRegularPlayers(series.id, lines);
      setRegularPlayers(updated);
      setEditRegularsOpen(false);
      toast.success("Zapisano stałych graczy");
    } catch (e) {
      console.error(e);
      toast.error("Nie udało się zapisać listy");
    } finally {
      setSavingRegulars(false);
    }
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

  if (phase === "notfound" || !series) {
    return (
      <main className="min-h-screen">
        <div className="container max-w-2xl px-4 py-10">
          <Link
            to="/football"
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Zbiórki piłkarskie
          </Link>
          <Card className="mt-8 border-border/80 bg-gradient-card p-8 text-center">
            <h1 className="font-display text-2xl font-bold">Nie znaleziono cyklu</h1>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl space-y-6 px-4 py-10">
        <Link
          to="/football"
          className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
        >
          ← Zbiórki piłkarskie
        </Link>

        <Card className="space-y-4 border-border/80 bg-gradient-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-gradient-primary text-xl leading-none shadow-glow ring-1 ring-primary/50">
              ⚽
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
              {series.title}
            </h1>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Miejsce:</span> {series.location}
            </p>
            <p>
              <span className="text-muted-foreground">Dzień i godzina:</span> {weekdayTimeLabel}
            </p>
            <p>
              <span className="text-muted-foreground">Max graczy:</span> {series.max_players}
            </p>
            <p>
              <span className="text-muted-foreground">Deadline stałych:</span>{" "}
              {formatDeadline(series.regular_deadline_hours_before)}
            </p>
          </div>
          {series.description?.trim() && (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap border-t border-border/60 pt-4">
              {series.description}
            </p>
          )}
        </Card>

        {isAdmin && (
          <Card className="space-y-4 border-border/80 bg-gradient-card p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Administracja
            </h2>
            {!editOpen ? (
              <Button
                type="button"
                variant="outline"
                className="font-display uppercase tracking-wide"
                onClick={openEdit}
              >
                Edytuj dane zbiórki
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-series-title">Nazwa zbiórki</Label>
                  <Input
                    id="edit-series-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={120}
                    className="bg-secondary/40 border-border/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-series-location">Miejsce</Label>
                  <Input
                    id="edit-series-location"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    maxLength={160}
                    className="bg-secondary/40 border-border/80"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-series-max">Liczba miejsc</Label>
                    <Input
                      id="edit-series-max"
                      type="number"
                      inputMode="numeric"
                      min={MIN_MAX_PLAYERS}
                      max={MAX_MAX_PLAYERS}
                      value={editMaxPlayers}
                      onChange={(e) => setEditMaxPlayers(e.target.value)}
                      className="bg-secondary/40 border-border/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-series-deadline">Deadline stałych (godziny przed grą)</Label>
                    <Input
                      id="edit-series-deadline"
                      type="number"
                      inputMode="numeric"
                      min={MIN_DEADLINE}
                      max={MAX_DEADLINE}
                      value={editDeadlineHours}
                      onChange={(e) => setEditDeadlineHours(e.target.value)}
                      className="bg-secondary/40 border-border/80"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-series-desc">Opis</Label>
                  <Textarea
                    id="edit-series-desc"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="bg-secondary/40 border-border/80 resize-y min-h-[80px]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={savingBasics}
                    className="font-display uppercase tracking-wide"
                    onClick={() => void saveBasics()}
                  >
                    Zapisz
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={savingBasics}
                    className="font-display uppercase tracking-wide"
                    onClick={closeEdit}
                  >
                    Anuluj
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t border-border/60 pt-4 space-y-4">
              {!editRegularsOpen ? (
                <Button
                  type="button"
                  variant="outline"
                  className="font-display uppercase tracking-wide"
                  onClick={openRegularsEdit}
                >
                  Edytuj stałych graczy
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-regulars">Stali gracze</Label>
                    <Textarea
                      id="edit-regulars"
                      value={editRegularsText}
                      onChange={(e) => setEditRegularsText(e.target.value)}
                      rows={6}
                      className="bg-secondary/40 border-border/80 resize-y min-h-[120px] font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Jeden nick w linii</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={savingRegulars}
                      className="font-display uppercase tracking-wide"
                      onClick={() => void saveRegulars()}
                    >
                      Zapisz stałych
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={savingRegulars}
                      className="font-display uppercase tracking-wide"
                      onClick={closeRegularsEdit}
                    >
                      Anuluj
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        <Card className="space-y-4 border-border/80 bg-gradient-card p-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            Nadchodzące terminy
          </h2>
          <FootballOccurrencesList
            occurrences={occurrences}
            signups={signups}
            regularPlayers={regularPlayers}
            maxPlayers={series.max_players}
            seriesSlug={series.public_slug}
            adminToken={adminToken}
          />
        </Card>
      </div>
    </main>
  );
}
