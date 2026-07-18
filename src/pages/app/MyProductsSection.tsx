import { useState } from 'react';
import { Plus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketCategories } from '@/data/useMarketCategories';
import { optimizeImage } from '@/lib/imageOptimizer';

export type Product = {
  id: string;
  name: string;
  category: string | null;
  market_category_id: string | null;
  market_subcategory_id: string | null;
  description: string | null;
  price: number | null;
  images: string[];
  status: string;
  is_active: boolean;
  rejection_reason: string | null;
};

export function ProductForm({ partnerId, initial, onClose, onSaved }: {
  partnerId: string; initial: Product | null; onClose: () => void; onSaved: () => void;
}) {
  const { user } = useAuth();
  const { categories, subcategories, loading: catsLoading } = useMarketCategories(true);
  const [f, setF] = useState({
    name: initial?.name || '',
    market_category_id: initial?.market_category_id || '',
    market_subcategory_id: initial?.market_subcategory_id || '',
    description: initial?.description || '',
    price: initial?.price != null ? String(initial.price) : '',
    images: initial?.images || [],
    is_active: initial?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const subsForCat = subcategories.filter((s) => s.category_id === f.market_category_id);

  const upload = async (file: File) => {
    if (!user) return;
    if (f.images.length >= 4) { toast.error('Máximo de 4 fotos.'); return; }
    setUploading(true);
    try {
      const optimized = await optimizeImage(file, { maxDimension: 1400, quality: 0.85 });
      const path = `${user.id}/${Date.now()}.webp`;
      const { error } = await supabase.storage
        .from('partner-images')
        .upload(path, optimized, { upsert: false, contentType: 'image/webp' });
      if (error) { console.error(error); toast.error(error.message); return; }
      const { data } = supabase.storage.from('partner-images').getPublicUrl(path);
      setF((s) => ({ ...s, images: [...s.images, data.publicUrl] }));
    } finally {
      setUploading(false);
    }
  };

  const removeImg = (i: number) => setF((s) => ({ ...s, images: s.images.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!f.name.trim()) { toast.error('Nome é obrigatório.'); return; }
    if (!f.market_category_id) { toast.error('Selecione uma categoria.'); return; }
    if (!f.market_subcategory_id) { toast.error('Selecione uma subcategoria.'); return; }
    setSaving(true);
    const catName = categories.find((c) => c.id === f.market_category_id)?.name || null;
    const payload: any = {
      partner_id: partnerId,
      name: f.name.trim(),
      category: catName,
      market_category_id: f.market_category_id,
      market_subcategory_id: f.market_subcategory_id,
      description: f.description || null,
      price: f.price === '' ? null : Number(f.price),
      images: f.images,
      is_active: f.is_active,
      created_by: user?.id,
      ...(initial ? {} : { status: 'pending_curation' }),
    };
    const { error } = initial
      ? await supabase.from('marketplace_products').update(payload).eq('id', initial.id)
      : await supabase.from('marketplace_products').insert(payload);
    setSaving(false);
    if (error) { console.error(error); toast.error(error.message); } else { toast.success(initial ? 'Produto atualizado.' : 'Produto enviado para curadoria.'); onSaved(); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 w-full max-w-md max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h3 className="text-white font-semibold text-sm">{initial ? 'Editar produto' : 'Novo produto'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Nome do produto *</label>
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })}
              className="w-full bg-black border border-gray-700 text-white text-sm px-3 py-2 mt-1 outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Categoria *</label>
            <select
              value={f.market_category_id}
              onChange={(e) => setF({ ...f, market_category_id: e.target.value, market_subcategory_id: '' })}
              className="w-full bg-black border border-gray-700 text-white text-sm px-3 py-2 mt-1 outline-none focus:border-yellow-500"
            >
              <option value="">{catsLoading ? 'Carregando…' : 'Selecione uma categoria'}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Subcategoria *</label>
            <select
              value={f.market_subcategory_id}
              onChange={(e) => setF({ ...f, market_subcategory_id: e.target.value })}
              disabled={!f.market_category_id}
              className="w-full bg-black border border-gray-700 text-white text-sm px-3 py-2 mt-1 outline-none focus:border-yellow-500 disabled:opacity-50"
            >
              <option value="">{!f.market_category_id ? 'Selecione a categoria primeiro' : 'Selecione uma subcategoria'}</option>
              {subsForCat.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Preço (opcional)</label>
            <input type="number" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })}
              className="w-full bg-black border border-gray-700 text-white text-sm px-3 py-2 mt-1 outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Descrição</label>
            <textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })}
              className="w-full bg-black border border-gray-700 text-white text-sm px-3 py-2 mt-1 outline-none focus:border-yellow-500 resize-none" />
          </div>
          <div>
            <label className="text-[11px] uppercase text-gray-400 tracking-wider">Fotos ({f.images.length}/4)</label>
            <div className="grid grid-cols-4 gap-1 mt-1">
              {f.images.map((src, i) => (
                <div key={i} className="relative aspect-square bg-black border border-gray-700">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImg(i)} className="absolute -top-1 -right-1 bg-red-600 text-white p-0.5"><X size={10} /></button>
                </div>
              ))}
              {f.images.length < 4 && (
                <label className="aspect-square bg-black border border-dashed border-gray-600 flex items-center justify-center text-gray-500 cursor-pointer hover:border-yellow-500">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                </label>
              )}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />
            Ativo (visível quando aprovado)
          </label>
          {!initial && (
            <p className="text-yellow-400/80 text-[11px]">O produto ficará pendente de curadoria antes de aparecer no Mercado público.</p>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-xs uppercase text-gray-300 border border-gray-700">Cancelar</button>
          <button onClick={save} disabled={saving} className="px-3 py-2 text-xs uppercase font-semibold bg-yellow-500 hover:bg-yellow-400 text-black disabled:opacity-50">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
