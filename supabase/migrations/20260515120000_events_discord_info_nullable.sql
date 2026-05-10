-- CS2 events: allow creating a gathering without Discord/channel info upfront.
ALTER TABLE public.events
  ALTER COLUMN discord_info DROP NOT NULL;
