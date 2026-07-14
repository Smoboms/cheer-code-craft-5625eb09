import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Instagram, Globe, Clock, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSeo } from '@/lib/useSeo';

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

  useSeo({
    title: partner ? `${partner.name}${partner.city ? ' — ' + partner.city : ' — Uruaçu'} · Rarques` : 'Empresa · Rarques',
    description: partner?.description?.slice(0, 155) || 'Perfil de empresa parceira Rarques em Uruaçu.',
    canonical: partner ? `${window.location.origin}/empresas/${partner.id}` : undefined,
  });

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
              <img src={img} alt={partner.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
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

      {/* Botões compactos de ação — padrão Área do Associado */}
      {(() => {
        const waNum = (partner.whatsapp || '').replace(/\D/g, '');
        const waMsg = encodeURIComponent(
          `Olá! Encontrei sua empresa através da Plataforma Rarques e gostaria de mais informações.`
        );
        const waHref = waNum ? `https://wa.me/${waNum.startsWith('55') ? waNum : '55' + waNum}?text=${waMsg}` : null;
        const mapsHref = partner.address
          ? `https://www.google.com/maps?q=${encodeURIComponent([partner.address, partner.city].filter(Boolean).join(', '))}`
          : null;
        const telHref = partner.phone ? `tel:${partner.phone.replace(/\D/g, '')}` : null;
        const site = partner.website
          ? (partner.website.startsWith('http') ? partner.website : `https://${partner.website}`)
          : null;
        const igHandle = partner.instagram ? partner.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/$/, '') : null;
        const igHref = igHandle ? `https://instagram.com/${igHandle}` : null;
        const btn = 'flex-1 min-w-[calc(50%-0.375rem)] md:min-w-0 inline-flex items-center justify-center gap-1.5 border border-gray-700 hover:border-yellow-500 text-white text-xs font-semibold py-2 px-3 transition-colors bg-gray-900';
        return (
          <div className="flex flex-wrap gap-2 mb-4">
            {mapsHref && (
              <a href={mapsHref} target="_blank" rel="noreferrer" className={btn}>
                <MapPin size={14} /> Localização
              </a>
            )}
            {waHref && (
              <a href={waHref} target="_blank" rel="noreferrer" className={`${btn} bg-green-600/10 border-green-600/40 hover:border-green-500 text-green-300`}>
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
            {telHref && (
              <a href={telHref} className={btn}>
                <Phone size={14} /> Telefone
              </a>
            )}
            {partner.is_member && igHref && (
              <a href={igHref} target="_blank" rel="noreferrer" className={`${btn} bg-pink-600/10 border-pink-600/40 hover:border-pink-500 text-pink-300`}>
                <Instagram size={14} /> Instagram
              </a>
            )}
            {site && (
              <a href={site} target="_blank" rel="noreferrer" className={btn}>
                <Globe size={14} /> Site
              </a>
            )}
          </div>
        );
      })()}


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

      {/* Bloco de benefícios exclusivos para membros */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/40 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-yellow-400" />
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-yellow-400">Benefícios para Membros</p>
        </div>
        <p className="text-white font-semibold mb-2">Associados Rarques têm vantagens aqui</p>
        <ul className="text-gray-300 text-sm space-y-1 mb-4 list-disc list-inside">
          <li>Descontos exclusivos e cashback em compras</li>
          <li>Atendimento prioritário como Membro Rarques</li>
          <li>Acesso a ofertas antecipadas e cupons</li>
        </ul>
        <Link
          to="/app"
          className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 text-sm transition-colors"
        >
          Quero ser Membro
        </Link>
      </div>

    </div>
  );
}
