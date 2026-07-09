import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';


interface Props { onBack: () => void; }

const categories = ['Todas', 'Economia', 'Mercado', 'Negócios', 'Desenvolvimento Regional', 'Inovação'] as const;

const articles = [
  {
    id: 1,
    category: 'Economia',
    title: 'O que o novo ciclo de juros muda para o varejo regional',
    excerpt: 'Uma leitura prática de como o custo do dinheiro afeta estoque, crédito ao consumidor e margem.',
    body: 'A recente inflexão da política monetária redesenha o cenário de crédito no varejo regional. Empresas que dependem de giro rápido precisam recalibrar prazos com fornecedores e revisitar a política de parcelamento ao cliente final. Ao mesmo tempo, o momento abre janela para renegociar dívidas antigas em condições mais favoráveis. O Associado que entender esse movimento antes da concorrência sai na frente.',
  },
  {
    id: 2,
    category: 'Mercado',
    title: 'Consumo local em alta: o mapa das oportunidades',
    excerpt: 'Setores que mais crescem na região e onde o dinheiro do consumidor está indo de fato.',
    body: 'Dados de movimentação do trimestre mostram crescimento acima da média em três setores: gastronomia, bem-estar e serviços recorrentes. A leitura correta desse dado não é copiar o vizinho, e sim identificar em que ponto da sua operação já existe demanda reprimida que pode ser convertida em receita adicional imediata.',
  },
  {
    id: 3,
    category: 'Negócios',
    title: 'Sucessão que não trava a empresa',
    excerpt: 'Como preparar a próxima geração sem parar o motor que faz a operação girar hoje.',
    body: 'A sucessão bem feita não é um evento, é um processo. Começa por separar governança de operação, segue por criar autonomia de decisão em camadas intermediárias e termina com o fundador migrando para conselho antes de sair do dia a dia. Empresas familiares que atropelam esse rito costumam pagar caro dois anos depois.',
  },
  {
    id: 4,
    category: 'Desenvolvimento Regional',
    title: 'Infraestrutura logística e o próximo salto',
    excerpt: 'Obras em andamento e o impacto direto no custo de operar na região.',
    body: 'Duas frentes de infraestrutura em execução prometem reduzir o custo logístico regional em até dois dígitos nos próximos 24 meses. Para o Associado que trabalha com distribuição, isso significa espaço para renegociar frete, revisar praças atendidas e, principalmente, considerar novos mercados que hoje ficam fora do raio economicamente viável.',
  },
  {
    id: 5,
    category: 'Inovação',
    title: 'IA na pequena empresa: por onde começar sem queimar caixa',
    excerpt: 'Três frentes de aplicação prática que já pagam o investimento no primeiro trimestre.',
    body: 'Ignorar IA em 2026 é o equivalente a ignorar internet em 2005. Mas adotar mal é queimar dinheiro. As três frentes que mais rápido retornam para empresas regionais são: atendimento (redução de tempo de resposta), operações internas (relatórios e conciliações) e prospecção (qualificação de leads). Comece por uma, meça, avance.',
  },
];

export function JournalPage({ onBack }: Props) {
  const [active, setActive] = useState<(typeof categories)[number]>('Todas');
  const [openId, setOpenId] = useState<number | null>(null);

  const list = active === 'Todas' ? articles : articles.filter((a) => a.category === active);
  const openArticle = articles.find((a) => a.id === openId);

  if (openArticle) {
    return (
      <div className="animate-fadeUp pb-4">
        <button onClick={() => setOpenId(null)} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 mb-2">
          <p className="text-[10px] font-semibold tracking-wider text-yellow-400">{openArticle.category.toUpperCase()}</p>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{openArticle.title}</h2>
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-950 mb-4" />
        <p className="text-gray-200 leading-relaxed text-[15px]">{openArticle.body}</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeUp pb-4">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
          <ArrowLeft size={18} /> Voltar
        </button>
      )}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Journal</h2>
        <p className="text-gray-400 text-sm">Conteúdo editorial completo para o Associado</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs border transition-colors ${
              active === c
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-transparent text-gray-300 border-gray-700 hover:border-gray-500'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {list.map((a) => (
          <button
            key={a.id}
            onClick={() => setOpenId(a.id)}
            className="w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="aspect-[16/9] bg-gradient-to-br from-gray-800 to-gray-950" />
            <div className="p-4">
              <p className="text-[10px] font-semibold tracking-wider text-yellow-400 mb-1">{a.category.toUpperCase()}</p>
              <p className="text-white font-semibold mb-1 leading-snug">{a.title}</p>
              <p className="text-gray-400 text-sm">{a.excerpt}</p>
              <p className="text-white text-xs mt-2 underline">Ler matéria completa</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
