ALTER TABLE public.partners ALTER COLUMN discount DROP NOT NULL;
ALTER TABLE public.partners ALTER COLUMN discount SET DEFAULT '';