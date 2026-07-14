import { useMemo, useState } from 'react';
import { Check, Copy, MapPin, Phone, User, Building, Loader2 } from 'lucide-react';
import { copyToClipboard } from '@/utils/clipboard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActivePartners } from '@/data/usePartners';
import { toast } from 'sonner';
import { formatBRL } from '@/lib/utils';

interface CouponData {
  code: string;
  purchaseValue: number;
  savedAmount: number;
  date: string;
}

interface Benefit {
  id: string;
  company: string;
  category: string;
  discount: string;
  discountPercent: number;
  fullDescription: string;
  emoji: string;
  logo?: string;
  contact: string;
  whatsapp?: string;
  location: string;
  mapsLink?: string;
  responsible: string;
  city: string;
  photos: string[];
}

export function BenefitsPage() {
  const { user } = useAuth();
  const { partners, loading } = useActivePartners();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);
  const [generatedCoupons, setGeneratedCoupons] = useState<Map<string, CouponData>>(new Map());
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [purchaseValues, setPurchaseValues] = useState<Map<string, string>>(new Map());
  const [savingId, setSavingId] = useState<string | null>(null);

  const benefits: Benefit[] = useMemo(() => partners.map((p) => ({
    id: p.id,
    company: p.name,
    category: p.category || 'Outros',
    discount: p.discount || '',
    discountPercent: Number(p.discount_percent) || 0,
    fullDescription: p.description || '',
    emoji: '🏢',
    logo: p.logo_url || p.profile_image_url || p.banner_url || undefined,
    contact: p.phone || '',
    whatsapp: p.whatsapp || undefined,
    location: [p.address, p.city].filter(Boolean).join(' - ') || 'Endereço não informado',
    mapsLink: p.maps_link || undefined,
    responsible: p.responsible || 'A definir',
    city: p.city || '—',
    photos: [],
  })), [partners]);

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(benefits.map(b => b.category)))], [benefits]);
  const cities = useMemo(() => ['Todas', ...Array.from(new Set(benefits.map(b => b.city)))], [benefits]);

  const filteredBenefits = benefits.filter(b => {
    const matchesCategory = selectedCategory === 'Todos' || b.category === selectedCategory;
    const matchesCity = selectedCity === 'Todas' || b.city === selectedCity;
    return matchesCategory && matchesCity;
  });

  const generateCouponCode = (company: string) => {
    const prefix = company.slice(0, 3).toUpperCase().replace(/\s/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RQS-${prefix}-${random}`;
  };

  const handleGenerateCoupon = async (benefitId: string, discountPercent: number) => {
    if (!user) {
      toast.error('Você precisa estar logado para gerar cupons');
      return;
    }
    const valueStr = purchaseValues.get(benefitId) || '0';
    const purchaseValue = parseFloat(valueStr.replace(',', '.'));

    if (isNaN(purchaseValue) || purchaseValue <= 0) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    const benefit = benefits.find(b => b.id === benefitId);
    if (!benefit) return;

    const savedAmount = (purchaseValue * discountPercent) / 100;
    const code = generateCouponCode(benefit.company);

    setSavingId(benefitId);
    const { error } = await supabase.from('purchases').insert({
      user_id: user.id,
      amount: purchaseValue,
      discount_amount: savedAmount,
      benefit_used: benefit.company,
      coupon_code: code,
    });
    setSavingId(null);

    if (error) {
      console.error('Erro ao registrar cupom:', error);
      toast.error('Não foi possível registrar o cupom. Tente novamente.');
      return;
    }

    setGeneratedCoupons(prev =>
      new Map(prev).set(benefitId, {
        code,
        purchaseValue,
        savedAmount,
        date: new Date().toISOString(),
      }),
    );
    toast.success(`Cupom gerado! Você economizou ${formatBRL(savedAmount)}`);
  };

  const handleCopyCoupon = (code: string) => {
    const success = copyToClipboard(code);
    if (success) {
      setCopiedCoupon(code);
      setTimeout(() => setCopiedCoupon(null), 2000);
    }
  };

  const toggleBenefit = (benefitId: string) => {
    setExpandedBenefit(expandedBenefit === benefitId ? null : benefitId);
  };

  const handlePurchaseValueChange = (benefitId: string, value: string) => {
    const newValues = new Map(purchaseValues);
    newValues.set(benefitId, value);
    setPurchaseValues(newValues);
  };

  return (
    <div className="animate-fadeUp">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Benefícios</h2>
            <p className="text-gray-400 text-sm">{loading ? 'Carregando…' : `${benefits.length} empresas parceiras ativas`}</p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-6 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-[#FFFFFF] text-black'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* City Filters */}
      <div className="mb-6 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCity === city
                  ? 'bg-[#FFFFFF] text-black'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Benefits List */}
      <div className="space-y-3">
        {filteredBenefits.map((benefit) => {
          const isExpanded = expandedBenefit === benefit.id;
          const couponData = generatedCoupons.get(benefit.id);
          const hasCoupon = couponData !== undefined;
          const isCopied = copiedCoupon === couponData?.code;
          const purchaseValue = purchaseValues.get(benefit.id) || '';

          return (
            <div
              key={benefit.id}
              className="bg-gray-900 border border-gray-800 overflow-hidden"
            >
              {/* Card Header - Always Visible */}
              <button
                onClick={() => toggleBenefit(benefit.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-gray-850 transition-colors"
              >
                {/* Logo Image */}
                <div className="w-11 h-11 bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {benefit.logo ? (
                    <img 
                      src={benefit.logo} 
                      alt={benefit.company}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{benefit.emoji}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <h3 className="text-white font-bold text-sm mb-1">{benefit.company}</h3>
                  <p className="text-gray-400 text-xs">{benefit.category}</p>
                </div>

                {/* Discount Badge */}
                <div className="bg-gradient-to-r from-[#FFFFFF]/20 to-transparent border border-[#FFFFFF] px-3 py-1">
                  <p className="text-[#FFFFFF] font-bold text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {benefit.discount}
                  </p>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-4 animate-fadeUp space-y-4">
                  {/* Full Description */}
                  <p className="text-gray-300 text-sm">{benefit.fullDescription}</p>

                  {/* Photos Gallery */}
                  {benefit.photos && benefit.photos.length > 0 && (
                    <div className="-mx-4 px-4">
                      <p className="text-white text-xs font-bold mb-2 uppercase tracking-wider">Fotos do Estabelecimento</p>
                      <div className="overflow-x-auto pb-2">
                        <div className="flex gap-3 min-w-max">
                          {benefit.photos.map((photo, idx) => (
                            <div
                              key={idx}
                              className="flex-none w-[240px] h-[160px] bg-gray-800 border border-gray-700 overflow-hidden hover:border-white transition-colors"
                            >
                              <img
                                src={photo}
                                alt={`${benefit.company} - foto ${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs mt-1 text-center">← Deslize para ver mais fotos →</p>
                    </div>
                  )}

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* WhatsApp Button */}
                    {benefit.whatsapp && (
                      <a
                        href={`https://wa.me/${benefit.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-green-600 hover:bg-green-700 text-white p-3 transition-colors flex items-center justify-center gap-2 font-semibold"
                      >
                        <Phone size={18} />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {/* Google Maps Button */}
                    {benefit.mapsLink && (
                      <a
                        href={benefit.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 transition-colors flex items-center justify-center gap-2 font-semibold"
                      >
                        <MapPin size={18} />
                        <span>Ver no Mapa</span>
                      </a>
                    )}

                    {/* City Info */}
                    <div className="bg-black p-3 border border-gray-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Building size={14} className="text-white" />
                        <p className="text-gray-400 text-xs">Cidade</p>
                      </div>
                      <p className="text-white text-sm font-semibold">{benefit.city}</p>
                    </div>

                    {/* Responsible Info */}
                    <div className="bg-black p-3 border border-gray-800">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={14} className="text-white" />
                        <p className="text-gray-400 text-xs">Responsável</p>
                      </div>
                      <p className="text-white text-sm font-semibold">{benefit.responsible}</p>
                    </div>
                  </div>

                  {/* Purchase Value Input + Generate Coupon */}
                  {!hasCoupon ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          Valor da compra
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base">
                            R$
                          </span>
                          <input
                            type="text"
                            value={purchaseValue}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9,]/g, '');
                              handlePurchaseValueChange(benefit.id, value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="0,00"
                            className="w-full pl-12 pr-4 py-3 text-lg font-bold bg-black text-white border border-gray-700 focus:border-white focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleGenerateCoupon(benefit.id, benefit.discountPercent);
                        }}
                        disabled={savingId === benefit.id}
                        className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {savingId === benefit.id && <Loader2 size={18} className="animate-spin" />}
                        {savingId === benefit.id ? 'Gerando...' : 'Gerar Cupom'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Savings Summary */}
                      <div className="bg-gradient-to-br from-green-500 to-green-600 p-4">
                        <p className="text-white/80 text-xs mb-1">VOCÊ ECONOMIZOU</p>
                        <p className="text-white text-2xl font-bold mb-2">{formatBRL(couponData.savedAmount)}</p>
                        <div className="flex justify-between text-sm text-white/90">
                          <span>Valor da compra:</span>
                          <span>{formatBRL(couponData.purchaseValue)}</span>
                        </div>
                      </div>

                      {/* Coupon Code */}
                      <div className="border-2 border-dashed border-[#FFFFFF] p-4 bg-[#FFFFFF]/5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">CÓDIGO DO CUPOM</p>
                            <p className="text-[#FFFFFF] text-xl font-bold font-mono">{couponData.code}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCoupon(couponData.code);
                            }}
                            className="bg-[#FFFFFF] hover:bg-[#E0E0E0] text-black p-3 transition-colors"
                          >
                            {isCopied ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                        <p className="text-gray-400 text-xs">
                          Válido até: 31/12/2025
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}