import { Store, CheckCircle2, TrendingUp, Users } from 'lucide-react';

const benefits = [
  {
    icon: <Users size={20} />,
    title: 'Visibilidade',
    description: 'Apareça para associados ativos na sua região'
  },
  {
    icon: <TrendingUp size={20} />,
    title: 'Aumento de vendas',
    description: 'Potencialize seu negócio com novos clientes'
  },
  {
    icon: <CheckCircle2 size={20} />,
    title: 'Fidelização',
    description: 'Crie uma base de clientes recorrentes com descontos exclusivos'
  }
];

export function BecomePartner() {
  const handleContactWhatsApp = () => {
    window.open('https://wa.me/5562981775906?text=Ol%C3%A1!%0AEstou%20vindo%20da%20Plataforma%20R-CARD%20e%20quero%20cadastrar%20o%20meu%20neg%C3%B3cio%2C%20como%20funciona%20%3F', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 text-white border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Seja um Parceiro</h2>
            <p className="text-sm opacity-90">Faça parte da nossa rede</p>
          </div>
        </div>
        <p className="text-sm opacity-90">
          Junte-se as empresas que já fazem parte da nossa rede de parceiros e aumente suas vendas significativamente.
        </p>
      </div>

      {/* Benefits */}
      <div>
        <h3 className="font-bold text-white mb-3 text-lg">Por que ser parceiro?</h3>
        <div className="space-y-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">{benefit.title}</h4>
                  <p className="text-sm text-gray-400">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="font-bold text-white mb-3 text-lg">Como funciona</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">Entre em contato</h4>
              <p className="text-xs text-gray-400 mt-0.5">Clique no botão abaixo e fale conosco</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">Análise e aprovação</h4>
              <p className="text-xs text-gray-400 mt-0.5">Verificamos seu cadastro em até 48h</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">Comece a vender mais</h4>
              <p className="text-xs text-gray-400 mt-0.5">Apareça para potenciais clientes da sua cidade e região</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Button */}
      <button
        onClick={handleContactWhatsApp}
        className="w-full bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg"
      >
        Entrar em Contato via WhatsApp
      </button>
    </div>
  );
}