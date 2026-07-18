
-- 1) profiles: account_type, cpf, total_savings
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS total_savings numeric(12,2) NOT NULL DEFAULT 0;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_account_type_chk CHECK (account_type IN ('client','company'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_cpf_unique ON public.profiles (cpf) WHERE cpf IS NOT NULL;

-- 2) partners: cnpj + curadoria + cashback
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS cnpj text,
  ADD COLUMN IF NOT EXISTS trade_name text,
  ADD COLUMN IF NOT EXISTS legal_name text,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS cashback_percent numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cashback_enabled boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS partners_cnpj_unique ON public.partners (cnpj) WHERE cnpj IS NOT NULL;

-- 3) coupons: cashback_amount
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS cashback_amount numeric(12,2) NOT NULL DEFAULT 0;

-- New INSERT policy: partner owner may create a coupon for any client (auth user_id target)
DROP POLICY IF EXISTS "partner owner creates coupons" ON public.coupons;
CREATE POLICY "partner owner creates coupons" ON public.coupons
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partners p
    WHERE p.id = coupons.partner_id
      AND p.created_by = auth.uid()
      AND p.status = 'approved'
  )
);

-- Partner owner may also read their partner's coupons
DROP POLICY IF EXISTS "partner owner reads coupons" ON public.coupons;
CREATE POLICY "partner owner reads coupons" ON public.coupons
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.partners p
    WHERE p.id = coupons.partner_id AND p.created_by = auth.uid()
  )
);

-- 4) client_cashback_balances
CREATE TABLE IF NOT EXISTS public.client_cashback_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, partner_id)
);

GRANT SELECT, INSERT, UPDATE ON public.client_cashback_balances TO authenticated;
GRANT ALL ON public.client_cashback_balances TO service_role;
ALTER TABLE public.client_cashback_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client reads own balance" ON public.client_cashback_balances;
CREATE POLICY "client reads own balance" ON public.client_cashback_balances
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "partner reads own partner balances" ON public.client_cashback_balances;
CREATE POLICY "partner reads own partner balances" ON public.client_cashback_balances
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.created_by = auth.uid())
);

DROP POLICY IF EXISTS "partner owner writes balances" ON public.client_cashback_balances;
CREATE POLICY "partner owner writes balances" ON public.client_cashback_balances
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.created_by = auth.uid() AND p.status = 'approved')
);

DROP POLICY IF EXISTS "partner owner updates balances" ON public.client_cashback_balances;
CREATE POLICY "partner owner updates balances" ON public.client_cashback_balances
FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.created_by = auth.uid() AND p.status = 'approved')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.created_by = auth.uid() AND p.status = 'approved')
);

DROP POLICY IF EXISTS "admin manage balances" ON public.client_cashback_balances;
CREATE POLICY "admin manage balances" ON public.client_cashback_balances
FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_client_cashback_balances_updated_at ON public.client_cashback_balances;
CREATE TRIGGER update_client_cashback_balances_updated_at
BEFORE UPDATE ON public.client_cashback_balances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) RPC: atomic coupon issuance (transaction: coupon + profile.total_savings + cashback balance)
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
SET search_path = public
AS $$
DECLARE
  _partner_owner uuid;
  _partner_status text;
  _client_active boolean;
  _client_type text;
  _coupon_id uuid;
  _discount_percent numeric;
BEGIN
  SELECT created_by, status INTO _partner_owner, _partner_status FROM public.partners WHERE id = _partner_id;
  IF _partner_owner IS NULL THEN RAISE EXCEPTION 'Empresa não encontrada'; END IF;
  IF _partner_owner <> auth.uid() THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF _partner_status <> 'approved' THEN RAISE EXCEPTION 'Empresa não aprovada'; END IF;

  SELECT is_active, account_type INTO _client_active, _client_type FROM public.profiles WHERE user_id = _client_user_id;
  IF _client_active IS NULL THEN RAISE EXCEPTION 'Cliente não encontrado'; END IF;
  IF _client_type <> 'client' THEN RAISE EXCEPTION 'Membro inválido'; END IF;
  IF NOT _client_active THEN RAISE EXCEPTION 'Membro Inativo'; END IF;
  IF _purchase_amount <= 0 THEN RAISE EXCEPTION 'Valor inválido'; END IF;

  _discount_percent := CASE WHEN _purchase_amount > 0 THEN round((_discount_amount / _purchase_amount) * 100, 2) ELSE 0 END;

  INSERT INTO public.coupons (user_id, partner_id, purchase_amount, discount_percent, savings, cashback_amount, code)
  VALUES (_client_user_id, _partner_id, _purchase_amount, _discount_percent, _discount_amount, _cashback_amount, _code)
  RETURNING id INTO _coupon_id;

  UPDATE public.profiles SET total_savings = COALESCE(total_savings, 0) + _discount_amount
  WHERE user_id = _client_user_id;

  IF _cashback_amount > 0 THEN
    INSERT INTO public.client_cashback_balances (user_id, partner_id, balance)
    VALUES (_client_user_id, _partner_id, _cashback_amount)
    ON CONFLICT (user_id, partner_id) DO UPDATE SET balance = public.client_cashback_balances.balance + EXCLUDED.balance, updated_at = now();
  END IF;

  RETURN _coupon_id;
END;
$$;

REVOKE ALL ON FUNCTION public.issue_coupon(uuid,uuid,numeric,numeric,numeric,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_coupon(uuid,uuid,numeric,numeric,numeric,text) TO authenticated;

-- 6) Allow companies to look up a client by CPF or card_number when generating a coupon.
--    Existing profiles policy only exposes each user's own profile. Add a scoped policy so any
--    approved-company owner can read the minimum fields to identify a client. We keep the
--    existing self-read policy intact; policies are OR-ed.
DROP POLICY IF EXISTS "approved company reads client profiles" ON public.profiles;
CREATE POLICY "approved company reads client profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  account_type = 'client'
  AND EXISTS (
    SELECT 1 FROM public.partners p
    WHERE p.created_by = auth.uid() AND p.status = 'approved'
  )
);
