-- Unschedule pg_cron jobs targeting the removed sync-agro-cepea edge function
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT jobid FROM cron.job WHERE command ILIKE '%sync-agro-cepea%' OR jobname ILIKE '%agro%'
  LOOP
    PERFORM cron.unschedule(r.jobid);
  END LOOP;
END $$;

-- Remove Agro shortcut from home
DELETE FROM public.atalhos_da_casa WHERE link = '/agro';

-- Drop the agro_quotes table and all associated policies
DROP TABLE IF EXISTS public.agro_quotes CASCADE;