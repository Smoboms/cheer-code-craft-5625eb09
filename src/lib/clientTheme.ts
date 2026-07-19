/**
 * Paleta exclusiva da Área Cliente (laranja queimado/cobre + preto).
 * Não aplicar em Área Empresa (mantém preto+dourado) nem na Área Pública.
 */
export const CLIENT_ACCENT = '#B85C2E';
export const CLIENT_ACCENT_SOFT = '#7A3B1D';

export type AccentPalette = {
  isClient: boolean;
  /** Ex.: "text-yellow-400" ou classe arbitrária laranja para clientes */
  accentText: string;
  accentBorder: string;
  accentBg: string;
  accentBgSoft: string;
  /** Gradient do card R-CARD */
  cardGradient: string;
  cardBorder: string;
};

export function paletteFor(accountType: 'client' | 'company' | null | undefined): AccentPalette {
  const isClient = accountType === 'client';
  if (isClient) {
    return {
      isClient: true,
      accentText: 'text-[#B85C2E]',
      accentBorder: 'border-[#B85C2E]',
      accentBg: 'bg-[#B85C2E]',
      accentBgSoft: 'bg-[#B85C2E]/15',
      cardGradient: 'bg-gradient-to-br from-black via-[#3a1d0f] to-black',
      cardBorder: 'border-[#B85C2E]/70',
    };
  }
  return {
    isClient: false,
    accentText: 'text-yellow-400',
    accentBorder: 'border-yellow-500',
    accentBg: 'bg-yellow-500',
    accentBgSoft: 'bg-yellow-500/15',
    cardGradient: 'bg-gradient-to-br from-black via-gray-900 to-black',
    cardBorder: 'border-white/80',
  };
}
