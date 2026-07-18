import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Search, Loader2, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProductForm, type Product } from './MyProductsSection';

interface Props {
  onBack: () => void;
}

export function MyProductsPage({ onBack }: Props) {
  const { user } = useAuth();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data: partnerRows } = await supabase
      .from('partners')
      .select('id')
      .eq('created_by', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);
    const pid = partnerRows?.[0]?.id || null;
    setPartnerId(pid);
    if (pid) {
      const { data } = await supabase
        .from('marketplace_products')
        .select('*')
        .eq('partner_id', pid)
        .order('created_at', { ascending: false });
      setProducts((data as any) || []);
    } else {
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [products, query]);

  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Meus Produtos</h2>
          <p className="text-gray-400 text-sm">{products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        {partnerId && (
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold px-3 py-2 flex items-center gap-1 shrink-0"
          >
            <Plus size={14} /> Novo
          </button>
        )}
      </div>

      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar meus produtos…"
          className="w-full bg-black border border-gray-700 text-white pl-9 pr-3 py-2 text-sm outline-none focus:border-white"
        />
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm py-8 text-center"><Loader2 size={16} className="inline animate-spin" /> Carregando…</div>
      ) : !partnerId ? (
        <div className="bg-gray-900 border border-gray-800 p-4 flex items-start gap-3">
          <Package size={20} className="text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-semibold">Mercado Rarques</p>
            <p className="text-gray-400 text-xs mt-1">Salve os dados da sua empresa em "Configurar Minha Empresa" para liberar o cadastro de produtos.</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          {query ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => { setEditing(p); setShowForm(true); }}
              className="aspect-square bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors p-3 text-left flex items-center justify-center"
            >
              <p className="text-white text-xs font-semibold text-center line-clamp-4 break-words">{p.name}</p>
            </button>
          ))}
        </div>
      )}

      {showForm && partnerId && (
        <ProductForm
          partnerId={partnerId}
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
