-- Short discussion threads per Football occurrence (no auth MVP)

CREATE TABLE public.football_occurrence_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  occurrence_id UUID NOT NULL REFERENCES public.football_occurrences(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT football_occurrence_comments_nickname_len CHECK (
    char_length(nickname) >= 1 AND char_length(nickname) <= 80
  ),
  CONSTRAINT football_occurrence_comments_body_len CHECK (
    char_length(body) >= 1 AND char_length(body) <= 1000
  )
);

CREATE INDEX idx_football_occurrence_comments_occurrence_id
  ON public.football_occurrence_comments(occurrence_id);

CREATE INDEX idx_football_occurrence_comments_created_at
  ON public.football_occurrence_comments(occurrence_id, created_at);

ALTER TABLE public.football_occurrence_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can select football_occurrence_comments"
  ON public.football_occurrence_comments FOR SELECT USING (true);

CREATE POLICY "Public can insert football_occurrence_comments"
  ON public.football_occurrence_comments FOR INSERT WITH CHECK (true);
