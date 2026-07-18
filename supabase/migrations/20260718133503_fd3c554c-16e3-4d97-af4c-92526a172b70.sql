
-- Drop overly permissive policy
DROP POLICY IF EXISTS "approved company reads client profiles" ON public.profiles;

-- Secure lookup: only approved partner owners can call; returns minimal fields for a single client
CREATE OR REPLACE FUNCTION public.lookup_client_for_partner(_query text)
RETURNS TABLE (
  user_id uuid,
  name text,
  email text,
  card_number text,
  cpf text,
  is_active boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _digits text;
  _raw text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.partners p
    WHERE p.created_by = auth.uid() AND p.status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;

  _raw := trim(coalesce(_query, ''));
  IF _raw = '' THEN RETURN; END IF;
  _digits := regexp_replace(_raw, '\D', '', 'g');

  RETURN QUERY
  SELECT p.user_id, p.name, p.email, p.card_number, p.cpf, p.is_active
  FROM public.profiles p
  WHERE p.account_type = 'client'
    AND (
      (length(_digits) BETWEEN 11 AND 16 AND (p.cpf = _digits OR p.card_number = _digits))
      OR (position('@' in _raw) > 0 AND p.email = lower(_raw))
      OR (p.card_number = _raw)
    )
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.lookup_client_for_partner(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.lookup_client_for_partner(text) TO authenticated;
