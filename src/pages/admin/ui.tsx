import { ReactNode } from 'react';
import { ListSkeleton } from '@/components/ui/skeleton';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h1 className="text-white text-xl md:text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-[#0f1830] border border-white/10 ${className}`}>{children}</div>;
}

export function StatCard({ label, value, sub, positive }: { label: string; value: string | number; sub?: string; positive?: boolean }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-widest text-gray-400">{label}</div>
      <div className={`text-2xl mt-1 font-semibold ${positive ? 'text-green-400' : 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </Card>
  );
}

export function Btn({ children, onClick, variant = 'primary', type = 'button', disabled, className = '' }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; type?: 'button' | 'submit'; disabled?: boolean; className?: string;
}) {
  const styles = {
    primary: 'bg-yellow-500 hover:bg-yellow-400 text-black',
    secondary: 'bg-white text-black hover:bg-gray-200',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    ghost: 'bg-transparent border border-white/20 text-white hover:bg-white/5',
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full bg-[#0a0f1e] border border-white/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-yellow-500 ${props.className ?? ''}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full bg-[#0a0f1e] border border-white/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-yellow-500 ${props.className ?? ''}`} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full bg-[#0a0f1e] border border-white/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-yellow-500 ${props.className ?? ''}`} />;
}
export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-1">{children}</label>;
}

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f1830] border border-white/15 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <Card className="p-8 text-center text-gray-400 text-sm">{children}</Card>;
}
