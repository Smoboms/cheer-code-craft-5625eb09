import { useEffect, useState } from 'react';

export interface PublicBannerConfig {
  active: boolean;
  title: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
}

const STORAGE_KEY = 'rarques.publicHomeBanner.v1';

const DEFAULT_CONFIG: PublicBannerConfig = {
  active: false,
  title: '',
  text: '',
  ctaLabel: 'Saiba mais',
  ctaHref: '',
  imageUrl: '',
};

export function loadBannerConfig(): PublicBannerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveBannerConfig(cfg: PublicBannerConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent('rarques:publicBanner:updated'));
}

export function usePublicBanner(): PublicBannerConfig {
  const [cfg, setCfg] = useState<PublicBannerConfig>(() => loadBannerConfig());
  useEffect(() => {
    const handler = () => setCfg(loadBannerConfig());
    window.addEventListener('rarques:publicBanner:updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('rarques:publicBanner:updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);
  return cfg;
}
