import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createFootballSeries } from "@/lib/footballRepository";

const WEEKDAY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "1", label: "Poniedziałek" },
  { value: "2", label: "Wtorek" },
  { value: "3", label: "Środa" },
  { value: "4", label: "Czwartek" },
  { value: "5", label: "Piątek" },
  { value: "6", label: "Sobota" },
  { value: "0", label: "Niedziela" },
];

const DEFAULT_WEEKDAY = "3";
const DEFAULT_START_TIME = "20:00";
const DEFAULT_MAX_PLAYERS = "14";
const DEFAULT_DEADLINE_HOURS = "24";

const MIN_MAX_PLAYERS = 4;
const MAX_MAX_PLAYERS = 30;
const MIN_DEADLINE = 1;
const MAX_DEADLINE = 168;

export function CreateFootballSeriesForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [weekday, setWeekday] = useState<string>(DEFAULT_WEEKDAY);
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_MAX_PLAYERS);
  const [deadlineHours, setDeadlineHours] = useState(DEFAULT_DEADLINE_HOURS);
  const [regularsText, setRegularsText] = useState("");
  const [description, setDescription] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];
    if (!title.trim()) errors.push("Podaj nazwę zbiórki");
    if (!location.trim()) errors.push("Podaj miejsce");

    const weekdayNum = Number.parseInt(weekday, 10);
    if (!Number.isInteger(weekdayNum) || weekdayNum < 0 || weekdayNum > 6) {
      errors.push("Wybierz dzień tygodnia");
    }

    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      errors.push("Podaj godzinę rozpoczęcia");
    }

    const maxPlayersNum = Number.parseInt(maxPlayers, 10);
    if (
      !Number.isFinite(maxPlayersNum) ||
      maxPlayersNum < MIN_MAX_PLAYERS ||
      maxPlayersNum > MAX_MAX_PLAYERS
    ) {
      errors.push(
        `Liczba miejsc musi być między ${MIN_MAX_PLAYERS} a ${MAX_MAX_PLAYERS}`,
      );
    }

    const deadlineNum = Number.parseInt(deadlineHours, 10);
    if (
      !Number.isFinite(deadlineNum) ||
      deadlineNum < MIN_DEADLINE ||
      deadlineNum > MAX_DEADLINE
    ) {
      errors.push(
        `Godziny pierwszeństwa muszą być między ${MIN_DEADLINE} a ${MAX_DEADLINE}`,
      );
    }

    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    const regularNicknames = regularsText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setLoading(true);
    try {
      const { series } = await createFootballSeries({
        title: title.trim(),
        location: location.trim(),
        weekday: weekdayNum,
        start_time: startTime,
        max_players: maxPlayersNum,
        regular_deadline_hours_before: deadlineNum,
        description: description.trim() || null,
        regular_player_nicknames: regularNicknames,
      });
      toast.success("Cykl zbiórek utworzony!");
      navigate(
        `/football/${series.public_slug}?admin=${series.admin_token}&created=1`,
      );
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się utworzyć cyklu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/80 p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-md bg-gradient-primary grid place-items-center text-xl leading-none shadow-glow ring-1 ring-primary/50">
            ⚽
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Nowa zbiórka — Piłka</h2>
            <p className="text-sm text-muted-foreground">
              Cykl tygodniowy — wygenerujemy 5 najbliższych terminów
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="football-title">Nazwa zbiórki *</Label>
          <Input
            id="football-title"
            placeholder="np. Piłka środa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="bg-secondary/40 border-border/80"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="football-location">Miejsce *</Label>
          <Input
            id="football-location"
            placeholder="np. Orlik, ul. Sportowa 1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={160}
            className="bg-secondary/40 border-border/80"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="football-weekday">Dzień tygodnia *</Label>
            <Select value={weekday} onValueChange={setWeekday}>
              <SelectTrigger
                id="football-weekday"
                className="bg-secondary/40 border-border/80"
              >
                <SelectValue placeholder="Wybierz" />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="football-time">Godzina *</Label>
            <Input
              id="football-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-secondary/40 border-border/80"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="football-max-players">Liczba miejsc *</Label>
            <Input
              id="football-max-players"
              type="number"
              inputMode="numeric"
              min={MIN_MAX_PLAYERS}
              max={MAX_MAX_PLAYERS}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              className="bg-secondary/40 border-border/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="football-deadline">
              Ile godzin przed grą stali mają pierwszeństwo? *
            </Label>
            <Input
              id="football-deadline"
              type="number"
              inputMode="numeric"
              min={MIN_DEADLINE}
              max={MAX_DEADLINE}
              value={deadlineHours}
              onChange={(e) => setDeadlineHours(e.target.value)}
              className="bg-secondary/40 border-border/80"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="football-regulars">Stali gracze</Label>
          <Textarea
            id="football-regulars"
            placeholder={"Jeden nick w linii\nnp.\nKuba\nMichał\nPiotrek"}
            value={regularsText}
            onChange={(e) => setRegularsText(e.target.value)}
            rows={5}
            className="bg-secondary/40 border-border/80 resize-y min-h-[110px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Stali mają pierwszeństwo przed gośćmi do upływu deadline'u.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="football-desc">Opis</Label>
          <Textarea
            id="football-desc"
            placeholder="Opcjonalnie…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="bg-secondary/40 border-border/80 resize-y min-h-[80px]"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto font-display uppercase tracking-wider"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Tworzenie…
            </>
          ) : (
            "Utwórz cykl"
          )}
        </Button>
      </form>
    </Card>
  );
}
