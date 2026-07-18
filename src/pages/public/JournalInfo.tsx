import { Link } from 'react-router-dom';
import {
  Newspaper, TrendingUp, Store, Search, Lightbulb, Mic, Building2,
  Calendar, Sparkles, BookOpen, ArrowRight,
} from 'lucide-react';
import { useSeo } from '@/lib/useSeo';

const cards = [
  { icon: Newspaper, title: 'Notícias empresariais', desc: 'O que move o empresariado de Uruaçu.' },
  { icon: TrendingUp, title: 'Economia local', desc: 'Indicadores, tendências e análises.' },
  { icon: Store, title: 'Mercado local', desc: 'Panorama do comércio e serviços.' },
  { icon: Search, title: 'Jornalismo Investigativo', desc: 'Apuração séria, fontes checadas.' },
  { icon: Lightbulb, title: 'Jornalismo de Soluções', desc: 'Reportagens que apontam caminhos.' },
  { icon: Mic, title: 'Entrevistas exclusivas', desc: 'Vozes que constroem a cidade.' },
  { icon: Building2, title: 'Empresas em destaque', desc: 'Histórias de negócios locais.' },
  { icon: Calendar, title: 'Agenda empresarial', desc: 'Eventos, feiras e encontros.' },
  { icon: Sparkles, title: 'Oportunidades', desc: 'Editais, chamadas e conexões.' },
  { icon: BookOpen, title: 'Conteúdos exclusivos', desc: 'Materiais reservados a Membros.' },
];

export default function JournalInfo() {
  useSeo({
    title: 'R.Journal — Inteligência Empresarial de Uruaçu',
    description: 'Jornalismo de qualidade, análises e entrevistas para quem empreende em Uruaçu.',
    canonical: `${window.location.origin}/journal-info`,
  });

  return (
    <div className="animate-fadeUp pb-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-yellow-500/10 via-gray-900 to-black border border-yellow-500/40 p-6 lg:p-10 mb-6">
        <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 mb-3">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-yellow-400">R.JOURNAL</p>
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-3">
          Informação que movimenta empresas, negócios e oportunidades.
        </h1>
        <p className="text-gray-300 text-sm lg:text-base leading-relaxed mb-5 max-w-2xl">
          O R.Journal reúne jornalismo de qualidade, análises, entrevistas e conteúdos que ajudam empresários e profissionais a tomar melhores decisões.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-5 py-3 text-sm transition-colors"
          >
            Ler o R.Journal <ArrowRight size={14} />
          </Link>
          <Link
            to="/seja-membro"
            onClick={() => import('@/lib/analytics').then(m => m.trackEvent('seja_associado_click', 'journal_info_hero', 'Assinar como Associado', { origin: 'journal_info_hero' }))}
            className="inline-flex items-center gap-2 border border-gray-700 hover:border-yellow-500 text-white font-semibold px-5 py-3 text-sm transition-colors"
          >
            Assinar como Associado
          </Link>
        </div>
      </div>

      {/* Benefícios */}
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold mb-3">O que você encontra aqui</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
          {cards.map((c) => (
            <div key={c.title} className="bg-gray-900 border border-gray-800 p-3 lg:p-4">
              <c.icon size={18} className="text-yellow-400 mb-2" />
              <p className="text-white text-sm font-semibold leading-tight">{c.title}</p>
              <p className="text-gray-400 text-[11px] mt-1 leading-snug">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Diferenciais */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/40 p-6 lg:p-10 mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-yellow-400 mb-3">Diferencial</p>
        <h3 className="text-white text-2xl lg:text-3xl font-bold leading-tight mb-2">
          Não publicamos apenas notícias.
        </h3>
        <p className="text-gray-300 text-base">
          Produzimos <span className="text-yellow-400 font-semibold">inteligência</span> para quem empreende.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/seja-membro"
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 text-sm transition-colors"
        >
          Assinar o R.Journal <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
