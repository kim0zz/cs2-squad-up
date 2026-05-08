-- Football flow: separate from CS2 and Padel (do not modify those tables)

CREATE TABLE public.football_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_slug TEXT NOT NULL UNIQUE,
  admin_token TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  weekday INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  max_players INTEGER NOT NULL,
  regular_deadline_hours_before INTEGER NOT NULL DEFAULT 24,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT football_series_weekday_check CHECK (weekday BETWEEN 0 AND 6),
  CONSTRAINT football_series_max_players_check CHECK (max_players BETWEEN 4 AND 30),
  CONSTRAINT football_series_regular_deadline_check CHECK (regular_deadline_hours_before BETWEEN 1 AND 168),
  CONSTRAINT football_series_status_check CHECK (status IN ('open', 'cancelled'))
);

CREATE TABLE public.football_occurrences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES public.football_series(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT football_occurrences_status_check CHECK (status IN ('open', 'cancelled'))
);

CREATE TABLE public.football_regular_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES public.football_series(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT football_regular_players_series_nickname_unique UNIQUE (series_id, nickname)
);

CREATE TABLE public.football_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  occurrence_id UUID NOT NULL REFERENCES public.football_occurrences(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  is_regular BOOLEAN NOT NULL DEFAULT false,
  response_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT football_signups_response_status_check CHECK (response_status IN ('playing', 'not_playing', 'waitlist')),
  CONSTRAINT football_signups_occurrence_nickname_unique UNIQUE (occurrence_id, nickname)
);

CREATE INDEX idx_football_series_public_slug ON public.football_series(public_slug);
CREATE INDEX idx_football_occurrences_series_id ON public.football_occurrences(series_id);
CREATE INDEX idx_football_occurrences_starts_at ON public.football_occurrences(starts_at);
CREATE INDEX idx_football_regular_players_series_id ON public.football_regular_players(series_id);
CREATE INDEX idx_football_signups_occurrence_id ON public.football_signups(occurrence_id);

CREATE TRIGGER football_series_set_updated_at
BEFORE UPDATE ON public.football_series
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER football_occurrences_set_updated_at
BEFORE UPDATE ON public.football_occurrences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER football_signups_set_updated_at
BEFORE UPDATE ON public.football_signups
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS — public MVP (no auth): read all, insert all, update only signups; no deletes
ALTER TABLE public.football_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_regular_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can select football_series"
  ON public.football_series FOR SELECT USING (true);

CREATE POLICY "Public can insert football_series"
  ON public.football_series FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can select football_occurrences"
  ON public.football_occurrences FOR SELECT USING (true);

CREATE POLICY "Public can insert football_occurrences"
  ON public.football_occurrences FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can select football_regular_players"
  ON public.football_regular_players FOR SELECT USING (true);

CREATE POLICY "Public can insert football_regular_players"
  ON public.football_regular_players FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can select football_signups"
  ON public.football_signups FOR SELECT USING (true);

CREATE POLICY "Public can insert football_signups"
  ON public.football_signups FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update football_signups"
  ON public.football_signups FOR UPDATE USING (true) WITH CHECK (true);
