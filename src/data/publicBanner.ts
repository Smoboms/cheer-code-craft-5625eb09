import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type BannerTarget = 'public' | 'associate' | 'both';

export interface BannerSlide {
  imageUrl: string;
  ctaHref: string;
  target: BannerTarget;
}

export interface PublicBannerConfig {
  active: boolean;
  title: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  slides: BannerSlide[];
}

const DEFAULT_CONFIG: PublicBannerConfig = {
  active: false,
  title: '',
  text: '',
  ctaLabel: 'Saiba mais',
  ctaHref: '',
  imageUrl: '',
  slides: [],
};

function normalizeSlides(raw: any): BannerSlide[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s: any) => ({
      imageUrl: String(s?.imageUrl || s?.image_url || '').trim(),
      ctaHref: String(s?.ctaHref || s?.cta_href || '').trim(),
      target: (['public', 'associate', 'both'].includes(s?.target) ? s.target : 'public') as BannerTarget,
    }))
    .filter((s) => !!s.imageUrl)
    .slice(0, 4);
}

function fromRow(row: any): PublicBannerConfig {
  if (!row) return DEFAULT_CONFIG;
  return {
    active: !!row.active,
    title: row.title || '',
    text: row.text || '',
    ctaLabel: row.cta_label || 'Saiba mais',
    ctaHref: row.cta_href || '',
    imageUrl: row.image_url || '',
    slides: normalizeSlides(row.slides),
  };
}

export async function fetchBannerConfig(): Promise<PublicBannerConfig> {
  const { data } = await supabase
    .from('public_home_banner')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  return fromRow(data);
}

export function usePublicBanner(): PublicBannerConfig {
  const [cfg, setCfg] = useState<PublicBannerConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    let active = true;
    fetchBannerConfig().then((c) => { if (active) setCfg(c); });

    const channel = supabase
      .channel('public_home_banner_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'public_home_banner' },
        (payload: any) => {
          if (!active) return;
          if (payload.new) setCfg(fromRow(payload.new));
        },
      )
      .subscribe();

    const onCustom = () => { fetchBannerConfig().then((c) => active && setCfg(c)); };
    window.addEventListener('rarques:publicBanner:updated', onCustom);

    return () => {
      active = false;
      supabase.removeChannel(channel);
      window.removeEventListener('rarques:publicBanner:updated', onCustom);
    };
  }, []);

  return cfg;
}

export function filterSlidesFor(cfg: PublicBannerConfig, audience: 'public' | 'associate'): BannerSlide[] {
  if (!cfg.active) return [];
  return cfg.slides.filter((s) => s.target === audience || s.target === 'both');
}
