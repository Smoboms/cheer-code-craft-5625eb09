// Pipeline unificado de otimização de imagens:
// converte para WEBP, redimensiona (max 1600px lado maior) e comprime.
// Retorna um Blob WEBP pronto para upload.

export interface OptimizeOptions {
  maxDimension?: number;
  quality?: number; // 0..1
  mimeType?: 'image/webp' | 'image/jpeg';
}

const DEFAULTS: Required<OptimizeOptions> = {
  maxDimension: 1600,
  quality: 0.82,
  mimeType: 'image/webp',
};

export async function optimizeImage(file: File, opts: OptimizeOptions = {}): Promise<Blob> {
  const { maxDimension, quality, mimeType } = { ...DEFAULTS, ...opts };

  // SVG e outros não-raster: passa direto
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  const bitmap = await loadBitmap(file);
  const { width, height } = fit(bitmap.width, bitmap.height, maxDimension);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, mimeType, quality),
  );

  if (!blob) return file;
  // Se o WEBP ficou maior que o original (raro), retorna original
  if (blob.size >= file.size && file.type === mimeType) return file;
  return blob;
}

/** Nome de arquivo com extensão .webp preservando prefixo. */
export function toWebpName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}.webp`;
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fallback */
    }
  }
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function fit(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w > h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}
