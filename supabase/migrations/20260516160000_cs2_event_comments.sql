-- Short discussion threads per CS2 event (no auth MVP)

CREATE TABLE public.cs2_event_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cs2_event_comments_nickname_len CHECK (
    char_length(nickname) >= 1 AND char_length(nickname) <= 80
  ),
  CONSTRAINT cs2_event_comments_body_len CHECK (
    char_length(body) >= 1 AND char_length(body) <= 1000
  )
);

CREATE INDEX idx_cs2_event_comments_event_id
  ON public.cs2_event_comments(event_id);

CREATE INDEX idx_cs2_event_comments_created_at
  ON public.cs2_event_comments(event_id, created_at);

ALTER TABLE public.cs2_event_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can select cs2_event_comments"
  ON public.cs2_event_comments FOR SELECT USING (true);

CREATE POLICY "Public can insert cs2_event_comments"
  ON public.cs2_event_comments FOR INSERT WITH CHECK (true);
