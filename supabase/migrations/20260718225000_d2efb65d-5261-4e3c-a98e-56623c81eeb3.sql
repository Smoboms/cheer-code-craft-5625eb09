
CREATE INDEX IF NOT EXISTS idx_partners_status ON public.partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_created_by ON public.partners(created_by);
CREATE INDEX IF NOT EXISTS idx_partner_photos_partner_id ON public.partner_photos(partner_id);
CREATE INDEX IF NOT EXISTS idx_journal_articles_published_at ON public.journal_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_time ON public.analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_next_due_date ON public.payments(next_due_date);

CREATE UNIQUE INDEX IF NOT EXISTS coupons_code_unique ON public.coupons(code);

CREATE OR REPLACE FUNCTION public.issue_coupon(
  _partner_id uuid,
  _client_user_id uuid,
  _purchase_amount numeric,
  _discount_amount numeric,
  _cashback_amount numeric,
  _code text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _partner_owner uuid;
  _partner_status text;
  _p_discount_percent numeric;
  _p_cashback_enabled boolean;
  _p_cashback_percent numeric;
  _p_cashback_unlocked boolean;
  _client_active boolean;
  _client_type text;
  _coupon_id uuid;
  _srv_discount numeric;
  _srv_cashback numeric;
BEGIN
  IF _purchase_amount IS NULL OR _purchase_amount <= 0 THEN
    RAISE EXCEPTION 'Valor inválido';
  END IF;
  IF _purchase_amount > 1000000 THEN
    RAISE EXCEPTION 'Valor acima do limite permitido';
  END IF;

  SELECT created_by, status,
         COALESCE(discount_percent, 0),
         COALESCE(cashback_enabled, false),
         COALESCE(cashback_percent, 0),
         COALESCE(cashback_feature_unlocked, false)
    INTO _partner_owner, _partner_status,
         _p_discount_percent, _p_cashback_enabled,
         _p_cashback_percent, _p_cashback_unlocked
  FROM public.partners WHERE id = _partner_id;

  IF _partner_owner IS NULL THEN RAISE EXCEPTION 'Empresa não encontrada'; END IF;
  IF _partner_owner <> auth.uid() THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF _partner_status <> 'approved' THEN RAISE EXCEPTION 'Empresa não aprovada'; END IF;

  SELECT is_active, account_type INTO _client_active, _client_type
    FROM public.profiles WHERE user_id = _client_user_id;
  IF _client_active IS NULL THEN RAISE EXCEPTION 'Cliente não encontrado'; END IF;
  IF _client_type <> 'client' THEN RAISE EXCEPTION 'Membro inválido'; END IF;
  IF NOT _client_active THEN RAISE EXCEPTION 'Membro Inativo'; END IF;

  _srv_discount := round(_purchase_amount * (_p_discount_percent / 100.0), 2);
  IF _p_cashback_unlocked AND _p_cashback_enabled THEN
    _srv_cashback := round(_purchase_amount * (_p_cashback_percent / 100.0), 2);
  ELSE
    _srv_cashback := 0;
  END IF;

  BEGIN
    INSERT INTO public.coupons (user_id, partner_id, purchase_amount, discount_percent, savings, cashback_amount, code)
    VALUES (_client_user_id, _partner_id, _purchase_amount, _p_discount_percent, _srv_discount, _srv_cashback, _code)
    RETURNING id INTO _coupon_id;
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'Código de cupom já utilizado, tente novamente';
  END;

  UPDATE public.profiles SET total_savings = COALESCE(total_savings, 0) + _srv_discount
   WHERE user_id = _client_user_id;

  IF _srv_cashback > 0 THEN
    INSERT INTO public.client_cashback_balances (user_id, partner_id, balance)
    VALUES (_client_user_id, _partner_id, _srv_cashback)
    ON CONFLICT (user_id, partner_id) DO UPDATE
      SET balance = public.client_cashback_balances.balance + EXCLUDED.balance,
          updated_at = now();
  END IF;

  RETURN _coupon_id;
END;
$function$;
