import { Award } from 'lucide-react';
import { PilarView } from '@/components/app/PilarView';

interface Props { onBack: () => void; }

export function MagnaPage({ onBack }: Props) {
  return (
    <PilarView
      pilar="magna"
      title="Magna"
      subtitle='"Não é vendido, é conquistado." — Legado empresarial reconhecido por mérito.'
      badge={{
        label: 'RECONHECIMENTO',
        icon: <Award size={10} className="text-yellow-400" />,
        className: 'bg-yellow-500/15 border border-yellow-500/40 text-yellow-400',
      }}
      onBack={onBack}
    />
  );
}
