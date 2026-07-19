
-- Add card_code column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS card_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_card_code_key ON public.profiles(card_code) WHERE card_code IS NOT NULL;

-- Generator: card_code (6 chars from 32-symbol unambiguous alphabet)
CREATE OR REPLACE FUNCTION public.generate_unique_card_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alphabet TEXT := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  candidate TEXT;
  i INT;
BEGIN
  LOOP
    candidate := '';
    FOR i IN 1..6 LOOP
      candidate := candidate || substr(alphabet, floor(random() * length(alphabet))::int + 1, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE card_code = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

-- Generator: card_number (16 random digits, unique)
CREATE OR REPLACE FUNCTION public.generate_unique_card_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  candidate TEXT;
  i INT;
BEGIN
  LOOP
    candidate := '';
    FOR i IN 1..16 LOOP
      candidate := candidate || floor(random() * 10)::int::text;
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE card_number = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

-- Update handle_new_user: only clients get card_code + card_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_account_type TEXT;
  new_card_number TEXT;
  new_card_code TEXT;
BEGIN
  meta_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'client');
  IF meta_account_type NOT IN ('client','company') THEN
    meta_account_type := 'client';
  END IF;

  IF meta_account_type = 'client' THEN
    new_card_number := public.generate_unique_card_number();
    new_card_code := public.generate_unique_card_code();
  ELSE
    -- company: still needs card_number (NOT NULL); reuse generator to avoid breaking
    new_card_number := public.generate_unique_card_number();
    new_card_code := NULL;
  END IF;

  INSERT INTO public.profiles (user_id, email, card_number, card_code, name, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    new_card_number,
    new_card_code,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    meta_account_type
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

-- Backfill existing clients that have no card_code
DO $$
DECLARE
  r RECORD;
  new_code TEXT;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE account_type = 'client' AND card_code IS NULL LOOP
    new_code := public.generate_unique_card_code();
    UPDATE public.profiles SET card_code = new_code WHERE id = r.id;
  END LOOP;
END $$;
