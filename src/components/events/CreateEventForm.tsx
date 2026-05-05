import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { createEvent } from "@/lib/eventRules";
import type { CsMode } from "@/types/event";
import { Loader2, Target } from "lucide-react";

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function getNextFriday(base: Date): Date {
  const day = base.getDay();
  const daysUntilFriday = (5 - day + 7) % 7;
  return addDays(base, daysUntilFriday);
}

export function CreateEventForm() {
  const navigate = useNavigate();
  const today = new Date();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [dateValue, setDateValue] = useState(formatDateInput(today));
  const [timeValue, setTimeValue] = useState("20:00");
  const [csMode, setCsMode] = useState<CsMode>("faceit");
  const [discordInfo, setDiscordInfo] = useState("");
  const [description, setDescription] = useState("");
  const helperText = csMode === "mix10" ? "Zbieramy 10 osób" : "Zbieramy 5 osób";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateValue || !timeValue || !discordInfo.trim()) {
      toast.error("Uzupełnij wymagane pola");
      return;
    }

    const startsAtDate = new Date(`${dateValue}T${timeValue}`);
    if (Number.isNaN(startsAtDate.getTime())) {
      toast.error("Uzupełnij wymagane pola");
      return;
    }
    if (startsAtDate.getTime() < Date.now()) {
      toast.error("Nie można utworzyć zbiórki w przeszłości");
      return;
    }

    setLoading(true);
    try {
      const event = await createEvent({
        title: title.trim(),
        starts_at: startsAtDate.toISOString(),
        cs_mode: csMode,
        discord_info: discordInfo.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Zbiórka utworzona!");
      navigate(`/e/${event.public_slug}`);
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się utworzyć zbiórki");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/80 p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-md bg-gradient-primary grid place-items-center shadow-glow ring-1 ring-primary/50">
            <Target className="size-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Utwórz zbiórkę</h2>
            <p className="text-sm text-muted-foreground">Zbieraj się! — zbierz ekipę w 30 sekund</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Tytuł *</Label>
          <Input
            id="title"
            placeholder="Sobota wieczór, Premier"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-3">
          <Label>Data *</Label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="font-display uppercase tracking-wide" onClick={() => setDateValue(formatDateInput(new Date()))}>
              Dziś
            </Button>
            <Button type="button" variant="outline" size="sm" className="font-display uppercase tracking-wide" onClick={() => setDateValue(formatDateInput(addDays(new Date(), 1)))}>
              Jutro
            </Button>
            <Button type="button" variant="outline" size="sm" className="font-display uppercase tracking-wide" onClick={() => setDateValue(formatDateInput(getNextFriday(new Date())))}>
              Najbliższy piątek
            </Button>
          </div>
          <Input
            id="date"
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Godzina *</Label>
          <Input
            id="time"
            type="time"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Tryb *</Label>
          <ToggleGroup
            type="single"
            value={csMode}
            onValueChange={(v) => v && setCsMode(v as CsMode)}
            className="justify-start gap-2"
          >
            <ToggleGroupItem value="faceit" className="px-4 font-display uppercase border border-lime-400/45 data-[state=on]:bg-lime-500/22 data-[state=on]:text-lime-100 data-[state=on]:border-lime-300/70">Faceit</ToggleGroupItem>
            <ToggleGroupItem value="premier" className="px-4 font-display uppercase border border-slate-300/40 data-[state=on]:bg-slate-200/20 data-[state=on]:text-slate-50 data-[state=on]:border-slate-200/65">Premier</ToggleGroupItem>
            <ToggleGroupItem value="mix10" className="px-4 font-display uppercase border border-lime-300/55 data-[state=on]:bg-lime-400/28 data-[state=on]:text-lime-50 data-[state=on]:border-lime-200/75">MIX10</ToggleGroupItem>
          </ToggleGroup>
          <p className="text-sm text-muted-foreground/95">{helperText}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discord">Discord *</Label>
          <Input
            id="discord"
            placeholder="#cs2-squad lub link do invite"
            value={discordInfo}
            onChange={(e) => setDiscordInfo(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc">Opis (opcjonalnie)</Label>
          <Textarea
            id="desc"
            placeholder="Cokolwiek warto wiedzieć ekipie..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <Button type="submit" disabled={loading} size="lg" className="w-full font-display text-lg uppercase tracking-wider">
          {loading ? <Loader2 className="size-5 animate-spin" /> : "Utwórz zbiórkę"}
        </Button>
      </form>
    </Card>
  );
}
