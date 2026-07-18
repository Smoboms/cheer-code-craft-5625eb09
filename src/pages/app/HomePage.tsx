import { useEffect, useState } from 'react';
import { CreditCard, TrendingUp, Users, Sparkles, Calendar, Gift, Building2, Scale, Globe } from 'lucide-react';
import type { TabType } from '@/components/app/PremiumBottomNav';
import type { MoreSection } from '@/pages/app/MorePage';
import rarquesLogo from '@/assets/rarques-logo.png.asset.json';
import { usePublicBanner, filterSlidesFor } from '@/data/publicBanner';

interface Props {
  userName: string;
  onNavigate: (tab: TabType) => void;
  onOpenMore: (section: MoreSection) => void;
}

type BannerAction = { type: 'tab'; value: TabType } | { type: 'more'; value: MoreSection };

interface Banner {
  icon: typeof Sparkles;
  title: string;
  text: string;
  cta: string;
  action: BannerAction;
  accent: string;
}

const BANNERS: Banner[] = [
  {
    icon: Sparkles,
    title: 'NOVIDADE',
    text: 'Novas matérias no R.Journal desta semana.',
    cta: 'Ler agora',
    action: { type: 'tab', value: 'journal' },
    accent: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  },
  {
    icon: Calendar,
    title: 'PRÓXIMO ENCONTRO',
    text: 'Nexus deste mês com inscrições abertas.',
    cta: 'Ver Nexus',
    action: { type: 'more', value: 'nexus' },
    accent: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
  },
  {
    icon: Gift,
    title: 'BENEFÍCIO EM DESTAQUE',
    text: 'Aproveite os parceiros Rarques desta semana.',
    cta: 'Ver benefícios',
    action: { type: 'more', value: 'beneficios' },
    accent: 'text-green-400 border-green-500/40 bg-green-500/10',
  },
];

type SlideItem =
  | { kind: 'info'; banner: Banner }
  | { kind: 'image'; imageUrl: string; ctaHref: string };

export function HomePage({ userName, onNavigate, onOpenMore }: Props) {
  const firstName = userName.split(' ')[0] || 'Associado';
  const [slide, setSlide] = useState(0);
  const bannerCfg = usePublicBanner();

  const adminSlides = filterSlidesFor(bannerCfg, 'associate');
  const slides: SlideItem[] = [
    ...adminSlides.map((s) => ({ kind: 'image' as const, imageUrl: s.imageUrl, ctaHref: s.ctaHref })),
    ...BANNERS.map((b) => ({ kind: 'info' as const, banner: b })),
  ];

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  const handleBanner = (action: BannerAction) => {
    if (action.type === 'tab') onNavigate(action.value);
    else onOpenMore(action.value);
  };

  const openHref = (href: string) => {
    if (!href) return;
    if (href.startsWith('http')) window.open(href, '_blank');
    else window.location.href = href;
  };

  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-4">
        <p className="text-gray-400 text-sm">Bem-vindo,</p>
        <h2 className="text-2xl font-bold text-white">{firstName}</h2>
      </div>

      {/* Carrossel de banners com imagem de fundo */}
      <div className="mb-3 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800">
        <div
          aria-hidden
          className="absolute inset-0 bg-no-repeat bg-right bg-contain opacity-10 pointer-events-none"
          style={{ backgroundImage: `url(${rarquesLogo.url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
        <div
          className="relative flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {slides.map((s, i) => {
            if (s.kind === 'image') {
              return (
                <button
                  key={`img-${i}`}
                  onClick={() => openHref(s.ctaHref)}
                  className="min-w-full aspect-[32/9] block"
                  aria-label={`Banner ${i + 1}`}
                >
                  <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              );
            }
            const b = s.banner;
            const Icon = b.icon;
            return (
              <div key={`info-${i}`} className="min-w-full p-3">
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${b.accent} mb-2`}>
                  <Icon size={11} />
                  <p className="text-[10px] font-semibold tracking-wider">{b.title}</p>
                </div>
                <p className="text-white text-sm mb-2 leading-snug">{b.text}</p>
                <button
                  onClick={() => handleBanner(b.action)}
                  className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold inline-flex items-center gap-1"
                >
                  {b.cta} →
                </button>
              </div>
            );
          })}
        </div>
        <div className="relative flex justify-center gap-1.5 pb-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 transition-all ${i === slide ? 'w-4 bg-yellow-400' : 'w-1.5 bg-gray-600'}`}
            />
          ))}
        </div>
      </div>

      {/* Card MEMBRO ATIVO compacto */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-3 mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 px-1.5 py-0.5 mb-1">
            <p className="text-[9px] font-semibold tracking-wider text-yellow-400">MEMBRO ATIVO</p>
          </div>
          <p className="text-white text-xs leading-snug">Acesse sua carteirinha e economize com os parceiros.</p>
        </div>
        <button
          onClick={() => onNavigate('rcard')}
          className="shrink-0 bg-white text-black px-2.5 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1.5"
        >
          <CreditCard size={12} /> R-CARD
        </button>
      </div>

      {/* Grade compacta */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onOpenMore('minhaempresa')} className="bg-gray-900 border border-gray-800 p-3 text-left hover:border-gray-600 transition-colors">
          <Building2 size={18} className="text-white mb-1.5" />
          <p className="text-white font-semibold text-xs">Minha Empresa</p>
          <p className="text-gray-400 text-[10px]">Perfil e produtos</p>
        </button>
        <button onClick={() => onOpenMore('nexus')} className="bg-gray-900 border border-gray-800 p-3 text-left hover:border-gray-600 transition-colors">
          <Users size={18} className="text-yellow-400 mb-1.5" />
          <p className="text-white font-semibold text-xs">Nexus</p>
          <p className="text-gray-400 text-[10px]">Próximos encontros</p>
        </button>
        <button onClick={() => onOpenMore('crescer')} className="bg-gray-900 border border-gray-800 p-3 text-left hover:border-gray-600 transition-colors">
          <TrendingUp size={18} className="text-green-400 mb-1.5" />
          <p className="text-white font-semibold text-xs">Crescer</p>
          <p className="text-gray-400 text-[10px]">Diagnóstico</p>
        </button>
        <button onClick={() => onOpenMore('juridico')} className="bg-gray-900 border border-gray-800 p-3 text-left hover:border-gray-600 transition-colors">
          <Scale size={18} className="text-yellow-400 mb-1.5" />
          <p className="text-white font-semibold text-xs">Jurídico Empresarial</p>
          <p className="text-gray-400 text-[10px]">Assessoria dedicada</p>
        </button>
      </div>
    </div>
  );
}
