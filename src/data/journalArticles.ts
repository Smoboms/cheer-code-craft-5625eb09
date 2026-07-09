export interface JournalArticle {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  featured: boolean;
}

export const journalArticles: JournalArticle[] = [
  {
    id: 1,
    category: 'Economia',
    title: 'O que o novo ciclo de juros muda para o varejo regional',
    excerpt: 'Uma leitura prática de como o custo do dinheiro afeta estoque, crédito ao consumidor e margem.',
    body: 'A recente inflexão da política monetária redesenha o cenário de crédito no varejo regional. Empresas que dependem de giro rápido precisam recalibrar prazos com fornecedores e revisitar a política de parcelamento ao cliente final. Ao mesmo tempo, o momento abre janela para renegociar dívidas antigas em condições mais favoráveis. O Associado que entender esse movimento antes da concorrência sai na frente.',
    featured: true,
  },
  {
    id: 2,
    category: 'Mercado',
    title: 'Consumo local em alta: o mapa das oportunidades',
    excerpt: 'Setores que mais crescem na região e onde o dinheiro do consumidor está indo de fato.',
    body: 'Dados de movimentação do trimestre mostram crescimento acima da média em três setores: gastronomia, bem-estar e serviços recorrentes. A leitura correta desse dado não é copiar o vizinho, e sim identificar em que ponto da sua operação já existe demanda reprimida que pode ser convertida em receita adicional imediata.',
    featured: false,
  },
  {
    id: 3,
    category: 'Negócios',
    title: 'Sucessão que não trava a empresa',
    excerpt: 'Como preparar a próxima geração sem parar o motor que faz a operação girar hoje.',
    body: 'A sucessão bem feita não é um evento, é um processo. Começa por separar governança de operação, segue por criar autonomia de decisão em camadas intermediárias e termina com o fundador migrando para conselho antes de sair do dia a dia. Empresas familiares que atropelam esse rito costumam pagar caro dois anos depois.',
    featured: true,
  },
  {
    id: 4,
    category: 'Desenvolvimento Regional',
    title: 'Infraestrutura logística e o próximo salto',
    excerpt: 'Obras em andamento e o impacto direto no custo de operar na região.',
    body: 'Duas frentes de infraestrutura em execução prometem reduzir o custo logístico regional em até dois dígitos nos próximos 24 meses. Para o Associado que trabalha com distribuição, isso significa espaço para renegociar frete, revisar praças atendidas e, principalmente, considerar novos mercados que hoje ficam fora do raio economicamente viável.',
    featured: false,
  },
  {
    id: 5,
    category: 'Inovação',
    title: 'IA na pequena empresa: por onde começar sem queimar caixa',
    excerpt: 'Três frentes de aplicação prática que já pagam o investimento no primeiro trimestre.',
    body: 'Ignorar IA em 2026 é o equivalente a ignorar internet em 2005. Mas adotar mal é queimar dinheiro. As três frentes que mais rápido retornam para empresas regionais são: atendimento (redução de tempo de resposta), operações internas (relatórios e conciliações) e prospecção (qualificação de leads). Comece por uma, meça, avance.',
    featured: true,
  },
];

export const journalCategories = ['Todas', 'Economia', 'Mercado', 'Negócios', 'Desenvolvimento Regional', 'Inovação'] as const;
export type JournalCategory = (typeof journalCategories)[number];
