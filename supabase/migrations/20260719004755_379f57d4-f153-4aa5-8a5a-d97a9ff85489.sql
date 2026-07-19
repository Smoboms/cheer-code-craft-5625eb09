-- Task 4: Dual Profile (Opção A) — 1 auth user pode ter 2 profiles (client + company)

-- 1) Substituir UNIQUE(user_id) por UNIQUE(user_id, account_type)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_account_type_key'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_id_account_type_key UNIQUE (user_id, account_type);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 2) RPC para criar perfil secundário do próprio usuário
CREATE OR REPLACE FUNCTION public.create_secondary_profile(_account_type text)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _name text;
  _existing public.profiles;
  _new public.profiles;
  _card_num text;
  _card_code text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;
  IF _account_type NOT IN ('client','company') THEN
    RAISE EXCEPTION 'Tipo de conta inválido';
  END IF;

  -- Já existe? retorna
  SELECT * INTO _existing FROM public.profiles
    WHERE user_id = _uid AND account_type = _account_type
    LIMIT 1;
  IF _existing.id IS NOT NULL THEN
    RETURN _existing;
  END IF;

  SELECT email, COALESCE(raw_user_meta_data->>'full_name','')
    INTO _email, _name
    FROM auth.users WHERE id = _uid;

  IF _account_type = 'client' THEN
    _card_num := public.generate_unique_card_number();
    _card_code := public.generate_unique_card_code();
  ELSE
    _card_num := public.generate_unique_card_number();
    _card_code := NULL;
  END IF;

  INSERT INTO public.profiles (user_id, email, name, account_type, card_number, card_code)
  VALUES (_uid, _email, _name, _account_type, _card_num, _card_code)
  RETURNING * INTO _new;

  RETURN _new;
END;
$fn$;

GRANT EXECUTE ON FUNCTION public.create_secondary_profile(text) TO authenticated;