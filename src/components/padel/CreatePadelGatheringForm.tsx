import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createPadelGathering } from "@/lib/padelRepository";
import { combineLocalDateAndTimeToIso, formatDateInput } from "@/lib/dateUtils";
import { Loader2, Plus, Trash2 } from "lucide-react";

const DURATION_CHOICES = [60, 90, 120] as const;
const DURATION_NONE = "__none__";

type OptionDraft = {
  key: string;
  venue_name: string;
  date: string;
  time: string;
  durationValue: string;
  price_per_person: string;
};

function newOptionDraft(): OptionDraft {
  return {
    key: crypto.randomUUID(),
    venue_name: "",
    date: formatDateInput(new Date()),
    time: "20:00",
    durationValue: DURATION_NONE,
    price_per_person: "",
  };
}

export function CreatePadelGatheringForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<OptionDraft[]>(() => [newOptionDraft(), newOptionDraft()]);

  const updateOption = (key: string, patch: Partial<OptionDraft>) => {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, ...patch } : o)));
  };

  const addOption = () => {
    if (options.length >= 4) {
      toast.error("Możesz dodać maksymalnie 4 terminy");
      return;
    }
    setOptions((prev) => [...prev, newOptionDraft()]);
  };

  const removeOption = (key: string) => {
    if (options.length <= 1) {
      toast.error("Zostaw co najmniej jeden termin");
      return;
    }
    setOptions((prev) => prev.filter((o) => o.key !== key));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!title.trim()) errors.push("Podaj tytuł zbiórki");

    options.forEach((opt, i) => {
      const n = i + 1;
      if (!opt.venue_name.trim()) errors.push(`Opcja ${n}: podaj obiekt`);
      if (!opt.date || !opt.time) {
        errors.push(`Opcja ${n}: wybierz datę i godzinę`);
      } else {
        const iso = combineLocalDateAndTimeToIso(opt.date, opt.time);
        if (!iso) errors.push(`Opcja ${n}: nieprawidłowa data lub godzina`);
      }
    });

    if (options.length > 4) errors.push("Możesz dodać maksymalnie 4 terminy");

    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        options: options.map((opt) => {
          const starts_at = combineLocalDateAndTimeToIso(opt.date, opt.time)!;
          const duration_minutes =
            opt.durationValue !== DURATION_NONE ? parseInt(opt.durationValue, 10) : null;
          const price = opt.price_per_person.trim();
          return {
            venue_name: opt.venue_name.trim(),
            starts_at,
            duration_minutes: Number.isFinite(duration_minutes as number) ? duration_minutes : null,
            price_per_person: price || null,
          };
        }),
      };
      const { gathering } = await createPadelGathering(payload);
      toast.success("Zbiórka padla utworzona!");
      navigate(`/padel/${gathering.public_slug}?created=1`);
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się utworzyć zbiórki");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/80 p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-md bg-gradient-primary grid place-items-center text-xl leading-none shadow-glow ring-1 ring-primary/50">
            🎾
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Nowa zbiórka — Padel</h2>
            <p className="text-sm text-muted-foreground">Dodaj terminy — później zagłosujecie</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="padel-title">Tytuł *</Label>
          <Input
            id="padel-title"
            placeholder="np. Sobota padel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="bg-secondary/40 border-border/80"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="padel-desc">Opis</Label>
          <Textarea
            id="padel-desc"
            placeholder="Opcjonalnie…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="bg-secondary/40 border-border/80 resize-y min-h-[80px]"
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">Terminy</h3>

          {options.map((opt, index) => (
            <div
              key={opt.key}
              className="rounded-lg border border-border/75 bg-secondary/40 p-4 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                  Termin {index + 1}
                </span>
                {options.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive gap-1 h-8"
                    onClick={() => removeOption(opt.key)}
                  >
                    <Trash2 className="size-4" />
                    Usuń
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`venue-${opt.key}`}>Obiekt *</Label>
                <Input
                  id={`venue-${opt.key}`}
                  placeholder="Nazwa klubu / kortu"
                  value={opt.venue_name}
                  onChange={(e) => updateOption(opt.key, { venue_name: e.target.value })}
                  className="bg-background/60 border-border/80"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`date-${opt.key}`}>Data *</Label>
                  <Input
                    id={`date-${opt.key}`}
                    type="date"
                    value={opt.date}
                    onChange={(e) => updateOption(opt.key, { date: e.target.value })}
                    className="bg-background/60 border-border/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`time-${opt.key}`}>Godzina *</Label>
                  <Input
                    id={`time-${opt.key}`}
                    type="time"
                    value={opt.time}
                    onChange={(e) => updateOption(opt.key, { time: e.target.value })}
                    className="bg-background/60 border-border/80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`dur-${opt.key}`}>Czas gry</Label>
                  <Select
                    value={opt.durationValue}
                    onValueChange={(v) => updateOption(opt.key, { durationValue: v })}
                  >
                    <SelectTrigger id={`dur-${opt.key}`} className="bg-background/60 border-border/80">
                      <SelectValue placeholder="Wybierz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DURATION_NONE}>—</SelectItem>
                      {DURATION_CHOICES.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`price-${opt.key}`}>Cena za osobę</Label>
                  <Input
                    id={`price-${opt.key}`}
                    placeholder="np. 35 zł"
                    value={opt.price_per_person}
                    onChange={(e) => updateOption(opt.key, { price_per_person: e.target.value })}
                    className="bg-background/60 border-border/80"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-display uppercase tracking-wide gap-1"
              onClick={addOption}
              disabled={options.length >= 4}
            >
              <Plus className="size-4" />
              Dodaj termin
            </Button>
          </div>
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
            "Utwórz zbiórkę"
          )}
        </Button>
      </form>
    </Card>
  );
}
