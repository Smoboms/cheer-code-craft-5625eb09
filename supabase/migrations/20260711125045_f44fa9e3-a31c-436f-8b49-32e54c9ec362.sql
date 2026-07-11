
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_percent numeric;

CREATE INDEX IF NOT EXISTS partners_display_order_idx ON public.partners(display_order);
