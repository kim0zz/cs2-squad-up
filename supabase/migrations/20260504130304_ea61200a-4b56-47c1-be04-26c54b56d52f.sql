
-- Events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  activity_type TEXT NOT NULL DEFAULT 'cs2',
  starts_at TIMESTAMPTZ NOT NULL,
  max_players INTEGER NOT NULL,
  cs_mode TEXT NOT NULL,
  discord_info TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'link',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT events_max_players_check CHECK (max_players IN (5, 10)),
  CONSTRAINT events_cs_mode_check CHECK (cs_mode IN ('premier', 'faceit'))
);

-- Participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  response_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT participants_status_check CHECK (response_status IN ('playing', 'maybe', 'not_playing', 'waitlist')),
  CONSTRAINT participants_unique_nickname_per_event UNIQUE (event_id, nickname)
);

CREATE INDEX idx_participants_event_id ON public.participants(event_id);
CREATE INDEX idx_events_public_slug ON public.events(public_slug);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_set_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER participants_set_updated_at
BEFORE UPDATE ON public.participants
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS — public link-based access (no auth in MVP)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can create events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update events" ON public.events FOR UPDATE USING (true);

CREATE POLICY "Anyone can view participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can join as participant" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update participants" ON public.participants FOR UPDATE USING (true);
CREATE POLICY "Anyone can remove participants" ON public.participants FOR DELETE USING (true);
