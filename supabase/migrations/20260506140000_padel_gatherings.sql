-- Padel flow: separate from CS2 events/participants (do not modify those tables)

CREATE TABLE public.padel_gatherings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT padel_gatherings_status_check CHECK (status IN ('open', 'cancelled'))
);

CREATE TABLE public.padel_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gathering_id UUID NOT NULL REFERENCES public.padel_gatherings(id) ON DELETE CASCADE,
  venue_name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  price_per_person TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT padel_options_duration_check CHECK (
    duration_minutes IS NULL OR duration_minutes IN (60, 75, 90, 105, 120)
  )
);

CREATE TABLE public.padel_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id UUID NOT NULL REFERENCES public.padel_options(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  vote_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT padel_votes_vote_status_check CHECK (vote_status IN ('fits', 'doesnt_fit')),
  CONSTRAINT padel_votes_option_nickname_unique UNIQUE (option_id, nickname)
);

CREATE INDEX idx_padel_gatherings_public_slug ON public.padel_gatherings(public_slug);
CREATE INDEX idx_padel_options_gathering_id ON public.padel_options(gathering_id);
CREATE INDEX idx_padel_votes_option_id ON public.padel_votes(option_id);

CREATE TRIGGER padel_gatherings_set_updated_at
BEFORE UPDATE ON public.padel_gatherings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER padel_options_set_updated_at
BEFORE UPDATE ON public.padel_options
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER padel_votes_set_updated_at
BEFORE UPDATE ON public.padel_votes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS — public MVP (no auth): read all, create rows, change votes only; no deletes
ALTER TABLE public.padel_gatherings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.padel_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.padel_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can select padel_gatherings"
  ON public.padel_gatherings FOR SELECT USING (true);

CREATE POLICY "Public can insert padel_gatherings"
  ON public.padel_gatherings FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can select padel_options"
  ON public.padel_options FOR SELECT USING (true);

CREATE POLICY "Public can insert padel_options"
  ON public.padel_options FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can select padel_votes"
  ON public.padel_votes FOR SELECT USING (true);

CREATE POLICY "Public can insert padel_votes"
  ON public.padel_votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update padel_votes"
  ON public.padel_votes FOR UPDATE USING (true) WITH CHECK (true);
