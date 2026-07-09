import { ArrowLeft, Award } from 'lucide-react';

interface Props { onBack: () => void; }

const profiles = [
  { name: 'José R. Almeida', title: 'Fundador — Grupo Almeida', legacy: '40 anos construindo uma rede de varejo referência na região.' },
  { name: 'Marta Silveira', title: 'CEO — Silveira Indústria', legacy: 'Terceira geração no comando, expansão para três estados.' },
  { name: 'Cel. Reinaldo Bastos', title: 'Fundador — Bastos Logística', legacy: 'Pioneiro no transporte regional, hoje operação nacional.' },
];

export function MagnaPage({ onBack }: Props) {
  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="mb-6">
        <div className="inline-flex items-center gap-1 bg-yellow-500/15 border border-yellow-500/40 px-2 py-0.5 mb-2">
          <Award size={10} className="text-yellow-400" />
          <p className="text-[10px] font-semibold tracking-wider text-yellow-400">RECONHECIMENTO</p>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Magna</h2>
        <p className="text-gray-300 text-sm italic">"Não é vendido, é conquistado."</p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-4 mb-6">
        <p className="text-gray-300 text-sm leading-relaxed">
          Magna é o pilar que celebra o legado empresarial dos que construíram e sustentaram negócios de referência.
          Aqui reconhecemos histórias que merecem ser lembradas — não por marketing, mas por mérito.
        </p>
      </div>

      <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">PERFIS RECONHECIDOS</h3>
      <div className="space-y-3">
        {profiles.map((p) => (
          <div key={p.name} className="bg-gray-900 border border-gray-800 p-4 flex gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-700 flex-shrink-0 flex items-center justify-center">
              <Award size={22} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{p.name}</p>
              <p className="text-yellow-400 text-xs mb-1">{p.title}</p>
              <p className="text-gray-400 text-sm">{p.legacy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
