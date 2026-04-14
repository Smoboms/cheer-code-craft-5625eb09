export interface Benefit {
  id: number;
  title: string;
  description: string;
  discount: string;
}

export interface PartnerRatings {
  overall: number;
  alimentacao: number;
  recepcao: number;
  atendimento: number;
  ambiente: number;
  totalReviews: number;
}

export interface Partner {
  id: number;
  name: string;
  category: string;
  discount: string;
  distance: string;
  rating: number;
  image: string;
  isFavorite: boolean;
  benefits: Benefit[];
  bannerImage?: string;
  profileImage?: string;
  ratings?: PartnerRatings;
}

export const mockPartners: Partner[] = [
  {
    id: 1,
    name: 'Restaurante Sabor da Terra',
    category: 'Alimentação',
    discount: '15% OFF',
    distance: '0.8 km',
    rating: 4.8,
    image: 'restaurant food',
    isFavorite: true,
    bannerImage: 'https://images.unsplash.com/photo-1667388969250-1c7220bf3f37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY4MTg0MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2ZpbGV8ZW58MXx8fHwxNzY4MjcwMzUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    benefits: [
      { id: 1, title: 'Desconto Principal', description: 'Ganhe desconto em todos os pratos', discount: '15% OFF' },
      { id: 2, title: 'Cashback', description: 'Receba 5% de volta em créditos', discount: '5% Cashback' },
      { id: 3, title: 'Delivery Grátis', description: 'Aproveite entrega sem custo', discount: 'Grátis' },
    ]
  },
  {
    id: 2,
    name: 'Farmácia São Lucas',
    category: 'Saúde',
    discount: '10% OFF',
    distance: '1.2 km',
    rating: 4.5,
    image: 'pharmacy health',
    isFavorite: false,
    bannerImage: 'https://images.unsplash.com/photo-1648091856225-dd091d7e5075?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGFybWFjeSUyMHN0b3JlfGVufDF8fHx8MTc2ODIyNzc5OHww&ixlib=rb-4.1.0&q=80&w=1080',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2ZpbGV8ZW58MXx8fHwxNzY4MjcwMzUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    benefits: [
      { id: 1, title: 'Desconto Principal', description: 'Ganhe desconto em medicamentos', discount: '10% OFF' },
      { id: 2, title: 'Programa Fidelidade', description: 'Acumule pontos a cada compra', discount: 'Pontos' },
      { id: 3, title: 'Desconto Genéricos', description: 'Até 20% em medicamentos genéricos', discount: '20% OFF' },
      { id: 4, title: 'Consulta Grátis', description: 'Aferição de pressão gratuita', discount: 'Grátis' },
    ]
  },
  {
    id: 3,
    name: 'Academia Fitness Pro',
    category: 'Bem-estar',
    discount: '20% OFF',
    distance: '2.0 km',
    rating: 4.9,
    image: 'gym fitness',
    isFavorite: true,
    bannerImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBmaXRuZXNzfGVufDF8fHx8MTc2ODIxMzYxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2ZpbGV8ZW58MXx8fHwxNzY4MjcwMzUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    benefits: [
      { id: 1, title: 'Desconto Principal', description: 'Ganhe desconto na mensalidade', discount: '20% OFF' },
      { id: 2, title: 'Matrícula Grátis', description: 'Sem taxa de adesão', discount: 'Grátis' },
      { id: 3, title: 'Aula Experimental', description: 'Uma aula de qualquer modalidade', discount: 'Grátis' },
    ]
  },
  {
    id: 4,
    name: 'Padaria do Bairro',
    category: 'Alimentação',
    discount: '5% OFF',
    distance: '0.5 km',
    rating: 4.6,
    image: 'bakery bread',
    isFavorite: false,
    benefits: [
      { id: 1, title: 'Desconto Principal', description: 'Ganhe desconto em todos os produtos', discount: '5% OFF' },
      { id: 2, title: 'Café Grátis', description: 'Cafezinho cortesia na compra acima de R$20', discount: 'Grátis' },
    ]
  },
  {
    id: 5,
    name: 'Livraria Cultura',
    category: 'Educação',
    discount: '12% OFF',
    distance: '1.5 km',
    rating: 4.7,
    image: 'bookstore books',
    isFavorite: false,
    benefits: [
      { id: 1, title: 'Desconto Principal', description: 'Ganhe desconto em livros', discount: '12% OFF' },
      { id: 2, title: 'Frete Grátis', description: 'Entrega sem custo em compras acima de R$50', discount: 'Grátis' },
      { id: 3, title: 'Evento Exclusivo', description: 'Convite para lançamentos', discount: 'Acesso VIP' },
    ]
  },
  {
    id: 6,
    name: 'Posto Shell Centro',
    category: 'Combustível',
    discount: 'R$ 0,15/L',
    distance: '0.9 km',
    rating: 4.4,
    image: 'gas station',
    isFavorite: false,
    benefits: [
      { id: 1, title: 'Desconto Principal', description: 'Desconto por litro de combustível', discount: 'R$ 0,15/L' },
      { id: 2, title: 'Lavagem Grátis', description: 'Lavagem gratuita ao abastecer 40L', discount: 'Grátis' },
    ]
  },
  {
    id: 7,
    name: 'Clínica Dental Sorrir',
    category: 'Saúde',
    discount: '25% OFF',
    distance: '1.8 km',
    rating: 4.9,
    image: 'dental clinic',
    isFavorite: false,
    benefits: [
      { id: 1, title: 'Desconto Principal', description: 'Ganhe desconto em tratamentos', discount: '25% OFF' },
      { id: 2, title: 'Avaliação Grátis', description: 'Primeira consulta sem custo', discount: 'Grátis' },
      { id: 3, title: 'Clareamento', description: 'Desconto especial em clareamento', discount: '30% OFF' },
      { id: 4, title: 'Emergência 24h', description: 'Atendimento emergencial', discount: 'Disponível' },
    ]
  },
  {
    id: 8,
    name: 'Pet Shop Amor Animal',
    category: 'Serviços',
    discount: '10% OFF',
    distance: '1.1 km',
    rating: 4.7,
    image: 'pet shop',
    isFavorite: false,
    benefits: [
      { id: 1, title: 'Desconto Principal', description: 'Ganhe desconto em produtos', discount: '10% OFF' },
      { id: 2, title: 'Banho Grátis', description: 'Um banho grátis por mês', discount: 'Grátis' },
      { id: 3, title: 'Vacinação', description: 'Desconto em vacinas', discount: '15% OFF' },
    ]
  },
  {
    id: 9,
    name: 'Pizzaria Bella Napoli',
    category: 'Alimentação',
    discount: '18% OFF',
    distance: '1.4 km',
    rating: 4.8,
    image: 'pizza restaurant',
    isFavorite: false,
    benefits: [
      { id: 1, title: 'Desconto Principal', description: 'Ganhe desconto no pedido', discount: '18% OFF' },
      { id: 2, title: 'Refrigerante Grátis', description: 'Refrigerante cortesia em pedidos acima de R$40', discount: 'Grátis' },
      { id: 3, title: 'Pizza Brinde', description: 'Compre 3, leve 4 pizzas', discount: '1 Grátis' },
    ]
  },
  {
    id: 10,
    name: 'Ótica Visual Perfeita',
    category: 'Saúde',
    discount: '30% OFF',
    distance: '2.3 km',
    rating: 4.6,
    image: 'optical store',
    isFavorite: false,
    benefits: [
      { id: 1, title: 'Desconto Principal', description: 'Ganhe desconto em óculos', discount: '30% OFF' },
      { id: 2, title: 'Exame de Vista', description: 'Exame oftalmológico gratuito', discount: 'Grátis' },
      { id: 3, title: 'Segunda Armação', description: 'Desconto na segunda armação', discount: '50% OFF' },
      { id: 4, title: 'Lentes Antirreflexo', description: 'Upgrade grátis para lentes premium', discount: 'Grátis' },
    ]
  }
];

// Função para calcular total de benefícios
export function getTotalBenefitsCount(): number {
  return mockPartners.reduce((total, partner) => total + partner.benefits.length, 0);
}