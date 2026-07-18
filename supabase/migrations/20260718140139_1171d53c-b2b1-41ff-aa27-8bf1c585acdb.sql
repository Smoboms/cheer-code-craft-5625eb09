INSERT INTO public.article_categories (name)
SELECT unnest(ARRAY['Geral','Economia','Negócios','Cultura','Uruaçu','Nacional'])
ON CONFLICT DO NOTHING;