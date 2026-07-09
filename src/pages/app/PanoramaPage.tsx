import { ArrowLeft, Globe, MapPin, TrendingUp } from 'lucide-react';

interface Props { onBack: () => void; }

const edition = {
  month: 'Julho 2026',
  municipal: {
    title: 'Municipal',
    text: 'Arrecadação de ISS na cidade cresce 6% no trimestre, puxada por serviços e gastronomia. Para o Associado: momento favorável para reajuste de tabela em contratos B2B locais.',
  },
  nacional: {
    title: 'Nacional',
    text: 'Selic estabiliza e crédito PJ volta a fluir com spread menor. Tradução prática: renegociar dívida rotativa agora pode liberar caixa relevante para investir em estoque no segundo semestre.',
  },
  global: {
    title: 'Global',
    text: 'Cadeia de suprimentos asiática normaliza prazos e derruba custo de importação. Para quem depende de insumo importado, é hora de recomprar contratos anuais em condições melhores.',
  },
};

const blocks = [
  { key: 'municipal', icon: MapPin, color: 'text-green-400', ...edition.municipal },
  { key: 'nacional', icon: TrendingUp, color: 'text-yellow-400', ...edition.nacional },
  { key: 'global', icon: Globe, color: 'text-blue-400', ...edition.global },
];

export function PanoramaPage({ onBack }: Props) {
  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="mb-6">
        <div className="inline-block bg-white/10 border border-white/20 px-2 py-0.5 mb-2">
          <p className="text-[10px] font-semibold tracking-wider text-white">EDIÇÃO {edition.month.toUpperCase()}</p>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Panorama</h2>
        <p className="text-gray-400 text-sm">Análise econômica com tradução prática para o empresário local</p>
      </div>

      <div className="space-y-4">
        {blocks.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.key} className="bg-gray-900 border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={b.color} />
                <h3 className="text-white font-semibold">{b.title}</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{b.text}</p>
            </div>
          );
        })}
      </div>

      <p className="text-gray-500 text-xs mt-6 text-center">Nova edição a cada mês.</p>
    </div>
  );
}
