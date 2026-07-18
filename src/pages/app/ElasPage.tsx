import { Heart } from 'lucide-react';
import { PilarView } from '@/components/app/PilarView';

interface Props { onBack: () => void; }

export function ElasPage({ onBack }: Props) {
  return (
    <PilarView
      pilar="elas"
      title="Elas"
      subtitle="Liderança Feminina — Empreendedorismo, Desenvolvimento, Relacionamento"
      badge={{
        label: 'PILAR RARQUES',
        icon: <Heart size={10} className="text-pink-400" />,
        className: 'bg-pink-500/15 border border-pink-500/40 text-pink-300',
      }}
      onBack={onBack}
    />
  );
}
