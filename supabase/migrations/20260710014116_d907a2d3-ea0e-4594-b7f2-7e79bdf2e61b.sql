
CREATE TABLE public.marketplace_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  description text,
  price numeric,
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending_curation',
  rejection_reason text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.marketplace_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_products TO authenticated;
GRANT ALL ON public.marketplace_products TO service_role;

ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- Public read of approved+active products from member partners
CREATE POLICY "Public can view approved active products"
ON public.marketplace_products FOR SELECT
USING (
  status = 'approved' AND is_active = true
  AND EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.is_active = true)
);

-- Owners (partner creator) manage own products
CREATE POLICY "Partner owner can view own products"
ON public.marketplace_products FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.created_by = auth.uid()));

CREATE POLICY "Partner owner can insert own products"
ON public.marketplace_products FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.created_by = auth.uid()));

CREATE POLICY "Partner owner can update own products"
ON public.marketplace_products FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.created_by = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.created_by = auth.uid()));

CREATE POLICY "Partner owner can delete own products"
ON public.marketplace_products FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.created_by = auth.uid()));

-- Admin full access
CREATE POLICY "Admins can view all products"
ON public.marketplace_products FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert products"
ON public.marketplace_products FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.marketplace_products FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.marketplace_products FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_marketplace_products_updated_at
BEFORE UPDATE ON public.marketplace_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_marketplace_products_partner ON public.marketplace_products(partner_id);
CREATE INDEX idx_marketplace_products_status ON public.marketplace_products(status);
CREATE INDEX idx_marketplace_products_category ON public.marketplace_products(category);
