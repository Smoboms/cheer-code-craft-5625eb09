import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description?: string;
  canonical?: string;
}

/**
 * Lightweight per-page SEO: atualiza <title>, meta description e canonical
 * client-side. Suficiente para crawlers que executam JS (Googlebot).
 */
export function useSeo({ title, description, canonical }: SeoOptions) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) {
        m = document.createElement('meta');
        m.setAttribute('name', 'description');
        document.head.appendChild(m);
      }
      m.setAttribute('content', description);

      let og = document.querySelector('meta[property="og:description"]');
      if (og) og.setAttribute('content', description);
    }

    if (title) {
      let ogT = document.querySelector('meta[property="og:title"]');
      if (ogT) ogT.setAttribute('content', title);
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [title, description, canonical]);
}
