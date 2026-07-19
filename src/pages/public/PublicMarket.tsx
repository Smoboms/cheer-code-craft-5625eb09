import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo, useState } from 'react';
import { Search, X, MessageCircle, Store, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/analytics';
import { useMarketCategories, MarketCategory } from '@/data/useMarketCategories';
import { useSeo } from '@/lib/useSeo';

type Product = {
  id: string;
  partner_id: string;
  name: string;
  category: string | null;
  market_category_id: string | null;
  market_subcategory_id: string | null;
  description: string | null;
  price: number | null;
  images: string[];
  is_featured: boolean;
  partners?: { id: string; name: string; whatsapp: string | null; phone: string | null; is_member: boolean } | null;
};

function fmtPrice(v: number | null) {
  if (v == null) return null;
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function waLink(p: NonNullable<Product['partners']>, productName: string) {
  const raw = (p.whatsapp || p.phone || '').replace(/\D/g, '');
  if (!raw) return null;
  const msg = encodeURIComponent(`Olá! Vi este produto (${productName}) na Cidade Inteligente Rarques e gostaria de mais informações.`);
  return `https://wa.me/${raw.startsWith('55') ? raw : '55' + raw}?text=${msg}`;
}

export default function PublicMarket() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<MarketCategory | null>(null);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [pickerCat, setPickerCat] = useState<MarketCategory | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [imgIdx, setImgIdx] = useState(0);

  const { categories, subcategories, loading: catsLoading } = useMarketCategories(true);

  useSeo({
    title: 'Mercado Rarques — Ofertas em Uruaçu',
    description: 'Produtos e ofertas exclusivas de Empresas Membro verificadas em Uruaçu. Mercado Rarques.',
    canonical: `${window.location.origin}/mercado`,
  });



  useEffect(() => {
    trackEvent('page_view', 'mercado', 'Mercado');
    (async () => {
      const { data: prods } = await supabase
        .from('marketplace_products')
        .select('id,partner_id,name,category,market_category_id,market_subcategory_id,description,price,images,is_featured,partners(id,name,whatsapp,phone,is_member)')
        .eq('status', 'approved')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      setProducts((prods as any) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCat && p.market_category_id !== activeCat.id) return false;
      if (activeSubId && p.market_subcategory_id !== activeSubId) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.partners?.name || '').toLowerCase().includes(q)
      );
    });
  }, [products, query, activeCat, activeSubId]);

  const featured = filtered.filter((p) => p.is_featured);
  const rest = filtered.filter((p) => !p.is_featured);

  const activeSubName = activeSubId ? subcategories.find((s) => s.id === activeSubId)?.name : null;

  const handleCatClick = (c: MarketCategory | null) => {
    if (!c) {
      setActiveCat(null); setActiveSubId(null); return;
    }
    setPickerCat(c);
  };

  const chooseSub = (subId: string | null) => {
    if (pickerCat) {
      setActiveCat(pickerCat);
      setActiveSubId(subId);
    }
    setPickerCat(null);
  };

  return (
    <div className="animate-fadeUp pb-4">
      <div className="mb-4">
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: 'UnifrakturCook, serif' }}>Mercado Rarques</h1>
        <p className="text-gray-400 text-xs mt-1">Ofertas exclusivas de Empresas Membro verificadas</p>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar produtos, serviços..."
          className="w-full bg-gray-900 border border-gray-800 text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-yellow-500"
        />
      </div>

      {/* Chips de categorias */}
      {!catsLoading && categories.length > 0 && (
        <div className="mb-4 -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-1">
            <button
              onClick={() => handleCatClick(null)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border ${!activeCat ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'}`}
            >
              <Store size={13} /> Todos
            </button>
            {categories.map((c) => {
              const active = activeCat?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCatClick(c)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold border ${active ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'}`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
          {activeCat && (
            <div className="flex items-center gap-2 mt-2 text-[11px]">
              <span className="text-gray-500">Categoria:</span>
              <span className="text-white font-semibold">{activeCat.name}</span>
              {activeSubName && <><span className="text-gray-600">›</span><span className="text-yellow-400 font-semibold">{activeSubName}</span></>}
              <button onClick={() => { setActiveCat(null); setActiveSubId(null); }} className="ml-auto text-gray-400 hover:text-white inline-flex items-center gap-1">
                <X size={12} /> Limpar
              </button>
            </div>
          )}
        </div>
      )}

      {loading && <div className="py-6"><CardGridSkeleton items={6} /></div>}

      {!loading && featured.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white text-sm font-bold uppercase tracking-wider">Ofertas em Destaque</h2>
            <span className="text-yellow-500 text-[10px] font-semibold">DESTAQUE</span>
          </div>
          <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {featured.map((p) => (
                <ProductCard key={p.id} p={p} onClick={() => { setSelected(p); setImgIdx(0); trackEvent('product_view', p.id, p.name, { featured: true }); }} compact />
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <div>
          <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-2">
            {activeCat ? (activeSubName || activeCat.name) : 'Todos os produtos'}
          </h2>
          {rest.length === 0 && featured.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 p-8 text-center">
              <ShoppingBag size={32} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400 text-sm">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
              {rest.map((p) => (
                <ProductCard key={p.id} p={p} onClick={() => { setSelected(p); setImgIdx(0); trackEvent('product_view', p.id, p.name); }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de subcategorias */}
      {pickerCat && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center" onClick={() => setPickerCat(null)}>
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">{pickerCat.name}</p>
                <h3 className="text-white font-semibold text-sm">Selecione uma subcategoria</h3>
              </div>
              <button onClick={() => setPickerCat(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-2">
              <button
                onClick={() => chooseSub(null)}
                className="w-full text-left px-3 py-2.5 text-sm text-white hover:bg-white/5 border-b border-gray-800"
              >
                Todas de {pickerCat.name}
              </button>
              {subcategories.filter((s) => s.category_id === pickerCat.id)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => chooseSub(s.id)}
                    className="w-full text-left px-3 py-2.5 text-sm text-white hover:bg-white/5 border-b border-gray-800 last:border-b-0"
                  >
                    {s.name}
                  </button>
                ))}
              {subcategories.filter((s) => s.category_id === pickerCat.id).length === 0 && (
                <p className="text-gray-500 text-xs p-4 text-center">Nenhuma subcategoria cadastrada.</p>
              )}
            </div>
          </div>
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
          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 w-full max-w-sm md:max-w-md max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <button onClick={onClose} className="absolute top-2 right-2 z-10 bg-black/70 border border-white/20 p-1.5 text-white">
            <X size={16} />
          </button>
          <div className="aspect-video bg-black">
            {imgs[imgIdx] ? (
              <img src={imgs[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700"><ShoppingBag size={48} /></div>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-1 p-2 overflow-x-auto no-scrollbar">
              {imgs.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`shrink-0 w-14 h-14 border ${i === imgIdx ? 'border-yellow-500' : 'border-gray-700'}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4">
          {product.partners?.is_member && (
            <span className="inline-block bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider mb-2">Empresa Membro</span>
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
            <a href={wa} target="_blank" rel="noreferrer" className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 flex items-center justify-center gap-2 transition-colors">
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
