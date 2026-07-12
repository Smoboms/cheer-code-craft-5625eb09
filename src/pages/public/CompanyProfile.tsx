import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Instagram, Globe, Clock, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Partner {
  id: string;
  name: string;
  category: string | null;
  discount: string | null;
  distance: string | null;
  banner_url: string | null;
  logo_url: string | null;
  profile_image_url: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  opening_hours: string | null;
  is_member: boolean | null;
}

export default function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data } = await supabase.from('partners').select('*').eq('id', id).maybeSingle();
      setPartner((data as any) || null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-fadeUp pb-4">
        <p className="text-gray-400 text-sm"><Loader2 className="inline animate-spin" size={16} /> Carregando…</p>
      </div>
    );
  }

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

      {(() => {
        const img = partner.logo_url || partner.profile_image_url || partner.banner_url;
        return (
          <div className="aspect-[16/9] bg-gray-800 mb-4 overflow-hidden flex items-center justify-center">
            {img ? (
              <img src={img} alt={partner.name} className="w-full h-full object-cover" />
            ) : (
              <img src="/placeholder.svg" alt="" className="w-16 h-16 opacity-40" />
            )}
          </div>
        );
      })()}

      {partner.is_member && (
        <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 px-2 py-0.5 mb-2">
          <p className="text-[10px] font-semibold tracking-wider text-yellow-400">EMPRESA MEMBRO</p>
        </div>
      )}
      <h2 className="text-2xl font-bold text-white mb-1">{partner.name}</h2>
      {partner.category && <p className="text-gray-400 text-sm mb-4">{partner.category}</p>}

      {(partner.description || partner.discount) && (
        <div className="bg-gray-900 border border-gray-800 p-4 mb-4">
          <p className="text-white text-sm leading-relaxed">
            {partner.description || 'Empresa Membro Rarques.'}
            {partner.discount && (
              <> · <span className="text-yellow-400 font-semibold">{partner.discount}</span></>
            )}
          </p>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 p-4 mb-4 space-y-3">
        {(partner.address || partner.city || partner.distance) && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-200">
              {[partner.address, partner.city].filter(Boolean).join(', ') || `Região · ${partner.distance}`}
            </span>
          </div>
        )}
        {(partner.whatsapp || partner.phone) && (
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-200">{partner.whatsapp || partner.phone}</span>
          </div>
        )}
        {partner.instagram && (
          <div className="flex items-center gap-3 text-sm">
            <Instagram size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-200">{partner.instagram}</span>
          </div>
        )}
        {partner.website && (
          <div className="flex items-center gap-3 text-sm">
            <Globe size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-200">{partner.website}</span>
          </div>
        )}
        {partner.opening_hours && (
          <div className="flex items-center gap-3 text-sm">
            <Clock size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-200">{partner.opening_hours}</span>
          </div>
        )}
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
