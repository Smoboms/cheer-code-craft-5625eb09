
CREATE TABLE public.revenue_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_type TEXT NOT NULL DEFAULT 'anual',
  default_amount NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'em_definicao',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.revenue_streams TO authenticated;
GRANT ALL ON public.revenue_streams TO service_role;
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manages revenue_streams" ON public.revenue_streams
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revenue_stream_id UUID NOT NULL REFERENCES public.revenue_streams(id) ON DELETE RESTRICT,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  payer_user_id UUID,
  amount NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  next_due_date DATE,
  status TEXT NOT NULL DEFAULT 'pago',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manages payments" ON public.payments
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX idx_payments_stream ON public.payments(revenue_stream_id);
CREATE INDEX idx_payments_partner ON public.payments(partner_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date DESC);

CREATE TRIGGER trg_revenue_streams_updated BEFORE UPDATE ON public.revenue_streams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.revenue_streams (name, billing_type, default_amount, status, sort_order) VALUES
  ('Empresas Associadas', 'anual', 997.00, 'ativo', 1),
  ('R-CARD Benefícios (Clientes)', 'mensal', NULL, 'em_definicao', 2),
  ('Assinatura R.Journal', 'mensal', NULL, 'em_definicao', 3),
  ('Mensalidade de Produtos (Mercado)', 'mensal', NULL, 'em_definicao', 4);
