import { PilarView } from '@/components/app/PilarView';

interface Props { onBack: () => void; }

export function NexusPage({ onBack }: Props) {
  return (
    <PilarView
      pilar="nexus"
      title="Nexus"
      subtitle="Networking Empresarial — Eventos, Conexões, Rodadas de Negócios, Mentorias"
      badge={{ label: 'PILAR RARQUES', className: 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400' }}
      onBack={onBack}
    />
  );
}
