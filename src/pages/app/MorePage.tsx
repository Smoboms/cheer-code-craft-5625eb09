import { Users, Heart, Award, Globe, Building2, TrendingUp, Tag, LucideIcon } from 'lucide-react';

export type MoreSection = 'nexus' | 'elas' | 'magna' | 'panorama' | 'minhaempresa' | 'crescer' | 'beneficios';

interface Props {
  onOpen: (section: MoreSection) => void;
}

const items: { key: MoreSection; label: string; desc: string; icon: LucideIcon; accent: string }[] = [
  { key: 'nexus', label: 'Nexus', desc: 'Networking e rodadas', icon: Users, accent: 'text-yellow-400' },
  { key: 'elas', label: 'Elas', desc: 'Liderança feminina', icon: Heart, accent: 'text-pink-400' },
  { key: 'magna', label: 'Magna', desc: 'Legado e reconhecimento', icon: Award, accent: 'text-yellow-400' },
  { key: 'panorama', label: 'Panorama', desc: 'Análise econômica', icon: Globe, accent: 'text-blue-400' },
  { key: 'minhaempresa', label: 'Minha Empresa', desc: 'Perfil no diretório', icon: Building2, accent: 'text-white' },
  { key: 'crescer', label: 'Crescer', desc: 'Termômetro do Negócio', icon: TrendingUp, accent: 'text-green-400' },
  { key: 'beneficios', label: 'Benefícios', desc: 'Parceiros e descontos', icon: Tag, accent: 'text-green-400' },
];

export function MorePage({ onOpen }: Props) {
  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Mais</h2>
        <p className="text-gray-400 text-sm">Todos os pilares e ferramentas Rarques</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.key}
              onClick={() => onOpen(it.key)}
              className="bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors p-3 text-left flex flex-col gap-2"
            >
              <Icon size={20} className={it.accent} />
              <div className="mt-auto">
                <p className="text-white font-semibold text-sm">{it.label}</p>
                <p className="text-gray-400 text-[11px] mt-0.5 leading-tight">{it.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
