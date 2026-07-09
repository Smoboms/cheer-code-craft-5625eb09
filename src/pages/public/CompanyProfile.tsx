import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Instagram, Globe, Clock } from 'lucide-react';
import { mockPartners } from '@/data/partnersData';

export default function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const partner = mockPartners.find((p) => p.id === Number(id));

  if (!partner) {
    return (
      <div className="animate-fadeUp pb-4">
        <button onClick={() => navigate('/empresas')} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
          <ArrowLeft size={18} /> Voltar
        </button>
        <p className="text-gray-400">Empresa não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={() => navigate('/empresas')} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div
        className="aspect-[16/9] bg-cover bg-center bg-gray-800 mb-4"
        style={partner.bannerImage ? { backgroundImage: `url(${partner.bannerImage})` } : undefined}
      />

      <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 px-2 py-0.5 mb-2">
        <p className="text-[10px] font-semibold tracking-wider text-yellow-400">EMPRESA MEMBRO</p>
      </div>
      <h2 className="text-2xl font-bold text-white mb-1">{partner.name}</h2>
      <p className="text-gray-400 text-sm mb-4">{partner.category}</p>

      <div className="bg-gray-900 border border-gray-800 p-4 mb-4">
        <p className="text-white text-sm leading-relaxed">
          Empresa Membro Rarques oferecendo <span className="text-yellow-400 font-semibold">{partner.discount}</span> para associados. Parceira comprometida com a rede regional de negócios.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-4 mb-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <MapPin size={16} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-200">Região central · {partner.distance}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone size={16} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-200">Contato via WhatsApp</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Instagram size={16} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-200">@rarques.parceiro</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Globe size={16} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-200">Site em breve</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock size={16} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-200">Seg a Sáb · 09h às 19h</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/40 p-5 text-center">
        <p className="text-white font-semibold mb-1">Quer aproveitar os benefícios?</p>
        <p className="text-gray-400 text-sm mb-4">
          Torne-se Associado Rarques e acesse descontos, cashback e vantagens exclusivas.
        </p>
        <Link
          to="/app"
          className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 text-sm transition-colors"
        >
          Acessar Área do Associado
        </Link>
      </div>
    </div>
  );
}
