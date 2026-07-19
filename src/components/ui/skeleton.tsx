import { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
}

/**
 * Bloco de skeleton animado (shimmer).
 * Sempre defina width/height (ou via className) para evitar CLS.
 */
export function Skeleton({ className = '', width, height, style, rounded = 'md' }: SkeletonProps) {
  const radius =
    rounded === 'full' ? '9999px' :
    rounded === 'lg' ? '12px' :
    rounded === 'sm' ? '4px' :
    rounded === 'none' ? '0' : '6px';
  return (
    <div
      className={`skeleton-block ${className}`}
      style={{
        width: width ?? '100%',
        height: height ?? 16,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/** Lista de linhas — para Associados, Empresas, Cupons, etc. */
export function ListSkeleton({ rows = 6, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-md">
          <Skeleton width={40} height={40} rounded="full" />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={12} />
            <Skeleton width="40%" height={10} />
          </div>
          <Skeleton width={70} height={22} />
        </div>
      ))}
    </div>
  );
}

/** Grade de cards — Marketplace, Empresas, Journal. */
export function CardGridSkeleton({ items = 6, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-black/20 border border-white/5 rounded-lg overflow-hidden">
          <Skeleton height={140} rounded="none" />
          <div className="p-4 space-y-2">
            <Skeleton width="80%" height={14} />
            <Skeleton width="55%" height={12} />
            <Skeleton width="30%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Dashboard — cards + gráfico + tabela. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-black/20 border border-white/5 rounded-md p-4 space-y-2">
            <Skeleton width="60%" height={10} />
            <Skeleton width="45%" height={22} />
          </div>
        ))}
      </div>
      <div className="bg-black/20 border border-white/5 rounded-md p-4">
        <Skeleton width="30%" height={12} className="mb-4" />
        <Skeleton height={180} />
      </div>
      <ListSkeleton rows={4} />
    </div>
  );
}

/** Página inteira — usada como fallback de rota. */
export function PageSkeleton() {
  return (
    <div className="min-h-[60vh] p-4 sm:p-6 max-w-6xl mx-auto space-y-4 route-fade">
      <Skeleton width="35%" height={22} />
      <Skeleton width="55%" height={12} />
      <div className="pt-4">
        <CardGridSkeleton items={6} />
      </div>
    </div>
  );
}

/** Article — Journal detalhado. */
export function ArticleSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4 route-fade">
      <Skeleton width="40%" height={10} />
      <Skeleton width="90%" height={26} />
      <Skeleton width="70%" height={26} />
      <Skeleton height={240} className="my-4" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} width={i % 3 === 0 ? '85%' : '95%'} height={10} />
      ))}
    </div>
  );
}

/** Profile — avatar + campos. */
export function ProfileSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 route-fade">
      <div className="flex items-center gap-4">
        <Skeleton width={72} height={72} rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-black/20 border border-white/5 rounded-md p-4 space-y-2">
          <Skeleton width="30%" height={10} />
          <Skeleton height={14} />
        </div>
      ))}
    </div>
  );
}
