
-- Column-level revoke: anonymous visitors cannot read partner PII even if a query asks for *
REVOKE SELECT (cnpj, email, legal_name, responsible, rejection_reason) ON public.partners FROM anon;
