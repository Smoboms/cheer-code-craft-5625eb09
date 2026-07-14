
-- Allow authenticated users to insert/select/update ONLY their own partner row.
CREATE POLICY "Users can insert own partner"
ON public.partners FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own partner"
ON public.partners FOR UPDATE TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own partner"
ON public.partners FOR SELECT TO authenticated
USING (auth.uid() = created_by);

-- Seed public_home_banner row 1 so admin updates apply.
INSERT INTO public.public_home_banner (id, active, title, text, cta_label, cta_href, image_url)
VALUES (1, false, '', '', 'Saiba mais', '', '')
ON CONFLICT (id) DO NOTHING;

-- Allow admin to insert the banner row (defensive; row is seeded above).
CREATE POLICY "admin insert banner"
ON public.public_home_banner FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
