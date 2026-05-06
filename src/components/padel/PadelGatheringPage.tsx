import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PadelOptionCard } from "@/components/padel/PadelOptionCard";
import { buildPadelInvitationMessage } from "@/lib/padelInvitationMessage";
import {
  getPadelGatheringBySlug,
  getPadelOptions,
  getPadelVotes,
  upsertPadelVote,
} from "@/lib/padelRepository";
import { PADEL_NICKNAME_KEY, sortPadelOptions } from "@/lib/padelRules";
import type {
  PadelGathering,
  PadelOption,
  PadelOptionWithVotes,
  PadelVote,
  PadelVoteStatus,
} from "@/types/padel";
import { toast } from "sonner";
import { Copy } from "lucide-react";

function mergeOptionsWithVotes(options: PadelOption[], votes: PadelVote[]): PadelOptionWithVotes[] {
  const withVotes: PadelOptionWithVotes[] = options.map((o) => ({
    ...o,
    votes: votes.filter((v) => v.option_id === o.id),
  }));
  return sortPadelOptions(withVotes);
}

export function PadelGatheringPage() {
  const { slug } = useParams<{ slug: string }>();
  const [phase, setPhase] = useState<"loading" | "notfound" | "ready">("loading");
  const [gathering, setGathering] = useState<PadelGathering | null>(null);
  const [optionsWithVotes, setOptionsWithVotes] = useState<PadelOptionWithVotes[]>([]);
  const [baseOptions, setBaseOptions] = useState<PadelOption[]>([]);
  const [nickname, setNickname] = useState(() => localStorage.getItem(PADEL_NICKNAME_KEY) ?? "");
  const [votingOptionId, setVotingOptionId] = useState<string | null>(null);

  const refreshVotes = useCallback(async (_g: PadelGathering, opts: PadelOption[]) => {
    if (opts.length === 0) {
      setOptionsWithVotes([]);
      return;
    }
    const votes = await getPadelVotes(opts.map((o) => o.id));
    setOptionsWithVotes(mergeOptionsWithVotes(opts, votes));
  }, []);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    (async () => {
      setPhase("loading");
      try {
        const g = await getPadelGatheringBySlug(slug);
        if (!active) return;
        if (!g) {
          setGathering(null);
          setBaseOptions([]);
          setOptionsWithVotes([]);
          setPhase("notfound");
          return;
        }
        setGathering(g);
        const opts = await getPadelOptions(g.id);
        if (!active) return;
        setBaseOptions(opts);
        const votes = await getPadelVotes(opts.map((o) => o.id));
        if (!active) return;
        setOptionsWithVotes(mergeOptionsWithVotes(opts, votes));
        setPhase("ready");
      } catch (e) {
        console.error(e);
        if (active) {
          setGathering(null);
          setPhase("notfound");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (gathering && phase === "ready") {
      document.title = `${gathering.title} — Padel — Zbieraj się!`;
    }
  }, [gathering, phase]);

  const handleVote = async (optionId: string, status: PadelVoteStatus) => {
    if (!gathering || baseOptions.length === 0) return;
    if (!nickname.trim()) {
      toast.error("Wpisz nick gracza");
      return;
    }
    setVotingOptionId(optionId);
    try {
      localStorage.setItem(PADEL_NICKNAME_KEY, nickname.trim());
      await upsertPadelVote(optionId, nickname, status);
      toast.success("Zapisano głos");
      await refreshVotes(gathering, baseOptions);
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się zapisać głosu");
    } finally {
      setVotingOptionId(null);
    }
  };

  if (phase === "loading") {
    return (
      <main className="min-h-screen">
        <div className="container max-w-2xl px-4 py-10">
          <div className="animate-pulse h-40 rounded-lg bg-secondary/40 border border-border/60" />
        </div>
      </main>
    );
  }

  if (phase === "notfound" || !gathering) {
    return (
      <main className="min-h-screen">
        <div className="container max-w-2xl px-4 py-10">
          <Link
            to="/padel"
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Zbiórki padla
          </Link>
          <Card className="bg-gradient-card border-border/80 p-8 mt-8 text-center">
            <h1 className="font-display text-2xl font-bold">Nie znaleziono zbiórki</h1>
          </Card>
        </div>
      </main>
    );
  }

  const getCanonicalPadelUrl = () =>
    `${window.location.origin}/padel/${gathering.public_slug}`;

  const copyInvitation = async () => {
    const text = buildPadelInvitationMessage({
      gathering,
      options: baseOptions,
      url: getCanonicalPadelUrl(),
    });
    await navigator.clipboard.writeText(text);
    toast.success("Zaproszenie skopiowane");
  };

  return (
    <main className="min-h-screen">
      <div className="container max-w-2xl px-4 py-10 space-y-6">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <Link
            to="/padel"
            className="inline-flex items-center rounded-md border border-border/80 bg-secondary/45 px-3 py-2 text-sm font-display uppercase tracking-wide text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/75"
          >
            ← Zbiórki padla
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={copyInvitation}
            className="gap-2 font-display uppercase tracking-wide"
          >
            <Copy className="size-4" />
            Kopiuj zaproszenie
          </Button>
        </div>

        <Card className="bg-gradient-card border-border/80 p-6 sm:p-8">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide break-words">
            {gathering.title}
          </h1>
          {gathering.description && (
            <p className="mt-4 text-muted-foreground whitespace-pre-wrap">{gathering.description}</p>
          )}
        </Card>

        <Card className="bg-gradient-card border-border/80 p-6">
          <Label htmlFor="padel-nick" className="font-display uppercase tracking-wide text-xs text-muted-foreground">
            Nick gracza
          </Label>
          <Input
            id="padel-nick"
            className="mt-2 bg-secondary/40 border-border/80"
            placeholder="Twój nick"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={32}
          />
        </Card>

        <div className="space-y-4">
          {optionsWithVotes.map((opt) => (
            <PadelOptionCard
              key={opt.id}
              option={opt}
              voteLocked={votingOptionId !== null}
              onVote={(status) => handleVote(opt.id, status)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
