-- Short discussion threads per padel gathering (no auth MVP)

CREATE TABLE public.padel_gathering_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gathering_id UUID NOT NULL REFERENCES public.padel_gatherings(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT padel_gathering_comments_nickname_len CHECK (
    char_length(nickname) >= 1 AND char_length(nickname) <= 80
  ),
  CONSTRAINT padel_gathering_comments_body_len CHECK (
    char_length(body) >= 1 AND char_length(body) <= 1000
  )
);

CREATE INDEX idx_padel_gathering_comments_gathering_id
  ON public.padel_gathering_comments(gathering_id);

CREATE INDEX idx_padel_gathering_comments_created_at
  ON public.padel_gathering_comments(gathering_id, created_at);

ALTER TABLE public.padel_gathering_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can select padel_gathering_comments"
  ON public.padel_gathering_comments FOR SELECT USING (true);

CREATE POLICY "Public can insert padel_gathering_comments"
  ON public.padel_gathering_comments FOR INSERT WITH CHECK (true);
