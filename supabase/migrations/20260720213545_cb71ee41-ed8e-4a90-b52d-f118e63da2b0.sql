
-- 1) Validation trigger for public professional submissions
CREATE OR REPLACE FUNCTION public.validate_professional_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trim inputs
  NEW.name := btrim(COALESCE(NEW.name, ''));
  NEW.whatsapp := btrim(COALESCE(NEW.whatsapp, ''));
  NEW.category := btrim(COALESCE(NEW.category, ''));
  NEW.category_slug := btrim(COALESCE(NEW.category_slug, ''));
  NEW.city := NULLIF(btrim(COALESCE(NEW.city, '')), '');
  NEW.neighborhood := NULLIF(btrim(COALESCE(NEW.neighborhood, '')), '');
  NEW.description := NULLIF(btrim(COALESCE(NEW.description, '')), '');
  NEW.photo_url := NULLIF(btrim(COALESCE(NEW.photo_url, '')), '');

  -- Required fields
  IF char_length(NEW.name) < 2 OR char_length(NEW.name) > 120 THEN
    RAISE EXCEPTION 'Nome inválido';
  END IF;
  IF char_length(NEW.whatsapp) < 8 OR char_length(NEW.whatsapp) > 20 THEN
    RAISE EXCEPTION 'WhatsApp inválido';
  END IF;
  IF NEW.whatsapp !~ '^[0-9+()\-\s]+$' THEN
    RAISE EXCEPTION 'WhatsApp contém caracteres inválidos';
  END IF;
  IF char_length(NEW.category) = 0 OR char_length(NEW.category) > 80 THEN
    RAISE EXCEPTION 'Categoria inválida';
  END IF;
  IF NEW.category_slug IS NULL OR NEW.category_slug !~ '^[a-z0-9-]{1,80}$' THEN
    RAISE EXCEPTION 'Categoria inválida';
  END IF;

  -- Length limits
  IF NEW.city IS NOT NULL AND char_length(NEW.city) > 80 THEN
    RAISE EXCEPTION 'Cidade muito longa';
  END IF;
  IF NEW.neighborhood IS NOT NULL AND char_length(NEW.neighborhood) > 80 THEN
    RAISE EXCEPTION 'Bairro muito longo';
  END IF;
  IF NEW.description IS NOT NULL AND char_length(NEW.description) > 600 THEN
    RAISE EXCEPTION 'Descrição muito longa';
  END IF;

  -- Photo URL: require https and reasonable length
  IF NEW.photo_url IS NOT NULL THEN
    IF char_length(NEW.photo_url) > 500 THEN
      RAISE EXCEPTION 'URL de foto muito longa';
    END IF;
    IF NEW.photo_url !~* '^https://' THEN
      RAISE EXCEPTION 'URL de foto deve usar https';
    END IF;
  END IF;

  -- Force safe defaults for public submissions (non-admins)
  IF NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    NEW.status := 'pending';
    NEW.is_active := COALESCE(NEW.is_active, true);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_professional_submission ON public.professionals;
CREATE TRIGGER trg_validate_professional_submission
BEFORE INSERT OR UPDATE ON public.professionals
FOR EACH ROW EXECUTE FUNCTION public.validate_professional_submission();

-- 2) Align storage policy with bucket reality (partner-images is a public bucket)
DROP POLICY IF EXISTS "Partner images are publicly accessible" ON storage.objects;
CREATE POLICY "Partner images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'partner-images');
