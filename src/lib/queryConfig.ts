/**
 * Cache tiers used across the app (Fase 3.1 — Performance Front-end).
 *
 * PUBLIC: leitura pública, baixa volatilidade (banners, categorias, cidades,
 *   parceiros, profissionais, journal, pilares, atalhos, locais).
 * AUTH: leitura autenticada (perfil, minha empresa, produtos, benefícios,
 *   cashback).
 * CRITICAL: dados críticos que precisam ser sempre frescos (cupons,
 *   pagamentos, feature flags, financeiro). NÃO devem usar staleTime > 0.
 *
 * Não alterar valores sem antes revisar impacto em UX/consistência.
 */
export const CACHE = {
  PUBLIC: {
    staleTime: 5 * 60_000, // 5 min
    gcTime: 10 * 60_000,
  },
  AUTH: {
    staleTime: 60_000, // 1 min
    gcTime: 5 * 60_000,
  },
  CRITICAL: {
    staleTime: 0,
    gcTime: 60_000,
    refetchOnMount: 'always' as const,
  },
} as const;
