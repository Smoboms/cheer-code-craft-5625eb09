import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';

interface SectionPageProps {
  onBack: () => void;
}

const upcomingEvents = [
  { title: 'Encontro Nexus — Rodada de Negócios', date: '18 Jul 2026', time: '19h00', location: 'Espaço Rarques — Sala Executiva' },
  { title: 'Mentoria Coletiva — Vendas B2B', date: '02 Ago 2026', time: '19h30', location: 'Online (Zoom)' },
  { title: 'Nexus Connect — Café de Negócios', date: '20 Ago 2026', time: '08h00', location: 'Café Central' },
];

const pastEditions = [
  { title: 'Nexus Junho 2026', desc: 'Rodada com 32 empresários e 14 negócios fechados.' },
  { title: 'Nexus Maio 2026', desc: 'Mentoria com convidado especial do varejo nacional.' },
  { title: 'Nexus Abril 2026', desc: 'Painel sobre expansão regional e franquias.' },
];

export function NexusPage({ onBack }: SectionPageProps) {
  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="mb-6">
        <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 mb-2">
          <p className="text-[10px] font-semibold tracking-wider text-yellow-400">PILAR RARQUES</p>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Nexus</h2>
        <p className="text-gray-400 text-sm">Networking Empresarial — Eventos, Conexões, Rodadas de Negócios, Mentorias</p>
      </div>

      <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">PRÓXIMOS ENCONTROS</h3>
      <div className="space-y-3 mb-8">
        {upcomingEvents.map((e) => (
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

      <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">EDIÇÕES ANTERIORES</h3>
      <div className="grid grid-cols-2 gap-3">
        {pastEditions.map((p) => (
          <div key={p.title} className="bg-gray-900 border border-gray-800 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center">
              <span className="text-gray-600 text-xs">Foto</span>
            </div>
            <div className="p-3">
              <p className="text-white text-sm font-semibold mb-1">{p.title}</p>
              <p className="text-gray-400 text-xs">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
