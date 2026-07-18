import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';
import {
  CreditCard, Gift, Percent, Users, Sparkles, Crown, Award, Building2,
  ShoppingBag, Newspaper, Wrench, Scale, TrendingUp, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { useSeo } from '@/lib/useSeo';

const benefits = [
  { icon: CreditCard, title: 'R.Card Digital', desc: 'Sua identidade oficial de Associado Rarques.' },
  { icon: Gift, title: 'Benefícios Exclusivos', desc: 'Vantagens reservadas somente a Membros.' },
  { icon: Percent, title: 'Economia em Parceiras', desc: 'Descontos reais em dezenas de empresas.' },
  { icon: Users, title: 'Networking empresarial', desc: 'Conexões de alto nível em Uruaçu.' },
  { icon: Sparkles, title: 'Nexus', desc: 'Encontros de liderança e conteúdo estratégico.' },
  { icon: Crown, title: 'Elas', desc: 'Pilar dedicado às mulheres empreendedoras.' },
  { icon: Award, title: 'Magna', desc: 'Reconhecimento merecido — não se compra.' },
  { icon: Building2, title: 'Minha Empresa', desc: 'Painel para gerir seu perfil público.' },
  { icon: ShoppingBag, title: 'Marketplace da Cidade', desc: 'Publique produtos no Mercado Rarques.' },
  { icon: Newspaper, title: 'Rarques Journal', desc: 'Inteligência empresarial de Uruaçu.' },
  { icon: Wrench, title: 'Ferramentas empresariais', desc: 'Recursos para crescer com método.' },
  { icon: Scale, title: 'Jurídico Empresarial', desc: 'Apoio jurídico especializado.' },
  { icon: TrendingUp, title: 'Visibilidade', desc: 'Mais alcance para sua empresa.' },
];

const steps = [
  { n: '01', title: 'Associe-se', desc: 'Torne-se um Associado Rarques.' },
  { n: '02', title: 'Cadastre sua empresa', desc: 'Complete seu perfil público.' },
  { n: '03', title: 'Publique produtos', desc: 'Marketplace da Cidade Inteligente.' },
  { n: '04', title: 'Conecte-se', desc: 'Entre no ecossistema empresarial.' },
];

export default function SejaMembro() {
  useSeo({
    title: 'Seja Membro Rarques Association — Uruaçu',
    description: 'Faça parte do maior ecossistema empresarial de Uruaçu. R.Card, benefícios, networking, marketplace e muito mais.',
    canonical: `${window.location.origin}/seja-membro`,
  });

  return (
    <div className="animate-fadeUp pb-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-yellow-500/10 via-gray-900 to-black border border-yellow-500/40 p-6 lg:p-10 mb-6">
        <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 mb-3">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-yellow-400">RARQUES ASSOCIATION</p>
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-3">
          Faça parte da Rarques Association.
        </h1>
        <p className="text-gray-300 text-sm lg:text-base leading-relaxed mb-5 max-w-2xl">
          Conecte sua empresa ao maior ecossistema empresarial de Uruaçu.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-5 py-3 text-sm transition-colors"
          >
            Quero ser um Associado <ArrowRight size={14} />
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 border border-gray-700 hover:border-yellow-500 text-white font-semibold px-5 py-3 text-sm transition-colors"
          >
            Já sou Associado — Entrar
          </Link>
        </div>
      </div>

      {/* Benefícios */}
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold mb-3">O que você recebe como Associado</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
          {benefits.map((b) => (
            <div key={b.title} className="bg-gray-900 border border-gray-800 p-3 lg:p-4">
              <b.icon size={18} className="text-yellow-400 mb-2" />
              <p className="text-white text-sm font-semibold leading-tight">{b.title}</p>
              <p className="text-gray-400 text-[11px] mt-1 leading-snug">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Como funciona */}
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold mb-3">Como funciona</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {steps.map((s) => (
            <div key={s.n} className="bg-gray-900 border border-gray-800 p-4">
              <p className="text-yellow-400 text-xs font-bold tracking-wider">PASSO {s.n}</p>
              <p className="text-white text-sm font-semibold mt-1">{s.title}</p>
              <p className="text-gray-400 text-xs mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/40 p-6 lg:p-10 text-center">
        <CheckCircle2 size={28} className="text-yellow-400 mx-auto mb-3" />
        <h3 className="text-white text-2xl lg:text-3xl font-bold mb-2">Sua vez de fazer parte.</h3>
        <p className="text-gray-300 text-sm mb-5">Junte-se ao ecossistema Rarques.</p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 text-sm transition-colors"
        >
          Quero fazer parte da Rarques <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
