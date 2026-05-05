ALTER TABLE public.events
DROP CONSTRAINT IF EXISTS events_cs_mode_check;

ALTER TABLE public.events
ADD CONSTRAINT events_cs_mode_check
CHECK (cs_mode IN ('premier', 'faceit', 'mix10'));
