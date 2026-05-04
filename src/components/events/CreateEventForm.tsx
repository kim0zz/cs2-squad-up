import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { createEvent } from "@/lib/eventApi";
import type { CsMode, MaxPlayers } from "@/types/event";
import { Loader2, Target } from "lucide-react";

export function CreateEventForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<MaxPlayers>(5);
  const [csMode, setCsMode] = useState<CsMode>("premier");
  const [discordInfo, setDiscordInfo] = useState("");
  const [description, setDescription] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startsAt || !discordInfo.trim()) {
      toast.error("Uzupełnij wymagane pola");
      return;
    }
    setLoading(true);
    try {
      const event = await createEvent({
        title: title.trim(),
        starts_at: new Date(startsAt).toISOString(),
        max_players: maxPlayers,
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
    <Card className="bg-gradient-card border-border/60 shadow-card p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-md bg-gradient-primary grid place-items-center shadow-glow">
            <Target className="size-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Utwórz zbiórkę</h2>
            <p className="text-sm text-muted-foreground">CS2 — zbierz ekipę w 30 sekund</p>
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

        <div className="space-y-2">
          <Label htmlFor="starts_at">Kiedy gramy? *</Label>
          <Input
            id="starts_at"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Liczba graczy *</Label>
            <ToggleGroup
              type="single"
              value={String(maxPlayers)}
              onValueChange={(v) => v && setMaxPlayers(Number(v) as MaxPlayers)}
              className="justify-start"
            >
              <ToggleGroupItem value="5" className="px-6 font-display text-lg">5</ToggleGroupItem>
              <ToggleGroupItem value="10" className="px-6 font-display text-lg">10</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <Label>Tryb *</Label>
            <ToggleGroup
              type="single"
              value={csMode}
              onValueChange={(v) => v && setCsMode(v as CsMode)}
              className="justify-start"
            >
              <ToggleGroupItem value="premier" className="px-4 font-display uppercase">Premier</ToggleGroupItem>
              <ToggleGroupItem value="faceit" className="px-4 font-display uppercase">Faceit</ToggleGroupItem>
            </ToggleGroup>
          </div>
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

        <Button type="submit" disabled={loading} size="lg" className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow font-display text-lg uppercase tracking-wider">
          {loading ? <Loader2 className="size-5 animate-spin" /> : "Utwórz zbiórkę"}
        </Button>
      </form>
    </Card>
  );
}
