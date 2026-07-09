import { ArrowLeft, Calendar, MapPin, Clock, Heart } from 'lucide-react';

interface Props { onBack: () => void; }

const events = [
  { title: 'Elas Encontro — Liderança que Transforma', date: '25 Jul 2026', time: '19h00', location: 'Espaço Rarques' },
  { title: 'Elas Talks — Empreendedorismo Feminino', date: '08 Ago 2026', time: '19h30', location: 'Online (Zoom)' },
  { title: 'Elas Café — Roda de Relacionamento', date: '22 Ago 2026', time: '09h00', location: 'Café Bistrô Central' },
];

const content = [
  { title: 'Histórias que Inspiram', desc: 'Depoimento de fundadoras da rede sobre reinvenção e propósito.' },
  { title: 'Mulheres na Sucessão Familiar', desc: 'Bastidores da transição de comando em empresas regionais.' },
];

export function ElasPage({ onBack }: Props) {
  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>
      <div className="mb-6">
        <div className="inline-flex items-center gap-1 bg-pink-500/15 border border-pink-500/40 px-2 py-0.5 mb-2">
          <Heart size={10} className="text-pink-400" />
          <p className="text-[10px] font-semibold tracking-wider text-pink-300">PILAR RARQUES</p>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Elas</h2>
        <p className="text-gray-400 text-sm">Liderança Feminina — Empreendedorismo, Desenvolvimento, Relacionamento</p>
      </div>

      <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">PRÓXIMOS ENCONTROS</h3>
      <div className="space-y-3 mb-8">
        {events.map((e) => (
          <div key={e.title} className="bg-gray-900 border border-gray-800 p-4">
            <p className="text-white font-semibold mb-2">{e.title}</p>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex items-center gap-2"><Calendar size={14} /> {e.date}</div>
              <div className="flex items-center gap-2"><Clock size={14} /> {e.time}</div>
              <div className="flex items-center gap-2"><MapPin size={14} /> {e.location}</div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">CONTEÚDO EXCLUSIVO</h3>
      <div className="space-y-3">
        {content.map((c) => (
          <div key={c.title} className="bg-gray-900 border border-gray-800 p-4">
            <p className="text-white font-semibold mb-1">{c.title}</p>
            <p className="text-gray-400 text-sm">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
