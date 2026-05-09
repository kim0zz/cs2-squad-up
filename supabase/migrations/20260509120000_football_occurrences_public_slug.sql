-- Short public slugs for football occurrence URLs (id remains primary key)

ALTER TABLE public.football_occurrences
  ADD COLUMN public_slug text;

-- Backfill: unique short hex strings (10 chars from 5 random bytes)
DO $$
DECLARE
  rec RECORD;
  slug_candidate text;
  slug_ok boolean;
BEGIN
  FOR rec IN SELECT id FROM public.football_occurrences ORDER BY id LOOP
    slug_ok := false;
    WHILE NOT slug_ok LOOP
      slug_candidate := lower(substring(encode(gen_random_bytes(5), 'hex') from 1 for 10));
      IF NOT EXISTS (
        SELECT 1
        FROM public.football_occurrences o
        WHERE o.public_slug = slug_candidate
      ) THEN
        slug_ok := true;
      END IF;
    END LOOP;
    UPDATE public.football_occurrences
    SET public_slug = slug_candidate
    WHERE id = rec.id;
  END LOOP;
END $$;

ALTER TABLE public.football_occurrences
  ALTER COLUMN public_slug SET NOT NULL;

CREATE UNIQUE INDEX football_occurrences_public_slug_key
  ON public.football_occurrences (public_slug);
