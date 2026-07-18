
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_card TEXT;
  meta_account_type TEXT;
BEGIN
  LOOP
    new_card := lpad(floor(random() * 10000000000000000)::bigint::text, 16, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE card_number = new_card);
  END LOOP;

  meta_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'client');
  IF meta_account_type NOT IN ('client','company') THEN
    meta_account_type := 'client';
  END IF;

  INSERT INTO public.profiles (user_id, email, card_number, name, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    new_card,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    meta_account_type
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$function$;
