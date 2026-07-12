import { ArrowLeft, Scale, ShieldCheck, FileText, Briefcase, Landmark, HandCoins, Sparkles, MessageCircle } from 'lucide-react';

interface Props { onBack: () => void; }

const WA_NUMBER = '5561995140607';
const WA_MESSAGE =
  'Olá! Estou vindo da plataforma Rarques e gostaria de falar com o especialista Dr. Rodrigo Ramos nosso Advogado Jurídico Empresarial.';
const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

const areas = [
  { icon: FileText, title: 'Contratos', desc: 'Elaboração e revisão contratual estratégica.' },
  { icon: Briefcase, title: 'Trabalhista', desc: 'Prevenção de passivos e defesa empresarial.' },
  { icon: Landmark, title: 'Tributário', desc: 'Planejamento e recuperação de créditos.' },
  { icon: ShieldCheck, title: 'Empresarial', desc: 'Societário, M&A e governança.' },
  { icon: HandCoins, title: 'Recuperação de Crédito', desc: 'Cobrança judicial e extrajudicial.' },
  { icon: Sparkles, title: 'Consultoria Preventiva', desc: 'Diagnóstico jurídico contínuo.' },
];

const benefits = [
  'Atendimento consultivo prioritário para Associados Rarques.',
  'Redução de riscos jurídicos e passivos ocultos.',
  'Segurança em contratos, negociações e expansões.',
  'Especialista dedicado com visão empresarial.',
];

const flow = [
  { n: '01', t: 'Contato pelo botão “Meu Advogado”.' },
  { n: '02', t: 'Triagem inicial da demanda pelo especialista.' },
  { n: '03', t: 'Reunião estratégica e proposta de atuação.' },
  { n: '04', t: 'Execução com acompanhamento contínuo.' },
];

export function JuridicoEmpresarialPage({ onBack }: Props) {
  return (
    <div className="animate-fadeUp pb-24">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="mb-6">
        <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 mb-2">
          <p className="text-[10px] font-semibold tracking-wider text-yellow-400">PILAR RARQUES</p>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Scale size={22} className="text-yellow-400" /> Jurídico Empresarial
        </h2>
        <p className="text-gray-400 text-sm">
          Assessoria Jurídica Empresarial da Rarques — proteção, previsibilidade e crescimento seguro para o seu negócio.
        </p>
      </div>

      <div className="bg-gradient-to-br from-yellow-500/10 to-black border border-yellow-500/30 p-4 mb-6">
        <p className="text-white text-sm leading-relaxed">
          Um advogado empresarial ao lado do Associado, com visão estratégica e foco em resultado. Blindagem jurídica
          para contratos, decisões e expansões — do dia a dia às operações mais complexas.
        </p>
      </div>

      <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">BENEFÍCIOS PARA O ASSOCIADO</h3>
      <div className="space-y-2 mb-8">
        {benefits.map((b) => (
          <div key={b} className="bg-gray-900 border border-gray-800 p-3 flex items-start gap-2">
            <ShieldCheck size={16} className="text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-gray-200 text-sm leading-snug">{b}</p>
          </div>
        ))}
      </div>

      <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">ÁREAS DE ATUAÇÃO</h3>
      <div className="grid grid-cols-2 gap-2 mb-8">
        {areas.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.title} className="bg-gray-900 border border-gray-800 p-3">
              <Icon size={18} className="text-yellow-400 mb-1.5" />
              <p className="text-white font-semibold text-xs mb-0.5">{a.title}</p>
              <p className="text-gray-400 text-[11px] leading-tight">{a.desc}</p>
            </div>
          );
        })}
      </div>

      <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">COMO FUNCIONA</h3>
      <div className="grid grid-cols-2 gap-2 mb-8">
        {flow.map((f) => (
          <div key={f.n} className="bg-gray-900 border border-gray-800 p-3">
            <p className="text-yellow-400 text-lg font-bold">{f.n}</p>
            <p className="text-white text-xs mt-1 leading-snug">{f.t}</p>
          </div>
        ))}
      </div>

      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        className="block bg-gradient-to-r from-yellow-500 to-yellow-400 text-black text-center font-bold py-4 hover:brightness-110 transition-all"
      >
        Falar com o Advogado agora
      </a>

      {/* Botão fixo "Meu Advogado" */}
      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Meu Advogado no WhatsApp"
        className="fixed bottom-24 right-4 z-40 bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-3 shadow-2xl flex items-center gap-2 border-2 border-black"
      >
        <MessageCircle size={18} /> Meu Advogado
      </a>
    </div>
  );
}
