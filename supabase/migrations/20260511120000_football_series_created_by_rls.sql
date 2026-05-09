-- Football organizer ownership (created_by). Does not touch CS2 or Padel.

ALTER TABLE public.football_series
  ADD COLUMN created_by uuid REFERENCES auth.users (id);

-- Drop legacy permissive Football policies
DROP POLICY IF EXISTS "Public can insert football_series" ON public.football_series;
DROP POLICY IF EXISTS "Public can insert football_occurrences" ON public.football_occurrences;
DROP POLICY IF EXISTS "Public can insert football_regular_players" ON public.football_regular_players;
DROP POLICY IF EXISTS "Public can update football_occurrences" ON public.football_occurrences;

-- football_series: public read; authenticated insert/update only for own rows; no delete
CREATE POLICY "Organizers can insert own football_series"
  ON public.football_series
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Organizers can update own football_series"
  ON public.football_series
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- football_occurrences: public read; owner inserts/updates via parent series; no delete
CREATE POLICY "Organizers can insert occurrences for own series"
  ON public.football_occurrences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.football_series s
      WHERE s.id = series_id
        AND s.created_by = auth.uid()
    )
  );

CREATE POLICY "Organizers can update occurrences for own series"
  ON public.football_occurrences
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.football_series s
      WHERE s.id = football_occurrences.series_id
        AND s.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.football_series s
      WHERE s.id = series_id
        AND s.created_by = auth.uid()
    )
  );

-- football_regular_players: public read; owner insert/update/delete; no public delete
CREATE POLICY "Organizers can insert regular_players for own series"
  ON public.football_regular_players
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.football_series s
      WHERE s.id = series_id
        AND s.created_by = auth.uid()
    )
  );

CREATE POLICY "Organizers can update regular_players for own series"
  ON public.football_regular_players
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.football_series s
      WHERE s.id = football_regular_players.series_id
        AND s.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.football_series s
      WHERE s.id = series_id
        AND s.created_by = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete regular_players for own series"
  ON public.football_regular_players
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.football_series s
      WHERE s.id = football_regular_players.series_id
        AND s.created_by = auth.uid()
    )
  );
