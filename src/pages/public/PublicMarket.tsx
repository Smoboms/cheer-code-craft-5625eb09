import { useEffect, useMemo, useState } from 'react';
import { Search, X, MessageCircle, Store, ShoppingBag, Utensils, Shirt, Home as HomeIcon, Smartphone, Wrench, Car, Sparkles, HardHat, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/analytics';

type Product = {
  id: string;
  partner_id: string;
  name: string;
  category: string | null;
  description: string | null;
  price: number | null;
  images: string[];
  is_featured: boolean;
  partners?: { id: string; name: string; whatsapp: string | null; phone: string | null; is_member: boolean } | null;
};

const CATEGORY_ICONS: Record<string, any> = {
  'Alimentação': Utensils,
  'Gastronomia': Utensils,
  'Moda': Shirt,
  'Casa e Decoração': HomeIcon,
  'Eletrônicos': Smartphone,
  'Serviços': Wrench,
  'Veículos': Car,
  'Beleza': Sparkles,
  'Bem-estar': Sparkles,
  'Construção': HardHat,
  'Varejo': ShoppingBag,
  'Educação': Tag,
};

function fmtPrice(v: number | null) {
  if (v == null) return null;
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function waLink(p: NonNullable<Product['partners']>, productName: string) {
  const raw = (p.whatsapp || p.phone || '').replace(/\D/g, '');
  if (!raw) return null;
  const msg = encodeURIComponent(`Olá! Vi o produto "${productName}" no Mercado Rarques e gostaria de saber mais.`);
  return `https://wa.me/${raw.startsWith('55') ? raw : '55' + raw}?text=${msg}`;
}

export default function PublicMarket() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    trackEvent('page_view', 'mercado', 'Mercado');
    (async () => {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase
          .from('marketplace_products')
          .select('id,partner_id,name,category,description,price,images,is_featured,partners(id,name,whatsapp,phone,is_member)')
          .eq('status', 'approved')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('partner_categories').select('name').order('name'),
      ]);
      setProducts((prods as any) || []);
      setCategories((cats || []).map((c: any) => c.name));
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCat && p.category !== activeCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.partners?.name || '').toLowerCase().includes(q)
      );
    });
  }, [products, query, activeCat]);

  const featured = filtered.filter((p) => p.is_featured);
  const rest = filtered.filter((p) => !p.is_featured);

  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-4">
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: 'UnifrakturCook, serif' }}>Mercado Rarques</h1>
        <p className="text-gray-400 text-xs mt-1">Ofertas exclusivas de Empresas Membro verificadas</p>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar produtos, serviços..."
          className="w-full bg-gray-900 border border-gray-800 text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-yellow-500"
        />
      </div>

      {/* Carrossel de categorias */}
      {categories.length > 0 && (
        <div className="mb-5 -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 pb-1">
            <button
              onClick={() => setActiveCat(null)}
              className="flex flex-col items-center gap-1 min-w-[60px]"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${!activeCat ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-900 border-gray-800 text-gray-300'}`}>
                <Store size={20} />
              </div>
              <span className="text-[10px] text-gray-300">Tudo</span>
            </button>
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c] || Tag;
              const active = activeCat === c;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCat(active ? null : c)}
                  className="flex flex-col items-center gap-1 min-w-[60px]"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${active ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-900 border-gray-800 text-gray-300'}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] text-gray-300 text-center leading-tight max-w-[60px] truncate">{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm text-center py-10">Carregando…</p>}

      {!loading && featured.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white text-sm font-bold uppercase tracking-wider">Ofertas em Destaque</h2>
            <span className="text-yellow-500 text-[10px] font-semibold">DESTAQUE</span>
          </div>
          <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {featured.map((p) => (
                <ProductCard key={p.id} p={p} onClick={() => { setSelected(p); setImgIdx(0); }} compact />
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <div>
          <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-2">
            {activeCat ? activeCat : 'Todos os produtos'}
          </h2>
          {rest.length === 0 && featured.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 p-8 text-center">
              <ShoppingBag size={32} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400 text-sm">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {rest.map((p) => (
                <ProductCard key={p.id} p={p} onClick={() => { setSelected(p); setImgIdx(0); }} />
              ))}
            </div>
          )}
        </div>
      )}

      {selected && (
        <ProductModal
          product={selected}
          imgIdx={imgIdx}
          setImgIdx={setImgIdx}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function ProductCard({ p, onClick, compact }: { p: Product; onClick: () => void; compact?: boolean }) {
  const price = fmtPrice(p.price);
  return (
    <button
      onClick={onClick}
      className={`text-left bg-gray-900 border border-gray-800 hover:border-yellow-500/60 transition-colors overflow-hidden flex flex-col ${compact ? 'min-w-[130px] w-[130px]' : ''}`}
    >
      <div className="aspect-square bg-black relative overflow-hidden">
        {p.images?.[0] ? (
          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700">
            <ShoppingBag size={32} />
          </div>
        )}
        {p.partners?.is_member && (
          <span className="absolute top-1 left-1 bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
            Membro
          </span>
        )}
      </div>
      <div className="p-2 flex-1 flex flex-col">
        <p className="text-white text-xs font-semibold leading-tight line-clamp-2 mb-1">{p.name}</p>
        {price && <p className="text-yellow-500 text-sm font-bold">{price}</p>}
        {p.partners?.name && (
          <p className="text-gray-500 text-[10px] mt-0.5 truncate">{p.partners.name}</p>
        )}
      </div>
    </button>
  );
}

function ProductModal({
  product,
  imgIdx,
  setImgIdx,
  onClose,
}: {
  product: Product;
  imgIdx: number;
  setImgIdx: (n: number) => void;
  onClose: () => void;
}) {
  const price = fmtPrice(product.price);
  const wa = product.partners ? waLink(product.partners, product.name) : null;
  const imgs = product.images?.length ? product.images : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 w-full max-w-md max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 bg-black/70 border border-white/20 p-1.5 text-white"
          >
            <X size={16} />
          </button>
          <div className="aspect-square bg-black">
            {imgs[imgIdx] ? (
              <img src={imgs[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700">
                <ShoppingBag size={48} />
              </div>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-1 p-2 overflow-x-auto no-scrollbar">
              {imgs.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`shrink-0 w-14 h-14 border ${i === imgIdx ? 'border-yellow-500' : 'border-gray-700'}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4">
          {product.partners?.is_member && (
            <span className="inline-block bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider mb-2">
              Empresa Membro
            </span>
          )}
          <h3 className="text-white text-lg font-bold leading-tight">{product.name}</h3>
          {product.partners?.name && (
            <p className="text-gray-400 text-xs mt-1">Vendido por <span className="text-white">{product.partners.name}</span></p>
          )}
          {price && <p className="text-yellow-500 text-2xl font-bold mt-3">{price}</p>}
          {product.description && (
            <p className="text-gray-300 text-sm mt-3 whitespace-pre-line leading-relaxed">{product.description}</p>
          )}

          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle size={18} /> Falar no WhatsApp
            </a>
          ) : (
            <p className="mt-4 text-gray-500 text-xs text-center">Empresa sem WhatsApp cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
