import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE } from '@/lib/queryConfig';

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

type JournalData = {
  articles: JournalArticle[];
  categories: string[];
};

const QUERY_KEY = ['journal-articles', 'public'] as const;

export function useJournalArticles() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<JournalData> => {
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
      const catNames = ((catsRes.data as any) || []).map((c: any) => c.name as string);
      const fromArts = Array.from(new Set(arts.map((a) => a.category).filter(Boolean)));
      const merged = Array.from(new Set([...catNames, ...fromArts]));
      return { articles: arts, categories: ['Todas', ...merged] };
    },
    ...CACHE.PUBLIC,
  });

  // Preserve realtime: invalidate cache when article table changes.
  useEffect(() => {
    const ch = supabase
      .channel('journal_articles_public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_articles' }, () => {
        qc.invalidateQueries({ queryKey: QUERY_KEY });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return {
    articles: data?.articles ?? [],
    categories: data?.categories ?? ['Todas'],
    loading: isLoading,
  };
}
