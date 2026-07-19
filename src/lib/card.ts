/**
 * R-CARD formatting helpers.
 * card_code (6 chars) is stored raw in the DB; display uses XXX-XXX.
 * card_number (16 digits) is stored raw; display uses "0000 0000 0000 0000".
 */

export function formatCardCode(code?: string | null): string {
  if (!code) return '';
  const clean = code.trim().toUpperCase();
  if (clean.length !== 6) return clean;
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}`;
}

export function normalizeCardCode(input: string): string {
  return input.replace(/[^0-9A-Z]/gi, '').toUpperCase();
}

export function formatCardNumber(num?: string | null): string {
  if (!num) return '';
  const digits = num.replace(/\D/g, '');
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}
