import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JournalArticle {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  cover_url: string | null;
  featured: boolean;
  published_at: string;
}

export function useJournalArticles() {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todas']);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [artsRes, catsRes] = await Promise.all([
      supabase
        .from('journal_articles')
        .select('id,title,category,excerpt,body,cover_url,featured,published_at')
        .order('published_at', { ascending: false }),
      supabase.from('article_categories').select('name').order('name'),
    ]);
    const arts = ((artsRes.data as any) || []).map((a: any) => ({
      ...a,
      category: a.category || 'Geral',
      excerpt: a.excerpt || '',
      body: a.body || '',
    })) as JournalArticle[];
    setArticles(arts);
    const catNames = ((catsRes.data as any) || []).map((c: any) => c.name as string);
    // fallback: also include any category actually used
    const fromArts = Array.from(new Set(arts.map((a) => a.category).filter(Boolean)));
    const merged = Array.from(new Set([...catNames, ...fromArts]));
    setCategories(['Todas', ...merged]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel('journal_articles_public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_articles' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return { articles, categories, loading };
}
